import React, { useState, useRef, useEffect } from 'react';
import { Task, MaintenanceWindow } from '../types';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import html2canvas from 'html2canvas';
import { downloadCalendar } from '../utils/calendar';
import { 
  ZoomIn, 
  ZoomOut, 
  Move, 
  PenTool as Tool,
  Download,
  RefreshCw,
  Grid,
  Wrench,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Calendar
} from 'lucide-react';

interface ScheduleVisualizationProps {
  schedule: Task[];
  makespan: number;
  maintenanceWindows?: MaintenanceWindow[];
}

export default function ScheduleVisualization({ 
  schedule, 
  makespan,
  maintenanceWindows = []
}: ScheduleVisualizationProps) {
  const [showTooltip, setShowTooltip] = useState<{ 
    type: 'task' | 'maintenance';
    item: Task | MaintenanceWindow;
    x: number;
    y: number;
  } | null>(null);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const now = new Date();
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
  });
  const scheduleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.8;
      const newPosition = scrollPosition + (direction === 'left' ? -scrollAmount : scrollAmount);
      setScrollPosition(newPosition);
      containerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  const handleExportCalendar = () => {
    downloadCalendar(schedule, maintenanceWindows, calendarStartDate);
  };

  if (!schedule.length) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No tasks to schedule. Add some jobs and tasks to see the visualization.</p>
        </div>
      </div>
    );
  }

  const machines = Array.from(
    new Set([
      ...schedule.map(task => task.machineId),
      ...maintenanceWindows.map(window => window.machineId)
    ])
  ).sort((a, b) => a - b);

  const timeScale = 60; // pixels per time unit
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-red-500', 'bg-orange-500', 'bg-teal-500'
  ];

  const uniqueJobIds = Array.from(new Set(schedule.map(task => task.jobId))).sort((a, b) => a - b);

  const handleTaskHover = (task: Task, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShowTooltip({
      type: 'task',
      item: task,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    });
  };

  const handleMaintenanceHover = (window: MaintenanceWindow, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShowTooltip({
      type: 'maintenance',
      item: window,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    });
  };

  const downloadScheduleImage = async () => {
    if (!scheduleRef.current) return;
    setIsExporting(true);

    try {
      // Reset transform and scroll position for export
      if (containerRef.current) {
        containerRef.current.scrollLeft = 0;
      }

      // Create a temporary clone for export
      const clone = scheduleRef.current.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.position = 'absolute';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.width = `${(makespan + 1) * timeScale + 100}px`;
      
      // Add clone to body temporarily
      document.body.appendChild(clone);

      // Ensure all images are loaded
      await Promise.all(
        Array.from(clone.getElementsByTagName('img')).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // Capture the image
      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        width: (makespan + 1) * timeScale + 100,
        height: clone.offsetHeight,
        windowWidth: (makespan + 1) * timeScale + 100,
        windowHeight: clone.offsetHeight,
        x: 0,
        y: 0,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true
      });

      // Remove the clone
      document.body.removeChild(clone);

      // Create and trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `schedule-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export schedule:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTimeUnit = (time: number) => {
    const hours = Math.floor(time);
    return `${hours}:00`;
  };

  // Group maintenance windows by machine
  const maintenanceByMachine = maintenanceWindows.reduce((acc, window) => {
    if (!acc[window.machineId]) {
      acc[window.machineId] = [];
    }
    acc[window.machineId].push(window);
    return acc;
  }, {} as Record<number, MaintenanceWindow[]>);

  // Calculate overview scale
  const calculateOverviewScale = () => {
    const machineCount = machines.length;
    return Math.max(10, Math.min(20, 200 / machineCount)); // Dynamic height based on machine count
  };

  const overviewHeight = calculateOverviewScale();

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Schedule Visualization
          <span className="text-sm font-normal text-gray-500">
            (Total Makespan: {makespan} hours)
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
            title="Toggle Grid"
          >
            <Grid size={20} />
          </button>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={calendarStartDate.toISOString().slice(0, 16)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);
                setCalendarStartDate(date);
              }}
              className="px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={handleExportCalendar}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Export to Calendar"
            >
              <Calendar size={16} />
              Export iCal
            </button>
          </div>
          <button
            onClick={downloadScheduleImage}
            disabled={isExporting}
            className={`flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
              isExporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} />
                Export PNG
              </>
            )}
          </button>
        </div>
      </div>

      {maintenanceWindows.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Wrench className="text-gray-500" size={20} />
            Maintenance Overview
          </h3>
          <div className="grid gap-4">
            {Object.entries(maintenanceByMachine).map(([machineId, windows]) => (
              <div key={machineId} className="flex items-center gap-4">
                <div className="w-20 font-medium text-gray-700">
                  Machine {machineId}
                </div>
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {windows.map((window) => (
                    <div
                      key={window.id}
                      className="bg-gray-100 rounded px-3 py-1 text-sm flex items-center gap-2"
                      title={`Duration: ${window.duration} hours`}
                    >
                      <Tool size={14} className="text-gray-500" />
                      <span>Start: {formatTimeUnit(window.startTime)}</span>
                      <span className="text-gray-400">|</span>
                      <span>{window.duration}h</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Scroll Left"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Scroll Right"
            >
              <ArrowRight size={20} />
            </button>
          </div>
          <p className="text-gray-600">
            Zoom: <span className="font-semibold">{Math.round(currentZoom * 100)}%</span>
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-4">
          {maintenanceWindows.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-600">Maintenance Window</span>
            </div>
          )}
          {uniqueJobIds.map((jobId) => (
            <div key={jobId} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${colors[jobId % colors.length]} rounded`}></div>
              <span className="text-sm text-gray-600">Job {jobId + 1}</span>
            </div>
          ))}
        </div>

        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={2}
          wheel={{ step: 0.1 }}
          onZoom={({ state }) => setCurrentZoom(state.scale)}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => zoomIn()}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={20} />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={16} />
                  Reset
                </button>
              </div>

              <div 
                ref={containerRef}
                className="relative border border-gray-200 rounded-lg p-4 overflow-x-auto bg-white"
                style={{ maxWidth: '100%' }}
              >
                <TransformComponent>
                  <div ref={scheduleRef} className="relative">
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-full" style={{
                          backgroundImage: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
                          backgroundSize: `${timeScale}px ${timeScale}px`
                        }} />
                      </div>
                    )}

                    <div className="absolute top-0 left-0 w-full h-8 flex border-b border-gray-200">
                      {Array.from({ length: makespan + 1 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute flex flex-col items-center"
                          style={{ left: `${i * timeScale}px` }}
                        >
                          <div className="h-4 border-l border-gray-300"></div>
                          <div className="text-xs text-gray-500">{formatTimeUnit(i)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8" style={{ width: `${(makespan + 1) * timeScale + 100}px`, minWidth: '100%' }}>
                      {machines.map((machineId) => (
                        <div key={machineId} className="relative h-12 mb-4">
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 flex items-center gap-2">
                            <span className="font-medium">M{machineId}</span>
                          </div>
                          
                          {maintenanceWindows
                            .filter(window => window.machineId === machineId)
                            .map(window => (
                              <div
                                key={window.id}
                                className="absolute h-8 bg-gray-300 rounded flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
                                style={{
                                  left: `${window.startTime * timeScale}px`,
                                  width: `${window.duration * timeScale}px`,
                                }}
                                onMouseEnter={(e) => handleMaintenanceHover(window, e)}
                                onMouseLeave={() => setShowTooltip(null)}
                              >
                                <Tool size={16} className="text-gray-600" />
                              </div>
                            ))}

                          {schedule
                            .filter(task => task.machineId === machineId)
                            .map(task => (
                              <div
                                key={task.id}
                                className={`absolute h-8 rounded ${colors[task.jobId % colors.length]} flex items-center justify-center text-white text-sm cursor-pointer transition-opacity hover:opacity-90`}
                                style={{
                                  left: `${(task.startTime || 0) * timeScale}px`,
                                  width: `${task.duration * timeScale}px`,
                                }}
                                onMouseEnter={(e) => handleTaskHover(task, e)}
                                onMouseLeave={() => setShowTooltip(null)}
                              >
                                J{task.jobId + 1}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </TransformComponent>
              </div>

              <div className="mt-4 border border-gray-200 rounded p-2 bg-white">
                <div className="text-xs text-gray-500 mb-1">Overview</div>
                <div style={{ height: `${overviewHeight * machines.length}px` }} className="relative">
                  {machines.map((machineId, index) => (
                    <div 
                      key={machineId} 
                      className="absolute h-2 w-full" 
                      style={{ 
                        top: `${index * (overviewHeight / 2)}px`,
                        height: `${Math.max(2, overviewHeight / 3)}px`
                      }}
                    >
                      {maintenanceWindows
                        .filter(window => window.machineId === machineId)
                        .map(window => (
                          <div
                            key={window.id}
                            className="absolute h-full bg-gray-300"
                            style={{
                              left: `${(window.startTime / makespan) * 100}%`,
                              width: `${(window.duration / makespan) * 100}%`,
                            }}
                          />
                        ))}
                      {schedule
                        .filter(task => task.machineId === machineId)
                        .map(task => (
                          <div
                            key={task.id}
                            className={`absolute h-full ${colors[task.jobId % colors.length]}`}
                            style={{
                              left: `${((task.startTime || 0) / makespan) * 100}%`,
                              width: `${(task.duration / makespan) * 100}%`,
                            }}
                          />
                        ))}
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>0h</span>
                  <span>{makespan}h</span>
                </div>
              </div>
            </>
          )}
        </TransformWrapper>

        {showTooltip && (
          <div
            className="fixed z-50 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm pointer-events-none"
            style={{
              left: showTooltip.x + 'px',
              top: (showTooltip.y - 40) + 'px'
            }}
          >
            {showTooltip.type === 'task' ? (
              <>
                Job {(showTooltip.item as Task).jobId + 1} on Machine {(showTooltip.item as Task).machineId}
                <br />
                Duration: {(showTooltip.item as Task).duration} hours
                <br />
                Start Time: {formatTimeUnit((showTooltip.item as Task).startTime || 0)}
              </>
            ) : (
              <>
                Maintenance on Machine {(showTooltip.item as MaintenanceWindow).machineId}
                <br />
                Duration: {(showTooltip.item as MaintenanceWindow).duration} hours
                <br />
                Start Time: {formatTimeUnit((showTooltip.item as MaintenanceWindow).startTime)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}