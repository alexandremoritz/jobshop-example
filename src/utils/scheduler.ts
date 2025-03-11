import { Job, Task, ScheduleResult, ScheduleConfig, MaintenanceWindow, ScheduleMetrics } from '../types';

interface TimeWindow {
  start: number;
  end: number;
  type: 'task' | 'maintenance';
  id: string;
}

function findEarliestAvailableTime(
  task: Task,
  schedule: Task[],
  maintenanceWindows: MaintenanceWindow[],
  earliestStart: number
): number {
  // Get all occupied time slots for this machine
  const occupiedSlots = [
    ...schedule
      .filter(t => t.machineId === task.machineId)
      .map(t => ({
        start: t.startTime || 0,
        end: (t.startTime || 0) + t.duration
      })),
    ...maintenanceWindows
      .filter(w => w.machineId === task.machineId)
      .map(w => ({
        start: w.startTime,
        end: w.startTime + w.duration
      }))
  ].sort((a, b) => a.start - b.start);

  let availableTime = earliestStart;

  // Check each occupied slot for conflicts
  for (const slot of occupiedSlots) {
    if (availableTime + task.duration <= slot.start) {
      // Found a gap big enough for our task
      break;
    }
    if (availableTime < slot.end) {
      // Move to the end of the current occupied slot
      availableTime = slot.end;
    }
  }

  return availableTime;
}

function calculateTaskPriority(task: Task, jobTasks: Task[]): number {
  const taskIndex = jobTasks.findIndex(t => t.id === task.id);
  const remainingDuration = jobTasks
    .slice(taskIndex)
    .reduce((sum, t) => sum + t.duration, 0);
  const totalJobDuration = jobTasks.reduce((sum, t) => sum + t.duration, 0);
  
  return (
    remainingDuration * 0.5 +
    (totalJobDuration - taskIndex) * 0.3 +
    task.duration * 0.2
  );
}

function findCriticalPath(schedule: Task[]): Task[] {
  const paths: Task[][] = [];
  const jobGroups = schedule.reduce((groups: { [key: number]: Task[] }, task) => {
    groups[task.jobId] = groups[task.jobId] || [];
    groups[task.jobId].push(task);
    return groups;
  }, {});

  Object.values(jobGroups).forEach(jobTasks => {
    const sortedTasks = jobTasks.sort((a, b) => 
      (a.startTime || 0) - (b.startTime || 0));
    paths.push(sortedTasks);
  });

  return paths.reduce((longest, current) => {
    const longestDuration = longest.reduce((sum, task) => 
      sum + task.duration, 0);
    const currentDuration = current.reduce((sum, task) => 
      sum + task.duration, 0);
    return currentDuration > longestDuration ? current : longest;
  }, paths[0] || []);
}

function calculateMetrics(
  schedule: Task[],
  makespan: number,
  maintenanceWindows: MaintenanceWindow[]
): ScheduleMetrics {
  // Calculate machine utilization
  const machineUtilization: { [key: number]: number } = {};
  const machineWorkTime: { [key: number]: number } = {};
  
  schedule.forEach(task => {
    machineWorkTime[task.machineId] = (machineWorkTime[task.machineId] || 0) + task.duration;
  });
  
  maintenanceWindows.forEach(window => {
    machineWorkTime[window.machineId] = (machineWorkTime[window.machineId] || 0) + window.duration;
  });
  
  Object.keys(machineWorkTime).forEach(machineId => {
    machineUtilization[machineId] = makespan > 0 ? 
      (machineWorkTime[machineId] / makespan) * 100 : 0;
  });

  // Calculate average wait time
  const waitTimes: number[] = [];
  schedule.forEach(task => {
    const jobTasks = schedule.filter(t => t.jobId === task.jobId);
    const taskIndex = jobTasks.findIndex(t => t.id === task.id);
    if (taskIndex > 0) {
      const prevTask = jobTasks[taskIndex - 1];
      const waitTime = (task.startTime || 0) - 
        ((prevTask.startTime || 0) + prevTask.duration);
      waitTimes.push(Math.max(0, waitTime));
    }
  });
  
  const averageWaitTime = waitTimes.length > 0 ? 
    waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0;

  // Find critical path
  const criticalPath = findCriticalPath(schedule);

  return {
    machineUtilization,
    averageWaitTime,
    criticalPath
  };
}

export function scheduleJobs(
  jobs: Job[],
  config: ScheduleConfig
): { schedule: Task[]; makespan: number; metrics: ScheduleMetrics } {
  if (!jobs.length) {
    return {
      schedule: [],
      makespan: 0,
      metrics: {
        machineUtilization: {},
        averageWaitTime: 0,
        criticalPath: []
      }
    };
  }

  const maintenanceWindows = config.maintenanceWindows || [];
  const schedule: Task[] = [];
  const jobEndTimes: { [key: number]: number } = {};

  // Prepare tasks based on selected algorithm
  let allTasks = jobs.flatMap(job => 
    job.tasks.map(task => ({
      ...task,
      startTime: undefined
    }))
  );

  switch (config.algorithm) {
    case 'edd':
      allTasks.sort((a, b) => a.duration - b.duration);
      break;
    case 'fifo':
      // Keep original order
      break;
    case 'priority':
    default:
      allTasks = allTasks.map(task => ({
        ...task,
        priority: calculateTaskPriority(task, jobs[task.jobId].tasks)
      })).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  // Main scheduling loop
  while (allTasks.length > 0) {
    // Find available tasks (tasks whose predecessors are all scheduled)
    const availableTasks = allTasks.filter(task => {
      const jobTasks = jobs[task.jobId].tasks;
      const taskIndex = jobTasks.findIndex(t => t.id === task.id);
      return taskIndex === 0 || jobTasks
        .slice(0, taskIndex)
        .every(t => schedule.find(st => st.id === t.id));
    });

    if (availableTasks.length === 0) break;

    // Find the best task to schedule
    let bestTask = availableTasks[0];
    let bestStartTime = Infinity;

    for (const task of availableTasks) {
      const jobLastEnd = jobEndTimes[task.jobId] || 0;
      const startTime = findEarliestAvailableTime(
        task,
        schedule,
        maintenanceWindows,
        jobLastEnd
      );

      if (startTime < bestStartTime) {
        bestStartTime = startTime;
        bestTask = task;
      }
    }

    // Schedule the best task
    schedule.push({ ...bestTask, startTime: bestStartTime });
    jobEndTimes[bestTask.jobId] = bestStartTime + bestTask.duration;

    // Remove scheduled task
    allTasks = allTasks.filter(t => t.id !== bestTask.id);
  }

  const makespan = schedule.length > 0
    ? Math.max(...schedule.map(task => (task.startTime || 0) + task.duration))
    : 0;

  const metrics = calculateMetrics(schedule, makespan, maintenanceWindows);

  return { schedule, makespan, metrics };
}