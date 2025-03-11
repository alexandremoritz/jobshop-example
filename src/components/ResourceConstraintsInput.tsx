import React from 'react';
import { Plus, Minus, Cog } from 'lucide-react';
import { ResourceConstraint } from '../types';

interface ResourceConstraintsInputProps {
  constraints: ResourceConstraint[];
  onChange: (constraints: ResourceConstraint[]) => void;
}

export default function ResourceConstraintsInput({ constraints, onChange }: ResourceConstraintsInputProps) {
  const addConstraint = () => {
    const newConstraint: ResourceConstraint = {
      machineId: 0,
      maxConcurrentTasks: 1
    };
    onChange([...constraints, newConstraint]);
  };

  const removeConstraint = (index: number) => {
    onChange(constraints.filter((_, i) => i !== index));
  };

  const updateConstraint = (index: number, updates: Partial<ResourceConstraint>) => {
    onChange(constraints.map((constraint, i) => 
      i === index ? { ...constraint, ...updates } : constraint
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Cog className="mr-2" /> Resource Constraints
        </h3>
        <button
          onClick={addConstraint}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <Plus size={20} className="mr-1" /> Add Constraint
        </button>
      </div>

      {constraints.map((constraint, index) => (
        <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Machine
            </label>
            <input
              type="number"
              min="0"
              value={constraint.machineId}
              onChange={(e) => updateConstraint(index, {
                machineId: parseInt(e.target.value) || 0
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Max Concurrent Tasks
            </label>
            <input
              type="number"
              min="1"
              value={constraint.maxConcurrentTasks}
              onChange={(e) => updateConstraint(index, {
                maxConcurrentTasks: Math.max(1, parseInt(e.target.value) || 1)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => removeConstraint(index)}
            className="mt-6 text-red-500 hover:text-red-700"
          >
            <Minus size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}