# WheelSense Dashboard

> Smart Indoor Navigation Dashboard for Wheelchair Management System

## 🎯 Overview

WheelSense Dashboard is a comprehensive web application for monitoring and managing wheelchair navigation systems in indoor environments. It provides real-time tracking, device management, patient management, and AI-assisted controls.

## ✨ Features

- 📊 **Real-time Dashboard** - Monitor active wheelchairs, network nodes, and system health
- 🗺️ **Interactive Map Editor** - Design and manage indoor layouts with drag-and-drop
- 📱 **Device Management** - Configure wheelchairs, nodes, gateways, and smart devices
- 👤 **Patient Management** - Track and manage patient information and wheelchair assignments
- 📅 **Timeline & Activity Log** - View system events and notifications in real-time
- 🤖 **AI Assistant** - Natural language commands for system control
- ⚙️ **Settings & Configuration** - Customize system behavior and preferences

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

- **Frontend Framework:** React 18 + TypeScript
- **UI Components:** Radix UI + shadcn/ui
- **Styling:** Tailwind CSS v3
- **Build Tool:** Vite
- **Charts:** Recharts
- **Icons:** Lucide React
- **State Management:** Zustand (custom store)

## 📦 Project Structure

```
src/
├── components/          # React components
│   ├── dashboard/      # Dashboard-specific components
│   ├── ui/             # Reusable UI components
│   ├── monitoring-dashboard.tsx
│   ├── map-editor.tsx
│   ├── device-setup-screen.tsx
│   ├── patient-management.tsx
│   ├── timeline-screen.tsx
│   ├── ai-assistant-chat.tsx
│   └── settings-screen.tsx
├── lib/                # Utility functions and logic
│   ├── store.tsx       # Global state management
│   ├── types.ts        # TypeScript definitions
│   ├── constants.ts    # App constants
│   ├── data-service.ts # Data processing utilities
│   ├── ai-commands.ts  # AI assistant logic
│   └── hooks/          # Custom React hooks
├── styles/             # Global styles
│   └── globals.css     # Tailwind + custom styles
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🎨 Design System

### Colors

- **Primary Blue:** `#0056B3` - Main brand color
- **Secondary Green:** `#00945E` - Accent color
- **Success:** `#00945E` - Positive actions
- **Warning:** `#fbbf24` - Caution states
- **Error:** `#dc2626` - Error states

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+

### Typography

- **Font Families:**
  - English: Inter
  - Thai: Kanit
- **Font Sizes:** Responsive using Tailwind's default scale
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700)

## 🔧 Recent Improvements (November 2024)

### UI/UX Enhancements

1. **Simplified Responsive System**
   - Removed complex `clamp()` inline styles
   - Implemented clean Tailwind responsive classes
   - Improved zoom behavior across all screen sizes

2. **Professional Styling**
   - Consistent spacing and sizing throughout
   - Better touch targets for mobile devices
   - Improved hover and focus states

3. **Performance Optimizations**
   - Removed unnecessary fluid typography system
   - Cleaner CSS with less complexity
   - Better scrollbar styling for desktop

### Code Cleanup

Removed unused files and components:
- Documentation files (CHANGELOG.md, USER_GUIDE.md, etc.)
- Unused components (app-footer, app-header, demo-mode, etc.)
- Auth/login components (not used in current version)
- Admin panel components (not integrated)

## 📱 Key Components

### Monitoring Dashboard
Real-time view of all wheelchairs, nodes, and system status with interactive map visualization.

### Map Editor
Drag-and-drop interface for creating and editing building layouts, floors, rooms, and corridors.

### Device Setup
Manage all devices including wheelchairs, network nodes, gateways, and smart home appliances.

### Patient Management
Track patients, assign wheelchairs, monitor destinations, and manage patient information.

### Timeline & Activity
View all system events, notifications, and activity logs with filtering and export capabilities.

### AI Assistant
Natural language interface for controlling devices and querying system status.

## 🔒 Security Notes

This is a **demonstration/prototype** application. For production use, implement:
- Proper authentication and authorization
- Secure API endpoints
- Data encryption
- Input validation and sanitization
- HTTPS/TLS encryption
- Session management

## 📄 License

MIT License

---

**Built with ❤️ by the WheelSense Team**
