import { createEvents } from 'ics';
import { Task, MaintenanceWindow } from '../types';

export interface CalendarEvent {
  start: [number, number, number, number, number];
  end: [number, number, number, number, number];
  title: string;
  description: string;
  location: string;
}

function getDateArray(baseDate: Date, timeOffset: number): [number, number, number, number, number] {
  const date = new Date(baseDate.getTime());
  date.setHours(date.getHours() + timeOffset);
  
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    0 // Minutes always 0 since we work with hour units
  ];
}

export function generateCalendarEvents(
  schedule: Task[],
  maintenanceWindows: MaintenanceWindow[],
  startDate: Date
): string {
  const events: CalendarEvent[] = [];

  // Add scheduled tasks
  schedule.forEach(task => {
    events.push({
      start: getDateArray(startDate, task.startTime || 0),
      end: getDateArray(startDate, (task.startTime || 0) + task.duration),
      title: `Job ${task.jobId + 1} - Machine ${task.machineId}`,
      description: `Task duration: ${task.duration} hours`,
      location: `Machine ${task.machineId}`
    });
  });

  // Add maintenance windows
  maintenanceWindows.forEach(window => {
    events.push({
      start: getDateArray(startDate, window.startTime),
      end: getDateArray(startDate, window.startTime + window.duration),
      title: `Maintenance - Machine ${window.machineId}`,
      description: `Maintenance duration: ${window.duration} hours`,
      location: `Machine ${window.machineId}`
    });
  });

  const { error, value } = createEvents(events);

  if (error) {
    console.error('Failed to generate calendar events:', error);
    throw new Error('Failed to generate calendar events');
  }

  return value || '';
}

export function downloadCalendar(
  schedule: Task[],
  maintenanceWindows: MaintenanceWindow[],
  startDate: Date
): void {
  try {
    const calendar = generateCalendarEvents(schedule, maintenanceWindows, startDate);
    const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `schedule-${startDate.toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to download calendar:', error);
  }
}