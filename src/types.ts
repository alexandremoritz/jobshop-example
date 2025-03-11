export interface Task {
  id: string;
  jobId: number;
  machineId: number;
  duration: number;
  startTime?: number;
  priority?: number;
  deadline?: number;
  setupTime?: number;
  maintenanceAware?: boolean;
}

export interface Job {
  id: number;
  tasks: Task[];
  priority?: number;
  deadline?: number;
}

export interface ScheduleResult {
  schedule: Task[];
  makespan: number;
}

export interface ValidationError {
  jobId: number;
  taskId?: string;
  message: string;
}

export type SchedulingAlgorithm = 'priority' | 'fifo' | 'edd' | 'maintenance-aware' | 'dynamic';

export interface ScheduleConfig {
  algorithm: SchedulingAlgorithm;
  considerMaintenance: boolean;
  maintenanceWindows?: MaintenanceWindow[];
  optimizeMaintenance?: boolean;
  balanceLoad?: boolean;
  minimizeSetup?: boolean;
}

export interface MaintenanceWindow {
  id: string;
  machineId: number;
  startTime: number;
  duration: number;
  flexible?: boolean;
  minStartTime?: number;
  maxStartTime?: number;
  priority?: number;
}

export interface ScheduleMetrics {
  machineUtilization: { [key: number]: number };
  averageWaitTime: number;
  criticalPath: Task[];
  maintenanceEfficiency?: number;
  setupTimeTotal?: number;
  deadlineMisses?: number;
}