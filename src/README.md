# WheelSense - Smart Indoor Navigation System

ระบบนำทางและติดตามในอาคารสำหรับผู้ใช้รถเข็น โดยใช้ดีไซน์สองภาษา (ไทย + อังกฤษ) แบบมินิมอล ตามหลัก WCAG

## 🎨 Design System

- **สีหลัก**: 
  - Royal Blue: `#0056B3` (ปุ่มหลัก, หัวข้อ)
  - Emerald Green: `#00945E` (สีเน้น, สถานะสำเร็จ)
  - White: `#ffffff` (พื้นหลัง)
  
- **RSSI Signal Colors**:
  - Good (≥ -60 dBm): `#00945E` (เขียว)
  - Medium (-60 to -75 dBm): `#fbbf24` (เหลือง)
  - Poor (< -75 dBm): `#dc2626` (แดง)

- **Typography**:
  - ไทย: Kanit
  - English: Inter
  
- **Design Tokens**:
  - Card Border Radius: 16px
  - Grid Spacing: 8px
  - Minimum Touch Target: 44px

## 🏗️ Tech Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Toast Notifications**: Sonner

## 📁 Project Structure

```
├── App.tsx                          # Main entry point with tab navigation
├── components/
│   ├── monitoring-dashboard.tsx     # Real-time MQTT monitoring & floor map
│   ├── timeline-screen.tsx          # Activity timeline with AI analysis
│   ├── device-setup-screen.tsx      # Device list & MQTT routes topology
│   ├── ai-assistant-chat.tsx        # AI chat interface
│   └── ui/                          # Shadcn UI components
├── styles/
│   └── globals.css                  # Tailwind v4 + custom design tokens
```

## 🚀 Getting Started

### 1. Export from Figma Make

คลิกที่ปุ่ม **"Export"** หรือ **"Download"** ใน Figma Make UI แล้วบันทึกไฟล์ทั้งหมด

### 2. Setup in VS Code / Cursor

```bash
# สร้าง Vite + React project
npm create vite@latest wheelsense -- --template react-ts
cd wheelsense

# คัดลอกไฟล์ทั้งหมดจาก export มาแทนที่
# - คัดลอก /components, /styles ทั้งหมด
# - แทนที่ /App.tsx
# - แทนที่ /styles/globals.css
```

### 3. Install Dependencies

```bash
# Core dependencies
npm install

# UI & Styling
npm install tailwindcss@next @tailwindcss/vite@next
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# UI Components (from installed shadcn)
# ไม่ต้องติดตั้งเพิ่ม เพราะมีไฟล์ components/ui อยู่แล้ว

# Form & Utilities
npm install react-hook-form@7.55.0
npm install @hookform/resolvers zod
npm install sonner@2.0.3
npm install date-fns
npm install recharts
npm install @radix-ui/react-slot
npm install @radix-ui/react-accordion
npm install @radix-ui/react-alert-dialog
npm install @radix-ui/react-aspect-ratio
npm install @radix-ui/react-avatar
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-collapsible
npm install @radix-ui/react-context-menu
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-hover-card
npm install @radix-ui/react-label
npm install @radix-ui/react-menubar
npm install @radix-ui/react-navigation-menu
npm install @radix-ui/react-popover
npm install @radix-ui/react-progress
npm install @radix-ui/react-radio-group
npm install @radix-ui/react-scroll-area
npm install @radix-ui/react-select
npm install @radix-ui/react-separator
npm install @radix-ui/react-slider
npm install @radix-ui/react-switch
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install @radix-ui/react-toggle
npm install @radix-ui/react-toggle-group
npm install @radix-ui/react-tooltip
npm install embla-carousel-react
npm install input-otp
npm install vaul
npm install cmdk
```

### 4. Configure Tailwind CSS v4

สร้างไฟล์ `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

อัปเดต `src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 5. Add Toast Provider

อัปเดต `App.tsx` เพิ่ม Toaster:

```typescript
import { Toaster } from 'sonner@2.0.3'

export default function App() {
  // ... existing code
  
  return (
    <>
      <div className="size-full bg-background">
        {/* ... existing JSX */}
      </div>
      <Toaster />
    </>
  )
}
```

### 6. Run Development Server

```bash
npm run dev
```

เปิด browser ที่ `http://localhost:5173`

## 📱 Features

### 1. **Monitoring Dashboard**
- แผนที่ชั้นแบบเรียลไทม์ (Real-time Floor Map)
- แสดงตำแหน่งรถเข็นและ ESP32 nodes
- RSSI signal strength visualization
- **MQTT Telemetry logs แบบ structured format**:
  - Node-based telemetry data
  - Wheelchair tracking per node
  - Route path visualization (e.g., Node 2 → Node 3 → Gateway)
  - Route latency and recovery status

### 2. **Map Layout Editor** ⭐ NEW
- **Building Management**: สร้าง/แก้ไข/ลบอาคาร
- **Floor Management**: จัดการชั้นต่างๆ ในแต่ละอาคาร
- **Room Editor**: 
  - สร้างห้องใหม่แบบ manual
  - แก้ไขชื่อ, ตำแหน่ง, ขนาด, และสีของห้อง
  - Visual drag-and-drop interface
- **Save Layout**: บันทึกผังอาคารลง localStorage
- **เชื่อมต่อกับ Dashboard**: ข้อมูลที่แก้ไขจะสะท้อนใน Dashboard ทันที

### 3. **Timeline Screen**
- Activity timeline รายวัน
- Export ข้อมูลเป็น CSV/JSON
- **Enhanced AI Behavioral Analysis**: ⭐ IMPROVED
  - 📊 Activity Summary (เวลา, ระยะทาง, ความเร็วการเคลื่อนที่)
  - 📍 Location & Time Distribution Analysis
  - 🧠 Behavioral Pattern Recognition
  - 🔋 Connectivity & Signal Analysis
  - 💡 Health & Wellness Insights
  - 🎯 Personalized Recommendations
  - ✅ Overall Assessment with Trend Analysis
  - **คำแนะนำเชิงลึก**: เช่น ต้องเพิ่มกิจกรรม, จองบำบัด, เพิ่มการพบปะสังสรรค์

### 4. **Devices & Routes**
- **Device Management**: ⭐ IMPROVED
  - แก้ไขชื่ออุปกรณ์ได้ (Wheelchairs, Nodes)
  - เปลี่ยนห้องที่ติดตั้งได้
  - แสดงสถานะ online/offline
- **MQTT Topology**: แผนภาพโครงสร้างเครือข่าย
- **Active MQTT Routes**: รายละเอียดเส้นทางการส่งข้อมูล
  - Topic, QoS, Retained status
  - Last message timestamp
- **Mesh Network Control**: ⭐ NEW
  - แก้ไข routing path ของแต่ละ node
  - เลือก route ได้ เช่น Node 4 → Gateway หรือ Node 4 → Node 3 → Gateway
  - แสดง hop count และ latency
  - ปรับเส้นทางแบบ real-time

### 5. **AI Assistant Chat**
- Chat interface สำหรับสอบถามข้อมูล
- Support commands:
  - "Where is wheelchair W-04?"
  - "/route to Clinic"
  - "Show me the log for W-04"
  - "System status"

## 🔧 Customization

### เชื่อมต่อ MQTT Broker จริง

แก้ไขไฟล์ `components/monitoring-dashboard.tsx`:

```typescript
import { useEffect } from 'react';
import mqtt from 'mqtt';

// เชื่อมต่อ MQTT
const client = mqtt.connect('ws://your-broker-url:9001', {
  username: 'your-username',
  password: 'your-password',
});

client.on('connect', () => {
  console.log('Connected to MQTT Broker');
  client.subscribe('wheelsense/#');
});

client.on('message', (topic, message) => {
  const payload = JSON.parse(message.toString());
  // อัปเดต state ตามข้อมูลจริง
});
```

### เชื่อมต่อ Backend API

สร้างไฟล์ `services/api.ts`:

```typescript
const API_URL = 'https://your-api-url.com';

export async function getTimelineData(wheelchairId: string, date: string) {
  const response = await fetch(`${API_URL}/timeline/${wheelchairId}/${date}`);
  return response.json();
}

export async function getDeviceList() {
  const response = await fetch(`${API_URL}/devices`);
  return response.json();
}
```

### เชื่อมต่อ AI API

แก้ไขไฟล์ `components/ai-assistant-chat.tsx`:

```typescript
async function sendMessage(text: string) {
  const response = await fetch('https://your-ai-api.com/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text }),
  });
  const data = await response.json();
  return data.response;
}
```

## 📊 MQTT Topics Structure & Payload Format

### Main Telemetry Topic

```
wheelsense/telemetry    (QoS: 1, Retained: false)
```

### New Structured Payload Format

**Telemetry Payload** (รูปแบบใหม่):
```json
{
  "timestamp": "1970-01-01T07:05:44+07:00",
  "nodes": [
    {
      "node": 2,
      "wheels": [
        {
          "wheel": 1,
          "distance": 0,
          "status": 2,
          "motion": 0,
          "direction": 0,
          "rssi": -53,
          "stale": false,
          "ts": "1970-01-01T07:05:28+07:00",
          "route_recovered": false,
          "route_latency_ms": 972,
          "route_path": ["Node 2", "Node 3", "Gateway"]
        }
      ]
    },
    {
      "node": 3,
      "wheels": [
        {
          "wheel": 1,
          "distance": 0,
          "status": 2,
          "motion": 0,
          "direction": 0,
          "rssi": -49,
          "stale": false,
          "ts": "1970-01-01T07:05:26+07:00",
          "route_recovered": false,
          "route_latency_ms": 810,
          "route_path": ["Node 3", "Gateway"]
        }
      ]
    }
  ]
}
```

### Field Descriptions

- `timestamp`: เวลาที่ส่งข้อมูล
- `nodes`: Array ของ node ทั้งหมดที่ตรวจจับได้
  - `node`: Node ID
  - `wheels`: Array ของรถเข็นที่ node นี้ตรวจจับได้
    - `wheel`: Wheelchair ID
    - `distance`: ระยะห่างจาก node (เมตร)
    - `status`: สถานะรถเข็น (0=idle, 1=moving, 2=active)
    - `motion`: การเคลื่อนไหว (0=หยุด, 1=กำลังเคลื่อนที่)
    - `direction`: ทิศทางการเคลื่อนที่ (0-359 องศา)
    - `rssi`: ความแรงสัญญาณ (dBm)
    - `stale`: ข้อมูลล้าสมัย (true/false)
    - `ts`: Timestamp ล่าสุดจากรถเข็น
    - `route_recovered`: Route กู้คืนหรือไม่
    - `route_latency_ms`: Latency ของ route (มิลลิวินาที)
    - `route_path`: เส้นทางการส่งข้อมูลผ่าน mesh network

### Legacy Format (ยังรองรับ)

**Wheelchair Telemetry:**
```json
{
  "rssi": -64,
  "direction": 270,
  "motion": true,
  "pos": { "x": 450, "y": 175 },
  "room": "Clinic",
  "timestamp": "2025-10-21T14:10:23+07:00"
}
```

**Node Status:**
```json
{
  "id": "N-01",
  "room": "Lobby",
  "rssi": -62,
  "online": true,
  "timestamp": "2025-10-21T14:10:20+07:00"
}
```

## 🎯 Next Steps for Production

1. **Backend Integration**
   - เชื่อมต่อ MQTT Broker จริง
   - สร้าง REST API สำหรับ historical data
   - ตั้งค่า authentication & authorization

2. **AI Integration**
   - เชื่อมต่อ OpenAI/Claude API
   - สร้าง RAG pipeline สำหรับ context-aware responses
   - Fine-tune model ด้วยข้อมูลจริง

3. **Database**
   - เก็บ timeline data ใน TimescaleDB/PostgreSQL
   - Cache ข้อมูลด้วย Redis
   - Implement data retention policy

4. **Real-time Features**
   - WebSocket สำหรับ real-time updates
   - Server-Sent Events สำหรับ notifications
   - Implement reconnection logic

5. **Performance**
   - Lazy loading components
   - Virtual scrolling สำหรับ timeline/logs
   - Optimize re-renders ด้วย React.memo

6. **Testing**
   - Unit tests ด้วย Vitest
   - Integration tests ด้วย Testing Library
   - E2E tests ด้วย Playwright

## 📝 Development Notes

- **Mock Data**: ปัจจุบันใช้ mock data ทั้งหมด เหมาะสำหรับ UI development
- **Accessibility**: ออกแบบตามหลัก WCAG 2.1 AA
- **Responsive**: รองรับทุกขนาดหน้าจอ (mobile, tablet, desktop)
- **Bilingual**: รองรับ ไทย-อังกฤษ ด้วย Kanit และ Inter fonts

## 🐛 Troubleshooting

**Problem**: Tailwind classes ไม่ทำงาน
```bash
# ตรวจสอบว่าติดตั้ง Tailwind v4 แล้ว
npm list @tailwindcss/vite

# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Import path error
```typescript
// ตรวจสอบ path alias ใน vite.config.ts
// และตรวจสอบว่าใช้ relative path ที่ถูกต้อง
import { Button } from './components/ui/button'
```

**Problem**: TypeScript errors
```bash
# Update TypeScript config
npm install -D @types/node @types/react @types/react-dom
```

## 📄 License

MIT License - สามารถใช้งานและแก้ไขได้ตามต้องการ

## 👨‍💻 Support

สำหรับคำถามและการพัฒนาต่อ:
- ใช้ Cursor/Codex เพื่อช่วยเขียนโค้ด
- อ่าน documentation ของแต่ละ library
- ดู example code ใน components ที่มีอยู่

---

**Happy Coding! 🚀**
