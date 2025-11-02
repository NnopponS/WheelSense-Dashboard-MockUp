/**
 * Demo Sequence System
 * Manages automated sequences for demonstration purposes
 */

export interface DemoSequenceStep {
  id: string;
  time: string; // e.g., "08:00"
  sceneName: string;
  description: string;
  room: string;
  devices: string[]; // Device IDs
  actions: {
    deviceId: string;
    updates: {
      power?: 'on' | 'off';
      value?: number;
    };
  }[];
  aiMessages: {
    sender: 'user' | 'assistant';
    text: string;
    cardType?: 'hero' | 'device' | 'alert' | 'info';
    icon?: string;
  }[];
  duration: number; // Duration in seconds
  wheelchairPosition?: {
    room: string;
    x?: number;
    y?: number;
  };
}

export interface DemoSequence {
  id: string;
  name: string;
  description: string;
  steps: DemoSequenceStep[];
}

// Default sequence based on user's requirements
export const DEFAULT_DEMO_SEQUENCE: DemoSequence = {
  id: 'daily-routine',
  name: 'Daily Routine Demo',
  description: 'A day in the life with WheelSense smart home',
  steps: [
    {
      id: 'step-1',
      time: '08:00',
      sceneName: 'ตื่นนอน (Wake Up)',
      description: 'ผู้ใช้นั่งบนวีลแชร์ในห้องนอน ใช้เสียงควบคุมสั่ง "เปิดไฟ ปิดแอร์" ไฟสว่างขึ้นทันที แอร์หยุดทำงาน',
      room: 'Bedroom',
      devices: ['A-bedroom-light1', 'A-bedroom-light2', 'A-bedroom-ac'],
      actions: [
        { deviceId: 'A-bedroom-light1', updates: { power: 'on', value: 100 } },
        { deviceId: 'A-bedroom-light2', updates: { power: 'on', value: 100 } },
        { deviceId: 'A-bedroom-ac', updates: { power: 'off' } },
      ],
      aiMessages: [
        {
          sender: 'user',
          text: 'เปิดไฟ ปิดแอร์',
          cardType: 'hero',
          icon: '🎤',
        },
        {
          sender: 'assistant',
          text: 'เปิดไฟห้องนอนแล้วค่ะ ✨ และปิดแอร์เรียบร้อย',
          cardType: 'device',
          icon: '💡',
        },
      ],
      duration: 45,
      wheelchairPosition: { room: 'Bedroom' },
    },
    {
      id: 'step-2',
      time: '08:45',
      sceneName: 'เตรียมตัว (Bathroom)',
      description: 'ผู้ใช้ย้ายไปห้องน้ำ เตรียมตัวสำหรับวันใหม่',
      room: 'Bathroom',
      devices: ['A-bathroom-light1'],
      actions: [
        { deviceId: 'A-bathroom-light1', updates: { power: 'on', value: 100 } },
      ],
      aiMessages: [
        {
          sender: 'assistant',
          text: 'เปิดไฟห้องน้ำให้แล้วค่ะ 🚿 เริ่มวันใหม่กันเถอะ!',
          cardType: 'device',
          icon: '💡',
        },
      ],
      duration: 30,
      wheelchairPosition: { room: 'Bathroom' },
    },
    {
      id: 'step-3',
      time: '09:15',
      sceneName: 'ทานอาหารเช้า (Breakfast)',
      description: 'ผู้ใช้ย้ายมาที่ห้องครัว ทานอาหารเช้า',
      room: 'Kitchen',
      devices: ['A-kitchen-light1'],
      actions: [
        { deviceId: 'A-kitchen-light1', updates: { power: 'on', value: 80 } },
      ],
      aiMessages: [
        {
          sender: 'assistant',
          text: 'ถึงเวลาอาหารเช้าค่ะ 🍳\n\nอย่าลืมทานน้ำและยาตามเวลานะคะ',
          cardType: 'info',
          icon: '🥗',
        },
      ],
      duration: 30,
      wheelchairPosition: { room: 'Kitchen' },
    },
    {
      id: 'step-4',
      time: '09:45',
      sceneName: 'นั่งทำงาน จิบกาแฟ (Work Time)',
      description: 'ผู้ใช้นั่งทำงานบนโต๊ะ สั่ง "เปิดพัดลม" ลมเริ่มพัดเบา ๆ',
      room: 'Working Room',
      devices: ['A-working-fan', 'A-working-light'],
      actions: [
        { deviceId: 'A-working-fan', updates: { power: 'on', value: 60 } },
        { deviceId: 'A-working-light', updates: { power: 'on', value: 80 } },
      ],
      aiMessages: [
        {
          sender: 'user',
          text: 'เปิดพัดลม',
          cardType: 'hero',
          icon: '🎤',
        },
        {
          sender: 'assistant',
          text: 'เปิดพัดลมแล้วค่ะ 🌀 ปรับความเร็วไว้ที่ 60% ให้ลมเบา ๆ สบาย ๆ',
          cardType: 'device',
          icon: '🌬️',
        },
      ],
      duration: 120,
      wheelchairPosition: { room: 'Working Room' },
    },
    {
      id: 'step-5',
      time: '11:45',
      sceneName: 'พักเบรก (Break Time)',
      description: 'ผู้ใช้พักจากการทำงาน ไปห้องนั่งเล่น',
      room: 'Living Room',
      devices: ['A-living-light1', 'A-living-light2'],
      actions: [
        { deviceId: 'A-living-light1', updates: { power: 'on', value: 60 } },
        { deviceId: 'A-living-light2', updates: { power: 'on', value: 60 } },
      ],
      aiMessages: [
        {
          sender: 'assistant',
          text: 'พักสักหน่อยไหมคะ? 😊\n\nคุณนั่งทำงานมา 2 ชั่วโมงแล้ว',
          cardType: 'info',
          icon: '☕',
        },
      ],
      duration: 15,
      wheelchairPosition: { room: 'Living Room' },
    },
    {
      id: 'step-6',
      time: '12:00',
      sceneName: 'ทานอาหารกลางวัน (Lunch)',
      description: 'ผู้ใช้กลับไปที่ครัวเพื่อทานอาหารกลางวัน',
      room: 'Kitchen',
      devices: ['A-kitchen-light1'],
      actions: [
        { deviceId: 'A-kitchen-light1', updates: { power: 'on', value: 90 } },
      ],
      aiMessages: [
        {
          sender: 'assistant',
          text: 'ถึงเวลาอาหารกลางวันค่ะ 🍱\n\nอย่าลืมทานให้ครบ 5 หมู่นะคะ',
          cardType: 'info',
          icon: '🥘',
        },
      ],
      duration: 45,
      wheelchairPosition: { room: 'Kitchen' },
    },
    {
      id: 'step-7',
      time: '12:45',
      sceneName: 'ดูฟุตบอล (Watch Football)',
      description: 'ผู้ใช้ย้ายมาห้องนั่งเล่น เปิดทีวีดูฟุตบอล',
      room: 'Living Room',
      devices: ['A-living-light1', 'A-living-light2'],
      actions: [
        { deviceId: 'A-living-light1', updates: { power: 'on', value: 40 } },
        { deviceId: 'A-living-light2', updates: { power: 'on', value: 40 } },
      ],
      aiMessages: [
        {
          sender: 'user',
          text: 'เปิดทีวีช่องกีฬา',
          cardType: 'hero',
          icon: '🎤',
        },
        {
          sender: 'assistant',
          text: 'กำลังเปิดทีวีช่องกีฬาค่ะ ⚽ ปรับความสว่างไฟลงเพื่อความสบายตา',
          cardType: 'info',
          icon: '📺',
        },
      ],
      duration: 75,
      wheelchairPosition: { room: 'Living Room' },
    },
    {
      id: 'step-8',
      time: '14:00',
      sceneName: 'เล่นเกมกายภาพบำบัด (Physical Therapy)',
      description: 'ผู้ใช้เล่นเกมออกกำลังกาย ระบบตรวจจับการเคลื่อนไหว',
      room: 'Living Room',
      devices: [],
      actions: [],
      aiMessages: [
        {
          sender: 'assistant',
          text: 'ถึงเวลาออกกำลังกายค่ะ! 💪 เริ่มเกมกายภาพบำบัดได้เลย',
          cardType: 'hero',
          icon: '🎮',
        },
        {
          sender: 'assistant',
          text: 'ตรวจพบการเคลื่อนไหว ✅\nระยะเวลา: 30 นาที\nแคลอรี่: 95 kcal\n\nเยี่ยมมากค่ะ! 🌟',
          cardType: 'info',
          icon: '📊',
        },
      ],
      duration: 30,
      wheelchairPosition: { room: 'Living Room' },
    },
    {
      id: 'step-9',
      time: '14:30',
      sceneName: 'มีพัสดุมาส่ง (Package Delivery)',
      description: 'เสียงแจ้งเตือนดังขึ้น ผู้ใช้ย้ายไปหน้าบ้าน สั่ง "เปิดประตู"',
      room: 'Front Door',
      devices: ['A-extdoor-door', 'A-frontdoor-light'],
      actions: [
        { deviceId: 'A-extdoor-door', updates: { power: 'on' } },
        { deviceId: 'A-frontdoor-light', updates: { power: 'on', value: 100 } },
      ],
      aiMessages: [
        {
          sender: 'assistant',
          text: '🔔 มีคนกดกริ่งที่หน้าบ้านค่ะ\nตรวจพบ: พนักงานส่งของ',
          cardType: 'alert',
          icon: '🚪',
        },
        {
          sender: 'user',
          text: 'เปิดประตู',
          cardType: 'hero',
          icon: '🎤',
        },
        {
          sender: 'assistant',
          text: 'เปิดประตูแล้วค่ะ 🔓 และเปิดไฟหน้าบ้าน\n\n⏱️ จะปิดอัตโนมัติในอีก 30 วินาที',
          cardType: 'device',
          icon: '🏠',
        },
      ],
      duration: 10,
      wheelchairPosition: { room: 'Front Door' },
    },
    {
      id: 'step-10',
      time: '14:40',
      sceneName: 'แผ่นดินไหว (Earthquake Emergency)',
      description: 'ระบบตรวจจับความผิดปกติ แจ้งเตือนฉุกเฉิน "กำลังติดต่อกู้ภัย"',
      room: 'Living Room',
      devices: [],
      actions: [],
      aiMessages: [
        {
          sender: 'assistant',
          text: '🚨 แจ้งเตือนฉุกเฉิน! 🚨\n\nตรวจพบการสั่นสะเทือนผิดปกติ\nระบบกำลังประเมินสถานการณ์...',
          cardType: 'alert',
          icon: '⚠️',
        },
        {
          sender: 'assistant',
          text: '📞 กำลังติดต่อศูนย์กู้ภัย\n📍 ตำแหน่ง: Living Room\n👤 สถานะ: ปลอดภัย\n\nโปรดอยู่ในที่ปลอดภัย',
          cardType: 'alert',
          icon: '🆘',
        },
      ],
      duration: 5,
      wheelchairPosition: { room: 'Living Room' },
    },
    {
      id: 'step-11',
      time: '22:00',
      sceneName: 'เข้านอน (Bedtime)',
      description: 'ผู้ใช้กลับห้องนอน สั่ง "ปิดไฟ เปิดแอร์" ไฟค่อย ๆ ดับ แอร์เริ่มทำงาน',
      room: 'Bedroom',
      devices: ['A-bedroom-light1', 'A-bedroom-light2', 'A-bedroom-ac'],
      actions: [
        { deviceId: 'A-bedroom-light1', updates: { power: 'off' } },
        { deviceId: 'A-bedroom-light2', updates: { power: 'off' } },
        { deviceId: 'A-bedroom-ac', updates: { power: 'on', value: 24 } },
      ],
      aiMessages: [
        {
          sender: 'user',
          text: 'ปิดไฟ เปิดแอร์',
          cardType: 'hero',
          icon: '🎤',
        },
        {
          sender: 'assistant',
          text: 'กำลังปรับไฟค่อย ๆ ดับ... 🌙\nเปิดแอร์อุณหภูมิ 24°C\n\nราตรีสวัสดิ์ค่ะ 😴💤',
          cardType: 'device',
          icon: '❄️',
        },
      ],
      duration: 60,
      wheelchairPosition: { room: 'Bedroom' },
    },
  ],
};

// Helper functions
export function getCurrentSequenceStep(
  sequence: DemoSequence,
  currentTime: Date
): DemoSequenceStep | null {
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute
    .toString()
    .padStart(2, '0')}`;

  // Find the most recent step that has passed
  const passedSteps = sequence.steps.filter((step) => step.time <= currentTimeStr);
  if (passedSteps.length === 0) return null;

  return passedSteps[passedSteps.length - 1];
}

export function getNextSequenceStep(
  sequence: DemoSequence,
  currentStepId: string
): DemoSequenceStep | null {
  const currentIndex = sequence.steps.findIndex((step) => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex === sequence.steps.length - 1) return null;
  return sequence.steps[currentIndex + 1];
}

export function getPreviousSequenceStep(
  sequence: DemoSequence,
  currentStepId: string
): DemoSequenceStep | null {
  const currentIndex = sequence.steps.findIndex((step) => step.id === currentStepId);
  if (currentIndex <= 0) return null;
  return sequence.steps[currentIndex - 1];
}


