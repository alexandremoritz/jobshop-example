import { Job, MaintenanceWindow } from '../types';

export interface Example {
  name: string;
  description: string;
  jobs: Job[];
  maintenanceWindows?: MaintenanceWindow[];
}

export const examples: Example[] = [
  {
    name: "Simple 2x2",
    description: "2 jobs with 2 tasks each",
    jobs: [
      {
        id: 0,
        tasks: [
          { id: '0-0', jobId: 0, machineId: 0, duration: 3 },
          { id: '0-1', jobId: 0, machineId: 1, duration: 2 }
        ]
      },
      {
        id: 1,
        tasks: [
          { id: '1-0', jobId: 1, machineId: 1, duration: 2 },
          { id: '1-1', jobId: 1, machineId: 0, duration: 4 }
        ]
      }
    ]
  },
  {
    name: "3x3 Problem",
    description: "3 jobs with 3 tasks each",
    jobs: [
      {
        id: 0,
        tasks: [
          { id: '0-0', jobId: 0, machineId: 0, duration: 3 },
          { id: '0-1', jobId: 0, machineId: 1, duration: 2 },
          { id: '0-2', jobId: 0, machineId: 2, duration: 2 }
        ]
      },
      {
        id: 1,
        tasks: [
          { id: '1-0', jobId: 1, machineId: 1, duration: 2 },
          { id: '1-1', jobId: 1, machineId: 2, duration: 3 },
          { id: '1-2', jobId: 1, machineId: 0, duration: 4 }
        ]
      },
      {
        id: 2,
        tasks: [
          { id: '2-0', jobId: 2, machineId: 2, duration: 3 },
          { id: '2-1', jobId: 2, machineId: 0, duration: 2 },
          { id: '2-2', jobId: 2, machineId: 1, duration: 3 }
        ]
      }
    ]
  },
  {
    name: "Complex 4x3",
    description: "4 jobs with varying number of tasks",
    jobs: [
      {
        id: 0,
        tasks: [
          { id: '0-0', jobId: 0, machineId: 0, duration: 4 },
          { id: '0-1', jobId: 0, machineId: 1, duration: 3 },
          { id: '0-2', jobId: 0, machineId: 2, duration: 2 }
        ]
      },
      {
        id: 1,
        tasks: [
          { id: '1-0', jobId: 1, machineId: 1, duration: 3 },
          { id: '1-1', jobId: 1, machineId: 2, duration: 4 }
        ]
      },
      {
        id: 2,
        tasks: [
          { id: '2-0', jobId: 2, machineId: 0, duration: 3 },
          { id: '2-1', jobId: 2, machineId: 2, duration: 2 },
          { id: '2-2', jobId: 2, machineId: 1, duration: 4 }
        ]
      },
      {
        id: 3,
        tasks: [
          { id: '3-0', jobId: 3, machineId: 2, duration: 2 },
          { id: '3-1', jobId: 3, machineId: 0, duration: 3 }
        ]
      }
    ]
  },
  {
    name: "Manufacturing Line",
    description: "6 jobs with maintenance windows on critical machines",
    jobs: [
      {
        id: 0,
        tasks: [
          { id: '0-0', jobId: 0, machineId: 0, duration: 5 },
          { id: '0-1', jobId: 0, machineId: 1, duration: 4 },
          { id: '0-2', jobId: 0, machineId: 2, duration: 3 }
        ]
      },
      {
        id: 1,
        tasks: [
          { id: '1-0', jobId: 1, machineId: 2, duration: 4 },
          { id: '1-1', jobId: 1, machineId: 0, duration: 3 },
          { id: '1-2', jobId: 1, machineId: 1, duration: 5 }
        ]
      },
      {
        id: 2,
        tasks: [
          { id: '2-0', jobId: 2, machineId: 1, duration: 3 },
          { id: '2-1', jobId: 2, machineId: 2, duration: 4 },
          { id: '2-2', jobId: 2, machineId: 0, duration: 3 }
        ]
      },
      {
        id: 3,
        tasks: [
          { id: '3-0', jobId: 3, machineId: 0, duration: 4 },
          { id: '3-1', jobId: 3, machineId: 2, duration: 5 },
          { id: '3-2', jobId: 3, machineId: 1, duration: 3 }
        ]
      },
      {
        id: 4,
        tasks: [
          { id: '4-0', jobId: 4, machineId: 2, duration: 3 },
          { id: '4-1', jobId: 4, machineId: 1, duration: 4 },
          { id: '4-2', jobId: 4, machineId: 0, duration: 5 }
        ]
      },
      {
        id: 5,
        tasks: [
          { id: '5-0', jobId: 5, machineId: 1, duration: 5 },
          { id: '5-1', jobId: 5, machineId: 0, duration: 4 },
          { id: '5-2', jobId: 5, machineId: 2, duration: 3 }
        ]
      }
    ],
    maintenanceWindows: [
      { id: 'mw-1', machineId: 0, startTime: 10, duration: 2 },
      { id: 'mw-2', machineId: 1, startTime: 15, duration: 3 },
      { id: 'mw-3', machineId: 2, startTime: 20, duration: 2 }
    ]
  },
  {
    name: "High-Tech Assembly",
    description: "5 jobs across 4 machines with periodic maintenance",
    jobs: [
      {
        id: 0,
        tasks: [
          { id: '0-0', jobId: 0, machineId: 0, duration: 6 },
          { id: '0-1', jobId: 0, machineId: 2, duration: 4 },
          { id: '0-2', jobId: 0, machineId: 3, duration: 5 },
          { id: '0-3', jobId: 0, machineId: 1, duration: 3 }
        ]
      },
      {
        id: 1,
        tasks: [
          { id: '1-0', jobId: 1, machineId: 1, duration: 5 },
          { id: '1-1', jobId: 1, machineId: 3, duration: 4 },
          { id: '1-2', jobId: 1, machineId: 0, duration: 6 },
          { id: '1-3', jobId: 1, machineId: 2, duration: 5 }
        ]
      },
      {
        id: 2,
        tasks: [
          { id: '2-0', jobId: 2, machineId: 2, duration: 4 },
          { id: '2-1', jobId: 2, machineId: 0, duration: 5 },
          { id: '2-2', jobId: 2, machineId: 1, duration: 6 },
          { id: '2-3', jobId: 2, machineId: 3, duration: 4 }
        ]
      },
      {
        id: 3,
        tasks: [
          { id: '3-0', jobId: 3, machineId: 3, duration: 5 },
          { id: '3-1', jobId: 3, machineId: 1, duration: 4 },
          { id: '3-2', jobId: 3, machineId: 2, duration: 6 },
          { id: '3-3', jobId: 3, machineId: 0, duration: 5 }
        ]
      },
      {
        id: 4,
        tasks: [
          { id: '4-0', jobId: 4, machineId: 0, duration: 4 },
          { id: '4-1', jobId: 4, machineId: 3, duration: 6 },
          { id: '4-2', jobId: 4, machineId: 1, duration: 5 },
          { id: '4-3', jobId: 4, machineId: 2, duration: 4 }
        ]
      }
    ],
    maintenanceWindows: [
      { id: 'mw-1', machineId: 0, startTime: 8, duration: 2 },
      { id: 'mw-2', machineId: 1, startTime: 12, duration: 3 },
      { id: 'mw-3', machineId: 2, startTime: 16, duration: 2 },
      { id: 'mw-4', machineId: 3, startTime: 20, duration: 2 },
      { id: 'mw-5', machineId: 0, startTime: 24, duration: 2 }
    ]
  },
  {
    name: "Large Scale Production",
    description: "12 jobs across 20 machines with complex routing",
    jobs: Array.from({ length: 12 }, (_, jobId) => ({
      id: jobId,
      tasks: Array.from({ length: Math.floor(Math.random() * 6) + 3 }, (_, taskIndex) => ({
        id: `${jobId}-${taskIndex}`,
        jobId,
        machineId: Math.floor(Math.random() * 20),
        duration: Math.floor(Math.random() * 6) + 2
      }))
    })),
    maintenanceWindows: Array.from({ length: 10 }, (_, i) => ({
      id: `mw-${i}`,
      machineId: Math.floor(Math.random() * 20),
      startTime: Math.floor(Math.random() * 30) + 5,
      duration: Math.floor(Math.random() * 3) + 1
    }))
  },
  {
    name: "Semiconductor Fab",
    description: "15 jobs with strict sequential processing on 15 machines",
    jobs: Array.from({ length: 15 }, (_, jobId) => ({
      id: jobId,
      tasks: Array.from({ length: 8 }, (_, taskIndex) => ({
        id: `${jobId}-${taskIndex}`,
        jobId,
        machineId: taskIndex * 2 % 15,
        duration: Math.floor(Math.random() * 4) + 3
      }))
    })),
    maintenanceWindows: Array.from({ length: 8 }, (_, i) => ({
      id: `mw-${i}`,
      machineId: i * 2 % 15,
      startTime: 10 + i * 5,
      duration: 2
    }))
  },
  {
    name: "Automotive Assembly",
    description: "20 jobs with parallel processing on 18 machines",
    jobs: Array.from({ length: 20 }, (_, jobId) => ({
      id: jobId,
      tasks: Array.from({ length: 10 }, (_, taskIndex) => ({
        id: `${jobId}-${taskIndex}`,
        jobId,
        machineId: Math.floor(taskIndex / 2) * 3 % 18,
        duration: Math.floor(Math.random() * 5) + 2
      }))
    })),
    maintenanceWindows: Array.from({ length: 12 }, (_, i) => ({
      id: `mw-${i}`,
      machineId: i * 2 % 18,
      startTime: Math.floor(i * 8),
      duration: Math.floor(Math.random() * 2) + 1
    }))
  }
];