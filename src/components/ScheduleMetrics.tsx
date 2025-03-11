import React from 'react';
import { BarChart as BarChartIcon, Timer, GitCommit, TrendingUp, Clock, Activity } from 'lucide-react';
import { Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ScheduleMetricsProps {
  machineUtilization: { [key: number]: number };
  averageWaitTime: number;
  criticalPath: Task[];
  makespan: number;
}

export default function ScheduleMetrics({ 
  machineUtilization, 
  averageWaitTime, 
  criticalPath,
  makespan 
}: ScheduleMetricsProps) {
  const utilizationData = Object.entries(machineUtilization).map(([machineId, utilization]) => ({
    machine: `Machine ${machineId}`,
    utilization: parseFloat(utilization.toFixed(1))
  }));

  const totalUtilization = Object.values(machineUtilization).reduce((sum, val) => sum + val, 0) / Object.keys(machineUtilization).length;
  const maxUtilization = Math.max(...Object.values(machineUtilization));
  const minUtilization = Math.min(...Object.values(machineUtilization));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <BarChartIcon className="mr-2" /> Schedule Analysis
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Machine Utilization Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Machine Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="machine" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="utilization" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Utilization Stats */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="mr-2" /> Utilization Statistics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Average Utilization</div>
              <div className="text-2xl font-bold text-blue-600">
                {totalUtilization.toFixed(1)}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Peak Utilization</div>
                <div className="text-xl font-semibold text-green-600">
                  {maxUtilization.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Minimum Utilization</div>
                <div className="text-xl font-semibold text-red-600">
                  {minUtilization.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timing Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Timer className="mr-2" /> Timing Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Makespan</div>
                <div className="text-2xl font-bold text-indigo-600">{makespan} hours</div>
              </div>
              <Clock size={32} className="text-indigo-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Average Wait Time</div>
                <div className="text-2xl font-bold text-purple-600">
                  {averageWaitTime.toFixed(1)} hours
                </div>
              </div>
              <TrendingUp size={32} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Critical Path Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <GitCommit className="mr-2" /> Critical Path
          </h3>
          <div className="space-y-3">
            {criticalPath.map((task, index) => (
              <div 
                key={task.id} 
                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <div className="font-medium">Job {task.jobId + 1}</div>
                  <div className="text-sm text-gray-600">
                    Machine {task.machineId} • {task.duration} hours
                  </div>
                </div>
                {index < criticalPath.length - 1 && (
                  <div className="text-blue-500">
                    <GitCommit size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}