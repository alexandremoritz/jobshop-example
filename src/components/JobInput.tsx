import React, { useState } from 'react';
import { Plus, Minus, AlertCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Job, Task, ValidationError, ScheduleConfig, MaintenanceWindow } from '../types';
import { examples } from '../utils/examples';
import { validateJobs, validateSchedule } from '../utils/validation';
import { scheduleJobs } from '../utils/scheduler';
import MaintenanceInput from './MaintenanceInput';

interface JobInputProps {
  onSubmit: (jobs: Job[], config: ScheduleConfig) => void;
}

export default function JobInput({ onSubmit }: JobInputProps) {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 0,
      tasks: [{ id: '0-0', jobId: 0, machineId: 0, duration: 3 }]
    }
  ]);

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [config, setConfig] = useState<ScheduleConfig>({
    algorithm: 'priority',
    considerMaintenance: false,
    maintenanceWindows: []
  });

  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedJobs, setExpandedJobs] = useState<number[]>([0]);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  const validateAndSubmit = () => {
    const validationErrors = validateJobs(jobs);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      const finalConfig = {
        ...config,
        maintenanceWindows: config.considerMaintenance ? maintenanceWindows : []
      };
      
      // First schedule the jobs
      const result = scheduleJobs(jobs, finalConfig);
      
      // Then validate the schedule
      const scheduleErrors = validateSchedule(result, finalConfig.maintenanceWindows);
      
      if (scheduleErrors.length > 0) {
        setErrors([
          ...validationErrors,
          ...scheduleErrors.map(error => ({
            jobId: -1,
            message: error
          }))
        ]);
        return;
      }
      
      onSubmit(jobs, finalConfig);
    }
  };

  const addJob = () => {
    const newJobId = jobs.length;
    setJobs([
      ...jobs,
      {
        id: newJobId,
        tasks: [{ id: `${newJobId}-0`, jobId: newJobId, machineId: 0, duration: 3 }]
      }
    ]);
    setExpandedJobs([...expandedJobs, newJobId]);
  };

  const toggleJob = (jobId: number) => {
    setExpandedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const filteredExamples = examples.filter(example => 
    example.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    example.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadExample = (exampleIndex: number) => {
    const example = examples[exampleIndex];
    if (example) {
      setJobs(JSON.parse(JSON.stringify(example.jobs)));
      setMaintenanceWindows(example.maintenanceWindows || []);
      setConfig(prev => ({
        ...prev,
        considerMaintenance: Boolean(example.maintenanceWindows?.length),
        maintenanceWindows: example.maintenanceWindows || []
      }));
      setErrors([]);
      setSelectedExample(exampleIndex);
      setExpandedJobs([0]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Example Configurations
          </label>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search examples..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {filteredExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => loadExample(index)}
                className={`p-4 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left transition-colors ${
                  selectedExample === index ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{example.name}</div>
                <div className="text-sm text-gray-500 mt-1">{example.description}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {example.jobs.length} Jobs
                  </span>
                  {example.maintenanceWindows && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {example.maintenanceWindows.length} Maintenance
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduling Algorithm
            </label>
            <select
              value={config.algorithm}
              onChange={(e) => setConfig({ ...config, algorithm: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="priority">Priority-based</option>
              <option value="fifo">First In, First Out</option>
              <option value="edd">Earliest Due Date</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.considerMaintenance}
                onChange={(e) => setConfig({ ...config, considerMaintenance: e.target.checked })}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Consider Maintenance</span>
            </label>
          </div>

          {config.considerMaintenance && (
            <div className="mb-6">
              <MaintenanceInput
                maintenanceWindows={maintenanceWindows}
                onChange={setMaintenanceWindows}
              />
            </div>
          )}
        </div>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertCircle size={20} />
              <h3 className="font-medium">Validation Errors</h3>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-red-600">
                  {error.jobId >= 0 ? `Job ${error.jobId + 1}: ` : ''}{error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleJob(job.id)}
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Job {job.id + 1}
                  <span className="text-sm font-normal text-gray-500">
                    ({job.tasks.length} tasks)
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (jobs.length > 1) {
                        setJobs(jobs.filter(j => j.id !== job.id));
                        setExpandedJobs(prev => prev.filter(id => id !== job.id));
                      }
                    }}
                    className={`text-red-500 hover:text-red-700 ${jobs.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Minus size={20} />
                  </button>
                  {expandedJobs.includes(job.id) ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedJobs.includes(job.id) && (
                <div className="mt-4 space-y-4">
                  {job.tasks.map((task, taskIndex) => (
                    <div key={task.id} className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Machine
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={task.machineId}
                          onChange={(e) => {
                            const newJobs = [...jobs];
                            newJobs[job.id].tasks[taskIndex].machineId = parseInt(e.target.value) || 0;
                            setJobs(newJobs);
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Duration (hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={task.duration}
                          onChange={(e) => {
                            const newJobs = [...jobs];
                            newJobs[job.id].tasks[taskIndex].duration = Math.max(1, parseInt(e.target.value) || 1);
                            setJobs(newJobs);
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (job.tasks.length > 1) {
                            const newJobs = [...jobs];
                            newJobs[job.id].tasks.splice(taskIndex, 1);
                            setJobs(newJobs);
                          }
                        }}
                        className={`mt-6 ${job.tasks.length === 1 ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}`}
                      >
                        <Minus size={20} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newJobs = [...jobs];
                      newJobs[job.id].tasks.push({
                        id: `${job.id}-${job.tasks.length}`,
                        jobId: job.id,
                        machineId: 0,
                        duration: 3
                      });
                      setJobs(newJobs);
                    }}
                    className="mt-2 flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <Plus size={20} className="mr-1" /> Add Task
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex gap-4">
          <button
            onClick={addJob}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Plus size={20} className="mr-1" /> Add Job
          </button>
          <button
            onClick={validateAndSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Schedule Jobs
          </button>
        </div>
      </div>
    </div>
  );
}