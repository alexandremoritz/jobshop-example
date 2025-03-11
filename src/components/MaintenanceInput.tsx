import React, { useState } from 'react';
import { Plus, Minus, Clock } from 'lucide-react';
import { MaintenanceWindow } from '../types';

interface MaintenanceInputProps {
  maintenanceWindows: MaintenanceWindow[];
  onChange: (windows: MaintenanceWindow[]) => void;
}

export default function MaintenanceInput({ maintenanceWindows, onChange }: MaintenanceInputProps) {
  const addMaintenanceWindow = () => {
    const newWindow: MaintenanceWindow = {
      id: `mw-${Date.now()}`,
      machineId: 0,
      startTime: 0,
      duration: 1
    };
    onChange([...maintenanceWindows, newWindow]);
  };

  const removeMaintenanceWindow = (id: string) => {
    onChange(maintenanceWindows.filter(window => window.id !== id));
  };

  const updateWindow = (id: string, updates: Partial<MaintenanceWindow>) => {
    onChange(maintenanceWindows.map(window => 
      window.id === id ? { ...window, ...updates } : window
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Clock className="mr-2" /> Maintenance Windows
        </h3>
        <button
          onClick={addMaintenanceWindow}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <Plus size={20} className="mr-1" /> Add Window
        </button>
      </div>

      {maintenanceWindows.map((window) => (
        <div key={window.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Machine
            </label>
            <input
              type="number"
              min="0"
              value={window.machineId}
              onChange={(e) => updateWindow(window.id, {
                machineId: parseInt(e.target.value) || 0
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              type="number"
              min="0"
              value={window.startTime}
              onChange={(e) => updateWindow(window.id, {
                startTime: parseInt(e.target.value) || 0
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <input
              type="number"
              min="1"
              value={window.duration}
              onChange={(e) => updateWindow(window.id, {
                duration: Math.max(1, parseInt(e.target.value) || 1)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => removeMaintenanceWindow(window.id)}
            className="mt-6 text-red-500 hover:text-red-700"
          >
            <Minus size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}