import React, { useState } from 'react';
import { Job, ScheduleResult, ScheduleConfig } from './types';
import JobInput from './components/JobInput';
import ScheduleVisualization from './components/ScheduleVisualization';
import ScheduleMetrics from './components/ScheduleMetrics';
import { scheduleJobs } from './utils/scheduler';
import { Factory } from 'lucide-react';

export default function App() {
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult & { metrics?: any } | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ScheduleConfig | null>(null);

  const handleSchedule = (jobs: Job[], config: ScheduleConfig) => {
    const result = scheduleJobs(jobs, config);
    setScheduleResult(result);
    setCurrentConfig(config);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Factory className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Job Shop Scheduler
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <JobInput onSubmit={handleSchedule} />
          {scheduleResult && (
            <>
              <ScheduleVisualization
                schedule={scheduleResult.schedule}
                makespan={scheduleResult.makespan}
                maintenanceWindows={currentConfig?.maintenanceWindows || []}
              />
              {scheduleResult.metrics && (
                <ScheduleMetrics
                  machineUtilization={scheduleResult.metrics.machineUtilization}
                  averageWaitTime={scheduleResult.metrics.averageWaitTime}
                  criticalPath={scheduleResult.metrics.criticalPath}
                  makespan={scheduleResult.makespan}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}