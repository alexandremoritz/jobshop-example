import { Job, Task, MaintenanceWindow, ValidationError, ScheduleResult } from '../types';

export function validateJobs(jobs: Job[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (jobs.length === 0) {
    errors.push({ jobId: -1, message: 'At least one job is required' });
    return errors;
  }

  jobs.forEach(job => {
    // Validate job has tasks
    if (job.tasks.length === 0) {
      errors.push({ jobId: job.id, message: 'Job must have at least one task' });
      return;
    }

    // Only validate machine ID and duration
    job.tasks.forEach(task => {
      if (task.machineId < 0) {
        errors.push({
          jobId: job.id,
          taskId: task.id,
          message: 'Machine ID must be non-negative'
        });
      }

      if (task.duration <= 0) {
        errors.push({
          jobId: job.id,
          taskId: task.id,
          message: 'Duration must be positive'
        });
      }
    });
  });

  return errors;
}

export function validateMaintenanceWindows(maintenanceWindows: MaintenanceWindow[]): string[] {
  const errors: string[] = [];

  maintenanceWindows.forEach((window, index) => {
    if (typeof window.machineId !== 'number' || window.machineId < 0) {
      errors.push(`Maintenance window ${index + 1}: Invalid machine ID`);
    }
    if (typeof window.startTime !== 'number' || window.startTime < 0) {
      errors.push(`Maintenance window ${index + 1}: Invalid start time`);
    }
    if (typeof window.duration !== 'number' || window.duration <= 0) {
      errors.push(`Maintenance window ${index + 1}: Invalid duration`);
    }
  });

  return errors;
}

interface TimeSlot {
  start: number;
  end: number;
  type: 'task' | 'maintenance';
  id: string;
  jobId?: number;
}

export function validateSchedule(result: ScheduleResult, maintenanceWindows: MaintenanceWindow[] = []): string[] {
  const errors: string[] = [];
  const { schedule } = result;

  // Create a timeline for each machine
  const machineTimelines = new Map<number, TimeSlot[]>();

  // Add tasks to timelines
  schedule.forEach(task => {
    if (task.startTime === undefined) {
      errors.push(`Task ${task.id} (Job ${task.jobId + 1}) has no start time`);
      return;
    }

    const timeline = machineTimelines.get(task.machineId) || [];
    timeline.push({
      start: task.startTime,
      end: task.startTime + task.duration,
      type: 'task',
      id: task.id,
      jobId: task.jobId
    });
    machineTimelines.set(task.machineId, timeline);
  });

  // Add maintenance windows to timelines
  maintenanceWindows.forEach(window => {
    const timeline = machineTimelines.get(window.machineId) || [];
    timeline.push({
      start: window.startTime,
      end: window.startTime + window.duration,
      type: 'maintenance',
      id: window.id
    });
    machineTimelines.set(window.machineId, timeline);
  });

  // Check for overlaps in each machine's timeline
  machineTimelines.forEach((timeline, machineId) => {
    // Sort timeline by start time
    timeline.sort((a, b) => a.start - b.start);

    // Check for overlaps
    for (let i = 0; i < timeline.length - 1; i++) {
      const current = timeline[i];
      const next = timeline[i + 1];

      if (current.end > next.start) {
        const errorMsg = `Overlap detected on Machine ${machineId}: ` +
          (current.type === 'task' 
            ? `Job ${current.jobId! + 1} (${current.start}-${current.end})` 
            : `Maintenance (${current.start}-${current.end})`) +
          ` overlaps with ` +
          (next.type === 'task'
            ? `Job ${next.jobId! + 1} (${next.start}-${next.end})`
            : `Maintenance (${next.start}-${next.end})`);
        errors.push(errorMsg);
      }
    }
  });

  // Validate job task sequence
  const jobSequences = new Map<number, Task[]>();
  schedule.forEach(task => {
    const sequence = jobSequences.get(task.jobId) || [];
    sequence.push(task);
    jobSequences.set(task.jobId, sequence);
  });

  jobSequences.forEach((tasks, jobId) => {
    tasks.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
    for (let i = 0; i < tasks.length - 1; i++) {
      const current = tasks[i];
      const next = tasks[i + 1];
      if ((current.startTime || 0) + current.duration > (next.startTime || 0)) {
        errors.push(
          `Invalid task sequence in Job ${jobId + 1}: Task on Machine ${current.machineId} ` +
          `must complete before task on Machine ${next.machineId} can start`
        );
      }
    }
  });

  return errors;
}