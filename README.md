# jobshop-example

A modern, interactive job shop scheduling application built with React and TypeScript.

This application shows some examples of the optimization of manufacturing processes by efficiently scheduling jobs across multiple machines while considering maintenance windows and various scheduling algorithms


## Features

- **Interactive Job Management**
  - Add and edit jobs with multiple tasks
  - Specify machine assignments and task durations
  - Real-time validation of job configurations

- **Maintenance Planning**
  - Schedule maintenance windows for machines
  - Automatic conflict detection
  - Maintenance-aware scheduling

- **Advanced Visualization**
  - Interactive Gantt chart
  - Zoom and pan capabilities
  - Grid overlay option
  - Machine timeline overview

- **Schedule Analysis**
  - Machine utilization metrics
  - Critical path identification
  - Average wait time calculation
  - Schedule efficiency recommendations

- **Export Options**
  - Export schedule as PNG
  - Export to iCalendar format
  - Configurable start dates for calendar export

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/job-shop-scheduler.git
cd job-shop-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating Jobs

1. Click "Add Job" to create a new job
2. For each job:
   - Specify the machine ID for each task
   - Set the duration for each task
   - Add additional tasks as needed

### Scheduling

1. Select a scheduling algorithm:
   - Priority-based (default)
   - FIFO
   - EDD

2. Optional: Enable maintenance windows
   - Add maintenance periods for specific machines
   - Set start times and durations

3. Click "Schedule Jobs" to generate the schedule

### Viewing Results

- Use the interactive Gantt chart to view the schedule
- Zoom and pan to explore details
- Toggle the grid overlay for better visualization
- View machine utilization and efficiency metrics

### Exporting

- Export the schedule visualization as a PNG image
- Export to iCalendar format for integration with calendar applications
- Configure start dates for calendar export

## Technical Details

### Built With

- React 18
- TypeScript
- Tailwind CSS
- Vite
- recharts
- react-zoom-pan-pinch
- html2canvas
- ics (iCalendar export)
- Lucide React (icons)

### Key Components

- **Scheduler Engine**: Implements various scheduling algorithms with maintenance window support
- **Interactive Visualization**: Built with custom React components and zoom-pan capabilities
- **Metrics Calculator**: Analyzes schedule efficiency and generates recommendations
- **Export System**: Supports multiple export formats with customization options

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by real-world manufacturing scheduling challenges
- Built with modern web technologies for optimal performance
- Designed for both small and large-scale production environments