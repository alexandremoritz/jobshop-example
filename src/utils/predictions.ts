import { Task, SchedulePrediction, EfficiencyRecommendation } from '../types';

export function generateSchedulePredictions(schedule: Task[], makespan: number): SchedulePrediction {
  // Calculate estimated completion time
  const now = new Date();
  const completionTime = new Date(now.getTime() + makespan * 60000); // Assuming 1 unit = 1 minute

  // Calculate confidence based on schedule complexity
  const uniqueMachines = new Set(schedule.map(task => task.machineId)).size;
  const totalTasks = schedule.length;
  const confidence = Math.max(0, Math.min(100, 100 - (uniqueMachines * 5) - (totalTasks * 2)));

  // Identify risk factors
  const riskFactors: string[] = [];
  
  if (uniqueMachines > 3) {
    riskFactors.push('Complex machine coordination required');
  }
  
  const maxTaskDuration = Math.max(...schedule.map(task => task.duration));
  if (maxTaskDuration > 10) {
    riskFactors.push('Long-duration tasks present');
  }

  const machineLoads = schedule.reduce((acc, task) => {
    acc[task.machineId] = (acc[task.machineId] || 0) + task.duration;
    return acc;
  }, {} as Record<number, number>);

  const loadVariance = Object.values(machineLoads).reduce((acc, load) => acc + Math.abs(load - makespan/2), 0);
  if (loadVariance > makespan) {
    riskFactors.push('Uneven machine workload distribution');
  }

  return {
    completionTime: completionTime.toISOString(),
    confidence,
    riskFactors
  };
}

export function generateEfficiencyRecommendations(
  schedule: Task[],
  makespan: number
): EfficiencyRecommendation[] {
  const recommendations: EfficiencyRecommendation[] = [];

  // Analyze machine utilization
  const machineLoads = schedule.reduce((acc, task) => {
    acc[task.machineId] = (acc[task.machineId] || 0) + task.duration;
    return acc;
  }, {} as Record<number, number>);

  const avgLoad = Object.values(machineLoads).reduce((a, b) => a + b, 0) / Object.keys(machineLoads).length;
  const maxLoad = Math.max(...Object.values(machineLoads));
  const minLoad = Math.min(...Object.values(machineLoads));

  if (maxLoad - minLoad > avgLoad * 0.5) {
    recommendations.push({
      type: 'critical',
      title: 'Balance Machine Workload',
      description: 'Significant workload imbalance detected. Consider redistributing tasks across machines.',
      potentialImprovement: Math.round((maxLoad - avgLoad) / maxLoad * 100)
    });
  }

  // Analyze task sequencing
  const jobDelays = schedule.reduce((acc, task) => {
    if (!acc[task.jobId]) {
      acc[task.jobId] = { tasks: [], totalDelay: 0 };
    }
    acc[task.jobId].tasks.push(task);
    return acc;
  }, {} as Record<number, { tasks: Task[], totalDelay: number }>);

  Object.values(jobDelays).forEach(({ tasks }) => {
    tasks.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
    for (let i = 1; i < tasks.length; i++) {
      const delay = (tasks[i].startTime || 0) - ((tasks[i-1].startTime || 0) + tasks[i-1].duration);
      if (delay > 2) {
        recommendations.push({
          type: 'warning',
          title: 'Reduce Task Gaps',
          description: `Large gap detected between tasks in Job ${tasks[0].jobId + 1}. Consider tightening task sequence.`,
          potentialImprovement: Math.round(delay / makespan * 100)
        });
        break;
      }
    }
  });

  // Analyze resource utilization
  const resourceUtilization = Object.values(machineLoads).map(load => load / makespan * 100);
  const lowUtilizedMachines = resourceUtilization.filter(util => util < 60).length;

  if (lowUtilizedMachines > 0) {
    recommendations.push({
      type: 'improvement',
      title: 'Optimize Resource Usage',
      description: `${lowUtilizedMachines} machine(s) have utilization below 60%. Consider consolidating tasks.`,
      potentialImprovement: Math.round((60 - Math.min(...resourceUtilization)) / 2)
    });
  }

  return recommendations;
}