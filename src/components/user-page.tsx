import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import {
  MapPin,
  Power,
  Send,
  Clock,
  Activity,
  TrendingUp,
  Calendar,
  Brain,
  User as UserIcon,
  FileText,
  Target,
  ZoomIn,
  ZoomOut,
  Lightbulb,
  Wind,
  Fan,
  DoorClosed,
  Thermometer,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import { Device } from '../lib/types';
import { getUserProfile, getAllUserProfiles, UserProfile } from '../lib/user-profiles';

interface TimelineEntry {
  id: string;
  time: string;
  room: string;
  duration: number; // minutes
  activity: string;
}

interface TimelineEntry {
  id: string;
  time: string;
  room: string;
  duration: number; // minutes
  activity: string;
}

export function UserPage() {
  const { devices, rooms, corridors, updateDevice, addEventLog, eventLogs, demoState } = useStore();
  
  // User Selection
  const [selectedUserId, setSelectedUserId] = useState<string>('U001');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getUserProfile('U001'));
  
  const [selectedFloor] = useState('S-F1');
  const [currentRoom, setCurrentRoom] = useState('Bedroom');
  
  // Map controls
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // AI Analysis popup
  const [showAIAnalysisDialog, setShowAIAnalysisDialog] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'assistant'; text: string; cardType?: string; icon?: string }[]>(
    [
      {
        sender: 'assistant',
        text: 'สวัสดีค่ะ! ฉันคือ AI Assistant ของคุณ 🤖\n\nพร้อมช่วยคุณแล้วค่ะ มีอะไรให้ช่วยไหมคะ?',
      },
    ]
  );

  // Track last processed step to prevent re-processing
  const lastProcessedStepRef = useRef<string | null>(null);
  
  // Sync demo state from Firebase - Real-time cross-device synchronization
  useEffect(() => {
    console.log('🔥 [Firebase Sync] Demo state updated:', demoState);
    
    if (!demoState.isRunning || !demoState.currentStep) {
      // No demo running - reset to initial state
      console.log('🛑 Demo stopped, resetting chat');
      setChatMessages([
        {
          sender: 'assistant',
          text: 'สวัสดีค่ะ! ฉันคือ AI Assistant ของคุณ 🤖\n\nพร้อมช่วยคุณแล้วค่ะ มีอะไรให้ช่วยไหมคะ?',
        },
      ]);
      setCurrentRoom('Living Room');
      setIsAiThinking(false);
      lastProcessedStepRef.current = null;
      return;
    }
    
    const step = demoState.currentStep;
    const stepId = step.id || step.sceneName;
    
    // Skip if we've already processed this step
    if (lastProcessedStepRef.current === stepId) {
      console.log('⏭️ [Firebase Sync] Step already processed, skipping:', stepId);
      return;
    }
    
    console.log('✅ [Firebase Sync] Applying new demo step:', step.sceneName, '→', step.room);
    lastProcessedStepRef.current = stepId;
    
    // Update room
    setCurrentRoom(step.room);
    
    // Clear old messages
    setChatMessages([]);
    
    // Check if step has AI messages
    if (!step.aiMessages || step.aiMessages.length === 0) {
      console.warn('⚠️ Step has no AI messages, skipping');
      return;
    }
    
    // Display AI messages immediately (no thinking animation)
    step.aiMessages.forEach((msg, idx) => {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { sender: msg.sender, text: msg.text, cardType: msg.cardType, icon: msg.icon },
        ]);
      }, idx * 800); // stagger by 0.8s each
    });
    
  }, [demoState.isRunning, demoState.currentStepIndex]);

  // Timeline - Sync with Demo Sequence
  const [timeline, setTimeline] = useState<TimelineEntry[]>([
    { id: '1', time: '08:00', room: 'Bedroom', duration: 45, activity: 'ตื่นนอน' },
    { id: '2', time: '08:45', room: 'Bathroom', duration: 30, activity: 'เตรียมตัว ล้างหน้า' },
    { id: '3', time: '09:15', room: 'Kitchen', duration: 30, activity: 'ทานอาหารเช้า' },
    { id: '4', time: '09:45', room: 'Working Room', duration: 120, activity: 'นั่งทำงาน' },
    { id: '5', time: '11:45', room: 'Living Room', duration: 15, activity: 'พักเบรก' },
    { id: '6', time: '12:00', room: 'Kitchen', duration: 45, activity: 'ทานอาหารกลางวัน' },
    { id: '7', time: '12:45', room: 'Living Room', duration: 75, activity: 'ดูฟุตบอล' },
    { id: '8', time: '14:00', room: 'Living Room', duration: 30, activity: 'กายภาพบำบัด' },
    { id: '9', time: '14:30', room: 'Front Door', duration: 10, activity: 'รับพัสดุหน้าบ้าน' },
    { id: '10', time: '14:40', room: 'Living Room', duration: 5, activity: 'เหตุการณ์ฉุกเฉิน' },
    { id: '11', time: '22:00', room: 'Bedroom', duration: 60, activity: 'เข้านอน' },
  ]);

  
  // Load user profile when selection changes
  useEffect(() => {
    const profile = getUserProfile(selectedUserId);
    if (profile) {
      setUserProfile(profile);
      setCurrentRoom(profile.room);
    }
  }, [selectedUserId]);

  const currentFloorRooms = rooms.filter((r) => r.floorId === selectedFloor);
  const currentFloorCorridors = corridors.filter((c) => c.floorId === selectedFloor);
  const smartDevices = devices.filter(
    (d) => d.type === 'appliance' && currentFloorRooms.some((r) => r.name === d.room)
  );
  
  // Devices in current room only
  const currentRoomDevices = smartDevices.filter((d) => d.room === currentRoom);
  
  // Debug: Log device changes
  useEffect(() => {
    console.log('📱 [User Dashboard] Devices updated:', devices.length);
    console.log('📍 [User Dashboard] Current room:', currentRoom);
    console.log('🔌 [User Dashboard] Current room devices:', currentRoomDevices.length);
    
    // Log device states for debugging
    currentRoomDevices.forEach((d) => {
      console.log(`  📟 ${d.name}: ${d.power} ${d.value ? `(${d.value})` : ''}`);
    });
  }, [devices, currentRoom, currentRoomDevices.length]);
  
  // Force re-render when devices change (for cross-tab sync)
  useEffect(() => {
    console.log('🔄 [User Dashboard] Devices state changed, count:', devices.length);
  }, [devices]);
  
  // Map pan handlers
  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStartRef.current) return;
    const nx = e.clientX - panStartRef.current.x;
    const ny = e.clientY - panStartRef.current.y;
    setPan({ x: nx, y: ny });
  };

  const handleMapMouseUp = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };
  
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.3));

  const handleDeviceToggle = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    const newPower = device.power === 'on' ? 'off' : 'on';
    updateDevice(deviceId, { power: newPower });

    toast.success(`${device.name} ${newPower === 'on' ? 'เปิด' : 'ปิด'}แล้ว`);

    addEventLog({
      type: 'device',
      action: newPower === 'on' ? 'turned_on' : 'turned_off',
      details: `ผู้ใช้${newPower === 'on' ? 'เปิด' : 'ปิด'} ${device.name}`,
      room: device.room,
      deviceId: device.id,
      severity: 'info',
    });
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = { sender: 'user' as const, text: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');

    // Show "AI thinking" animation
    setIsAiThinking(true);

    // AI response with thinking delay
    setTimeout(() => {
      let response = '';
      const input = chatInput.toLowerCase();

      if (input.includes('เปิด') || input.includes('ปิด')) {
        response = '✅ กำลังดำเนินการให้ค่ะ';
      } else if (input.includes('อุณหภูมิ') || input.includes('แอร์')) {
        response = '🌡️ อุณหภูมิปัจจุบัน 26°C ค่ะ สบายดีไหมคะ?';
      } else if (input.includes('ไฟ')) {
        response = '💡 ปรับแสงให้เหมาะสมแล้วค่ะ';
      } else if (input.includes('สถานะ')) {
        const onlineDevices = smartDevices.filter((d) => d.status === 'online').length;
        response = `📊 ระบบทำงานปกติค่ะ\n\n✅ อุปกรณ์ออนไลน์: ${onlineDevices}/${smartDevices.length}\n✅ คุณอยู่ที่: ${currentRoom}`;
      } else {
        response = 'ได้เลยค่ะ! มีอะไรให้ช่วยเพิ่มเติมไหมคะ? 😊';
      }

      setIsAiThinking(false);
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: response }]);
    }, 1000); // AI "thinking" for 1 second
  };

  const handleAIAnalysis = () => {
    setShowAIAnalysisDialog(true);

    // Calculate detailed statistics - Physical Therapist Level
    const totalTime = timeline.reduce((acc, entry) => acc + entry.duration, 0);
    const activeTime = timeline
      .filter((e) => !e.activity.includes('นอน') && !e.activity.includes('พักผ่อน'))
      .reduce((acc, entry) => acc + entry.duration, 0);
    const restTime = totalTime - activeTime;
    
    // Advanced metrics
    const exerciseEntries = timeline.filter((e) => e.activity.includes('กายภาพบำบัด') || e.activity.includes('ออกกำลัง'));
    const totalExerciseTime = exerciseEntries.reduce((acc, entry) => acc + entry.duration, 0);
    const longestSitting = Math.max(...timeline.filter(e => !e.activity.includes('เคลื่อนที่')).map(e => e.duration));
    const positionChanges = timeline.filter((e, i) => i > 0 && timeline[i-1].room !== e.room).length;
    const mobilityScore = Math.min(100, (positionChanges * 10) + (totalExerciseTime / 3));

    const roomStats: Record<string, number> = {};
    timeline.forEach((entry) => {
      roomStats[entry.room] = (roomStats[entry.room] || 0) + entry.duration;
    });

    const sortedRooms = Object.entries(roomStats).sort((a, b) => b[1] - a[1]);
    const mostUsedRoom = sortedRooms[0];
    const hasExercise = exerciseEntries.length > 0;
    const hasLongSession = timeline.some((e) => e.duration > 120);
    
    // BMI calculation (if profile available)
    const bmi = userProfile ? (userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1) : 'N/A';
    const bmiStatus = userProfile ? (
      parseFloat(bmi) < 18.5 ? 'ต่ำกว่าเกณฑ์' :
      parseFloat(bmi) < 23 ? 'ปกติ' :
      parseFloat(bmi) < 25 ? 'น้ำหนักเกิน' : 'อ้วน'
    ) : 'N/A';
    
    // Activity level assessment - PT criteria
    const activityLevel = totalExerciseTime >= 30 ? 'ดีเยี่ยม' : totalExerciseTime >= 15 ? 'ดี' : 'ต้องปรับปรุง';
    const activityColor = totalExerciseTime >= 30 ? '#00945E' : totalExerciseTime >= 15 ? '#0056B3' : '#dc2626';

    const analysis = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.4; color: #1f2937; font-size: 13px;">
  
  <!-- Header - Compact -->
  <div style="background: linear-gradient(135deg, #0056B3 0%, #00945E 100%); color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;">
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">🏥 รายงานการประเมินกายภาพบำบัด</div>
    <div style="font-size: 11px; opacity: 0.9;">${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} • ${userProfile?.name}</div>
  </div>

  <!-- Patient Info - Compact Grid -->
  ${userProfile ? `
  <div style="background: #f8fafc; padding: 10px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 6px; color: #1f2937;">📋 ข้อมูลผู้ป่วย</div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-size: 11px;">
      <div style="padding: 6px; background: white; border-radius: 4px;"><span style="color: #64748b;">อายุ:</span> <strong>${userProfile.age} ปี</strong></div>
      <div style="padding: 6px; background: white; border-radius: 4px;"><span style="color: #64748b;">BMI:</span> <strong>${bmi}</strong></div>
      <div style="padding: 6px; background: white; border-radius: 4px;"><span style="color: #64748b;">เลือด:</span> <strong>${userProfile.bloodType}</strong></div>
    </div>
    <div style="margin-top: 6px; padding: 6px; background: white; border-radius: 4px; font-size: 11px;">
      <strong>Dx:</strong> ${userProfile.diagnosis}
    </div>
  </div>
  ` : ''}

  <!-- Key Metrics - Compact 2x2 Grid -->
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px;">
    <div style="background: #f0fdf4; padding: 10px; border-radius: 6px; border-left: 3px solid #00945E; text-align: center;">
      <div style="font-size: 10px; color: #64748b;">💪 กายภาพบำบัด</div>
      <div style="font-size: 22px; font-weight: bold; color: #00945E;">${totalExerciseTime}</div>
      <div style="font-size: 9px; color: #64748b;">${totalExerciseTime >= 30 ? '✅ ผ่าน' : '⚠️ ต่ำกว่า 30 นาที'}</div>
    </div>
    <div style="background: #fef3f2; padding: 10px; border-radius: 6px; border-left: 3px solid #f59e0b; text-align: center;">
      <div style="font-size: 10px; color: #64748b;">🪑 นั่งนานสุด</div>
      <div style="font-size: 22px; font-weight: bold; color: #f59e0b;">${longestSitting}</div>
      <div style="font-size: 9px; color: #64748b;">${longestSitting > 120 ? '⚠️ เกิน 120' : '✅ ปกติ'}</div>
    </div>
    <div style="background: #fef9f3; padding: 10px; border-radius: 6px; border-left: 3px solid #8b5cf6; text-align: center;">
      <div style="font-size: 10px; color: #64748b;">🚶 เปลี่ยนตำแหน่ง</div>
      <div style="font-size: 22px; font-weight: bold; color: #8b5cf6;">${positionChanges}</div>
      <div style="font-size: 9px; color: #64748b;">${positionChanges >= 5 ? '✅ ดี' : '⚠️ น้อย'}</div>
    </div>
    <div style="background: #eff6ff; padding: 10px; border-radius: 6px; border-left: 3px solid #3b82f6; text-align: center;">
      <div style="font-size: 10px; color: #64748b;">📊 Mobility Score</div>
      <div style="font-size: 22px; font-weight: bold; color: #3b82f6;">${mobilityScore.toFixed(0)}</div>
      <div style="font-size: 9px; color: #64748b;">/100 ${mobilityScore >= 70 ? '✅' : '⚠️'}</div>
    </div>
  </div>

  <!-- Physical Therapy Focus - Compact -->
  ${userProfile?.physicalTherapyProgram ? `
  <div style="background: #fef9f3; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #8b5cf6;">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 6px; color: #1f2937;">🎯 โปรแกรมกายภาพบำบัด</div>
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
      ${userProfile.physicalTherapyProgram.schedule} • ${userProfile.physicalTherapyProgram.duration}
    </div>
    <div style="font-size: 11px; color: #374151;">
      ${userProfile.physicalTherapyProgram.focusAreas.slice(0, 3).map((area, i) => `<div style="padding: 4px 0;">• ${area}</div>`).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Posture & Pressure - Compact -->
  <div style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">🪑 การจัดการท่านั่งและแผลกดทับ</div>
    ${longestSitting > 120 ? `
      <div style="background: #fef2f2; padding: 8px; border-radius: 6px; border-left: 3px solid #dc2626; margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #991b1b;">⚠️ เสี่ยงสูง - นั่งต่อเนื่อง ${longestSitting} นาที</div>
        <div style="font-size: 11px; color: #7f1d1d; margin-top: 4px;">ควรเปลี่ยนท่าทุก 30-45 นาที</div>
      </div>
    ` : `
      <div style="background: #f0fdf4; padding: 8px; border-radius: 6px; border-left: 3px solid #10b981; margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #065f46;">✅ ปลอดภัย - นั่งสูงสุด ${longestSitting} นาที</div>
      </div>
    `}
    <div style="font-size: 11px; color: #64748b; background: #f8fafc; padding: 8px; border-radius: 4px;">
      <strong>คำแนะนำ:</strong> เปลี่ยนท่าทุก 30-45 นาที • ยกสะโพก 10-15 วินาที • ตรวจผิวหนังทุกวัน
    </div>
  </div>

  <!-- Exercise Status - Compact -->
  <div style="background: ${hasExercise ? '#f0fdf4' : '#fef2f2'}; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid ${hasExercise ? '#10b981' : '#dc2626'};">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 6px; color: #1f2937;">
      ${hasExercise ? '✅ ทำกายภาพบำบัดแล้ว' : '⚠️ ยังไม่ได้ทำกายภาพบำบัด'}
    </div>
    <div style="font-size: 11px; color: ${hasExercise ? '#065f46' : '#991b1b'};">
      ${hasExercise 
        ? `เวลา: ${totalExerciseTime} นาที ${totalExerciseTime >= 30 ? '(ผ่านเกณฑ์)' : '(ควรเพิ่ม ' + (30 - totalExerciseTime) + ' นาที)'}` 
        : `⚠️ ต้องทำอย่างน้อย 30 นาที เพื่อป้องกัน Muscle Atrophy และ Joint Contracture`
      }
    </div>
  </div>

  <!-- Space Utilization - Mini Version -->
  <div style="background: #f0f9ff; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #3b82f6;">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 6px; color: #1f2937;">🏠 การใช้พื้นที่</div>
    <div style="font-size: 11px; color: #1e3a8a;">
      🥇 ${mostUsedRoom[0]} (${mostUsedRoom[1]} นาที) • การเปลี่ยนตำแหน่ง ${positionChanges} ครั้ง
    </div>
  </div>

  <!-- Clinical Status - Compact Badges -->
  <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">💊 สถานะทางคลินิก</div>
    <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px;">
      ${totalExerciseTime >= 30 
        ? '<div style="padding: 6px 10px; background: #f0fdf4; border-radius: 4px; border: 1px solid #10b981; color: #065f46;"><strong>✅ Exercise Goal</strong></div>'
        : '<div style="padding: 6px 10px; background: #fef2f2; border-radius: 4px; border: 1px solid #dc2626; color: #991b1b;"><strong>⚠️ ต้องการ +${30 - totalExerciseTime} นาที</strong></div>'
      }
      ${longestSitting <= 120 
        ? '<div style="padding: 6px 10px; background: #f0fdf4; border-radius: 4px; border: 1px solid #10b981; color: #065f46;"><strong>✅ Pressure Safe</strong></div>'
        : '<div style="padding: 6px 10px; background: #fef2f2; border-radius: 4px; border: 1px solid #dc2626; color: #991b1b;"><strong>⚠️ Pressure Risk</strong></div>'
      }
      ${positionChanges >= 5
        ? '<div style="padding: 6px 10px; background: #f0fdf4; border-radius: 4px; border: 1px solid #10b981; color: #065f46;"><strong>✅ Good Mobility</strong></div>'
        : '<div style="padding: 6px 10px; background: #fef3c7; border-radius: 4px; border: 1px solid #f59e0b; color: #78350f;"><strong>⚠️ Low Movement</strong></div>'
      }
      <div style="padding: 6px 10px; background: #eff6ff; border-radius: 4px; border: 1px solid #3b82f6; color: #1e40af;"><strong>💧 2-2.5L/day</strong></div>
    </div>
  </div>

  <!-- Evidence-Based Recommendations - Compact -->
  <div style="background: #fef9f3; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #0056B3;">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 6px; color: #1f2937;">📚 คำแนะนำเฉพาะโรค</div>
    <div style="font-size: 11px; color: #374151; line-height: 1.5;">
      ${userProfile?.diagnosis.includes('Spinal Cord') ? `
        <strong>SCI Protocol:</strong> ROM ทุกวัน • Strengthening แขน-ไหล่ • Transfer Training • Skin Check 2×/วัน • Cardio 20-30 นาที
      ` : userProfile?.diagnosis.includes('Osteoarthritis') ? `
        <strong>OA Protocol:</strong> Low-Impact (ว่ายน้ำ, โยคะ) • Quad Strengthening • Heat/Cold Therapy • Weight Management • Pain Control
      ` : ''}
    </div>
  </div>

  <!-- Goals - Compact -->
  <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
    <div style="font-size: 12px; color: #374151; line-height: 1.5;">
      <strong>🎯 เป้าหมาย 2 สัปดาห์:</strong> Exercise 30 นาที/วัน (5 วัน/สัปดาห์) • เปลี่ยนท่าทุก 30-45 นาที<br/>
      <strong>🎯 เป้าหมาย 3 เดือน:</strong> +20-30% กำลังกล้าม • Mobility 80+ • ลดแทรกซ้อน • พัฒนา ADL
    </div>
  </div>

  <!-- Risk Assessment - Compact Grid -->
  <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">⚕️ การประเมินความเสี่ยง</div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-size: 10px;">
      <div style="padding: 6px; background: ${longestSitting > 120 ? '#fef2f2' : '#f0fdf4'}; border-radius: 4px; border-left: 2px solid ${longestSitting > 120 ? '#dc2626' : '#10b981'};">
        <strong>${longestSitting > 120 ? '🔴' : '🟢'} Pressure Ulcer:</strong> ${longestSitting > 120 ? 'สูง (3/5)' : 'ต่ำ (1/5)'}
      </div>
      <div style="padding: 6px; background: ${totalExerciseTime < 30 ? '#fef3c7' : '#f0fdf4'}; border-radius: 4px; border-left: 2px solid ${totalExerciseTime < 30 ? '#f59e0b' : '#10b981'};">
        <strong>${totalExerciseTime < 30 ? '🟡' : '🟢'} Muscle Atrophy:</strong> ${totalExerciseTime < 30 ? 'ปานกลาง (2/5)' : 'ต่ำ (1/5)'}
      </div>
      <div style="padding: 6px; background: ${positionChanges < 5 ? '#fef3c7' : '#f0fdf4'}; border-radius: 4px; border-left: 2px solid ${positionChanges < 5 ? '#f59e0b' : '#10b981'};">
        <strong>${positionChanges < 5 ? '🟡' : '🟢'} Joint Contracture:</strong> ${positionChanges < 5 ? 'ปานกลาง (2/5)' : 'ต่ำ (1/5)'}
      </div>
      <div style="padding: 6px; background: #eff6ff; border-radius: 4px; border-left: 2px solid #3b82f6;">
        <strong>🔵 Cardiovascular:</strong> ปกติ (BP: 120/80)
      </div>
    </div>
  </div>

  <!-- Treatment Plan - Super Compact -->
  <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">📈 แผนการรักษา 12 สัปดาห์</div>
    <div style="font-size: 11px; color: #374151; line-height: 1.6;">
      <div style="padding: 6px; background: #f8fafc; border-radius: 4px; margin-bottom: 4px;">
        <strong>W1-4:</strong> Core/Upper Body • Pressure Relief • Balance • ROM
      </div>
      <div style="padding: 6px; background: #f0f9ff; border-radius: 4px; margin-bottom: 4px;">
        <strong>W5-8:</strong> Progressive Resistance • Transfer Training • ADL • Wheelchair Skills
      </div>
      <div style="padding: 6px; background: #f0fdf4; border-radius: 4px;">
        <strong>W9-12:</strong> Functional Activities • Endurance • Equipment Training • Community Prep
      </div>
    </div>
  </div>

  <!-- Vital Signs - Compact -->
  <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">🩺 สัญญาณชีพ</div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-size: 10px;">
      <div style="padding: 6px; background: #f0f9ff; border-radius: 4px; text-align: center;">
        <div style="color: #64748b;">BP</div>
        <div style="font-size: 14px; font-weight: bold; color: #0056B3;">120/80</div>
      </div>
      <div style="padding: 6px; background: #fef3f2; border-radius: 4px; text-align: center;">
        <div style="color: #64748b;">HR</div>
        <div style="font-size: 14px; font-weight: bold; color: #dc2626;">72</div>
      </div>
      <div style="padding: 6px; background: #f0fdf4; border-radius: 4px; text-align: center;">
        <div style="color: #64748b;">SpO₂</div>
        <div style="font-size: 14px; font-weight: bold; color: #00945E;">98%</div>
      </div>
      <div style="padding: 6px; background: #fef9f3; border-radius: 4px; text-align: center;">
        <div style="color: #64748b;">Temp</div>
        <div style="font-size: 14px; font-weight: bold; color: #8b5cf6;">36.8°C</div>
      </div>
      <div style="padding: 6px; background: #fef3c7; border-radius: 4px; text-align: center;">
        <div style="color: #64748b;">Weight</div>
        <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">${userProfile?.weight || 68} kg</div>
      </div>
      <div style="padding: 6px; background: #eff6ff; border-radius: 4px; text-align: center;">
        <div style="color: #64748b;">Pain (VAS)</div>
        <div style="font-size: 14px; font-weight: bold; color: #3b82f6;">2/10</div>
      </div>
    </div>
  </div>

  <!-- FIM Score - Compact -->
  <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">📊 FIM Score (Functional Independence)</div>
    <div style="font-size: 11px; color: #374151;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 6px;">
        <div style="padding: 6px; background: #f0fdf4; border-radius: 4px; text-align: center;">
          <div style="color: #64748b; font-size: 9px;">Self-Care</div>
          <div style="font-weight: bold; color: #00945E;">35/42</div>
        </div>
        <div style="padding: 6px; background: #f0f9ff; border-radius: 4px; text-align: center;">
          <div style="color: #64748b; font-size: 9px;">Mobility</div>
          <div style="font-weight: bold; color: #0056B3;">${Math.round(mobilityScore * 0.35)}/35</div>
        </div>
        <div style="padding: 6px; background: #f0fdf4; border-radius: 4px; text-align: center;">
          <div style="color: #64748b; font-size: 9px;">Communication</div>
          <div style="font-weight: bold; color: #00945E;">14/14</div>
        </div>
      </div>
      <div style="padding: 6px; background: #f8fafc; border-radius: 4px; text-align: center;">
        <strong>รวม:</strong> ${Math.round(35 + (mobilityScore * 0.35) + 14)}/126 (${Math.round(((35 + (mobilityScore * 0.35) + 14) / 126) * 100)}%)
      </div>
    </div>
  </div>

  <!-- Weekly Progress - Compact -->
  <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
    <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">📊 ความก้าวหน้ารายสัปดาห์</div>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; font-size: 10px; margin-bottom: 6px;">
      <div style="padding: 6px; background: #f0fdf4; border-radius: 4px; text-align: center;">
        <div style="font-size: 16px; font-weight: bold; color: #00945E;">+12%</div>
        <div style="color: #64748b;">กล้ามเนื้อ</div>
      </div>
      <div style="padding: 6px; background: #f0f9ff; border-radius: 4px; text-align: center;">
        <div style="font-size: 16px; font-weight: bold; color: #0056B3;">+8%</div>
        <div style="color: #64748b;">ROM</div>
      </div>
      <div style="padding: 6px; background: #fef3f2; border-radius: 4px; text-align: center;">
        <div style="font-size: 16px; font-weight: bold; color: #dc2626;">-15%</div>
        <div style="color: #64748b;">ปวด</div>
      </div>
      <div style="padding: 6px; background: #fef9f3; border-radius: 4px; text-align: center;">
        <div style="font-size: 16px; font-weight: bold; color: #8b5cf6;">+18%</div>
        <div style="color: #64748b;">คล่องตัว</div>
      </div>
    </div>
    <div style="padding: 8px; background: #f1f5f9; border-radius: 4px; font-size: 11px;">
      <strong>📝 PT Notes:</strong> ผู้ป่วยมีความก้าวหน้าดี • กล้ามเนื้อแขน-ไหล่แข็งแรงขึ้น • การถ่ายน้ำหนักดีขึ้น • แนะนำเพิ่มเป็น 45 นาที/ครั้ง
    </div>
  </div>

  <!-- Next Appointment - Compact -->
  <div style="background: #eff6ff; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #3b82f6;">
    <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px; color: #1f2937;">📅 นัดครั้งต่อไป</div>
    <div style="font-size: 11px; color: #1e40af;">
      ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} • 9:00 น. • ประเมินความก้าวหน้า
    </div>
  </div>

  <!-- Summary - Compact -->
  <div style="background: linear-gradient(135deg, #0056B3 0%, #00945E 100%); color: white; padding: 14px; border-radius: 8px; text-align: center;">
    <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">✨ สรุปผลการประเมิน</div>
    <div style="font-size: 12px; line-height: 1.6; opacity: 0.95;">
      ${totalExerciseTime >= 30 && longestSitting <= 120 && positionChanges >= 5
        ? `<strong>🎉 ดีเยี่ยม (Excellent)</strong><br/>ปฏิบัติตามแผนการรักษาได้ดี ความเสี่ยงต่ำ รักษาระดับนี้ต่อไป`
        : totalExerciseTime >= 15 && longestSitting <= 120
        ? `<strong>👍 ดี (Good)</strong><br/>มีความพยายาม ควรเพิ่มเวลาออกกำลังกายให้ครบ 30 นาที/วัน`
        : `<strong>⚠️ ต้องปรับปรุง (Needs Improvement)</strong><br/>พบความเสี่ยง ควรปฏิบัติตามแผนการรักษาอย่างเคร่งครัด`
      }
    </div>
    <div style="margin-top: 12px; font-size: 11px; opacity: 0.9; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; display: flex; justify-content: space-between; text-align: left;">
      <div>
        <strong>👨‍⚕️</strong> ${userProfile?.attendingPhysician?.name || 'N/A'}<br/>
        <span style="font-size: 10px;">${userProfile?.attendingPhysician?.phone || ''}</span>
      </div>
      <div style="text-align: right;">
        <strong>📅</strong> ${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}<br/>
        <span style="font-size: 10px;">${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
      </div>
    </div>
    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 9px; opacity: 0.7;">
      AI Physical Therapy Assistant • WheelSense Healthcare System
    </div>
  </div>

</div>
    `;

    setAiAnalysis(analysis);
  };
  
  const getDeviceIcon = (kind?: string) => {
    switch (kind) {
      case 'light':
        return <Lightbulb className="h-5 w-5" />;
      case 'door':
        return <DoorClosed className="h-5 w-5" />;
      case 'ac':
        return <Thermometer className="h-5 w-5" />;
      case 'fan':
        return <Fan className="h-5 w-5" />;
      default:
        return <Power className="h-5 w-5" />;
    }
  };
  
  if (!userProfile) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col gap-2 md:gap-4 p-2 md:p-4 bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with User Profile - Mobile Optimized */}
      <Card className="shadow-lg border-none bg-gradient-to-r from-[#0056B3] to-[#00945E]">
        <CardHeader className="pb-2 md:pb-3 px-3 md:px-6">
          <div className="flex items-center justify-between flex-wrap gap-2 md:gap-3">
            <div className="flex items-center gap-2 md:gap-4">
              <Avatar className="h-12 w-12 md:h-16 md:w-16 border-2 md:border-4 border-white shadow-lg shrink-0">
                <AvatarFallback className="bg-white text-[#0056B3] text-lg md:text-2xl font-bold">
                  {userProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-white min-w-0">
                <h2 className="text-base md:text-2xl font-bold truncate">{userProfile.name}</h2>
                <p className="text-white/80 text-xs md:text-sm">อายุ {userProfile.age} ปี • {userProfile.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* User Selector - Mobile Optimized */}
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-[140px] md:w-[200px] h-8 md:h-10 text-xs md:text-sm bg-white/20 text-white border-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAllUserProfiles().map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4 overflow-hidden">
        {/* Left Column: Map & Controls */}
        <div className="lg:col-span-2 space-y-2 md:space-y-4">
          {/* Map - Mobile Optimized */}
          <Card className="shadow-lg">
            <CardHeader className="pb-1 md:pb-2 px-3 md:px-6">
              <div className="flex items-center justify-between flex-wrap gap-1 md:gap-2">
                <CardTitle className="flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 text-[#0056B3]" />
                  แผนที่บ้าน
                </CardTitle>
                <div className="flex items-center gap-1 md:gap-2">
                  <Badge variant="default" className="bg-[#00945E] text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                    <MapPin className="mr-0.5 md:mr-1 h-2 w-2 md:h-3 md:w-3" />
                    {currentRoom}
                  </Badge>
                  {/* Zoom Controls - Compact */}
                  <Button size="sm" variant="outline" onClick={zoomOut} className="h-6 w-6 md:h-7 md:w-7 p-0">
                    <ZoomOut className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  </Button>
                  <span className="text-[10px] md:text-xs font-medium w-8 md:w-10 text-center">{Math.round(zoom * 100)}%</span>
                  <Button size="sm" variant="outline" onClick={zoomIn} className="h-6 w-6 md:h-7 md:w-7 p-0">
                    <ZoomIn className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2 md:pb-3 px-3 md:px-6">
              <div 
                className="bg-gray-50 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing relative" 
                style={{ height: '200px', minHeight: '150px' }}
                onMouseDown={handleMapMouseDown}
                onMouseMove={handleMapMouseMove}
                onMouseUp={handleMapMouseUp}
                onMouseLeave={handleMapMouseUp}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1000 600"
                  className="w-full h-full"
                >
                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* Grid - subtle */}
                    {Array.from({ length: 50 }).map((_, i) => (
                      <line
                        key={`v-${i}`}
                        x1={i * 20}
                        y1={0}
                        x2={i * 20}
                        y2={600}
                        stroke="#f0f0f0"
                        strokeWidth="0.5"
                      />
                    ))}
                    {Array.from({ length: 30 }).map((_, i) => (
                      <line
                        key={`h-${i}`}
                        x1={0}
                        y1={i * 20}
                        x2={1000}
                        y2={i * 20}
                        stroke="#f0f0f0"
                        strokeWidth="0.5"
                      />
                    ))}

                    {/* Corridors */}
                    {currentFloorCorridors.map((corridor) => (
                      <polyline
                        key={corridor.id}
                        points={corridor.points.map((p) => `${p.x},${p.y}`).join(' ')}
                        stroke={corridor.color || '#93c5fd'}
                        strokeWidth={corridor.width}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}

                    {/* Rooms */}
                    {currentFloorRooms.map((room) => (
                      <g
                        key={room.id}
                        className="cursor-pointer"
                        onClick={() => setCurrentRoom(room.name)}
                      >
                        <rect
                          x={room.x}
                          y={room.y}
                          width={room.width}
                          height={room.height}
                          fill={currentRoom === room.name ? '#e8f4ff' : room.color || '#f5f5f5'}
                          stroke={currentRoom === room.name ? '#0056B3' : '#d0d0d0'}
                          strokeWidth={currentRoom === room.name ? 3 : 1}
                          rx="4"
                        />
                        <text
                          x={room.x + room.width / 2}
                          y={room.y + room.height / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="14"
                          fontWeight="600"
                          fill="#333"
                        >
                          {room.name}
                        </text>

                        {/* Show devices in room */}
                        {smartDevices
                          .filter((d) => d.room === room.name)
                          .map((device, idx) => (
                            <g key={device.id}>
                              <circle
                                cx={room.x + 15}
                                cy={room.y + 15 + idx * 20}
                                r="6"
                                fill={device.power === 'on' ? '#00945E' : '#6b7280'}
                              />
                              <text
                                x={room.x + 28}
                                y={room.y + 18 + idx * 20}
                                fontSize="10"
                                fill="#666"
                              >
                                {device.name}
                              </text>
                            </g>
                          ))}
                      </g>
                    ))}
                    
                    {/* Wheelchair Indicator - เหมือน Demo Control */}
                    {(() => {
                      const targetRoom = demoState.isRunning && demoState.currentStep 
                        ? currentFloorRooms.find((r) => r.name === demoState.currentStep!.room)
                        : currentFloorRooms.find((r) => r.name === currentRoom);
                      
                      if (!targetRoom) return null;
                      
                      const wheelchairX = targetRoom.x + targetRoom.width / 2;
                      const wheelchairY = targetRoom.y + targetRoom.height / 2;
                      
                      return (
                        <g>
                          {/* Pulse Ring */}
                          <circle
                            cx={wheelchairX}
                            cy={wheelchairY}
                            r="20"
                            fill="#0056B3"
                            opacity="0.2"
                            className="animate-ping"
                          />
                          
                          {/* Wheelchair Background Circle */}
                          <circle
                            cx={wheelchairX}
                            cy={wheelchairY}
                            r="12"
                            fill="url(#wheelchair-gradient-user)"
                            stroke="white"
                            strokeWidth="2"
                            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                          />
                          
                          {/* Wheelchair Icon */}
                          <text
                            x={wheelchairX}
                            y={wheelchairY}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="16"
                          >
                            ♿
                          </text>
                        </g>
                      );
                    })()}
                    
                    {/* Gradient for wheelchair */}
                    <defs>
                      <linearGradient id="wheelchair-gradient-user" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0056B3" />
                        <stop offset="100%" stopColor="#004494" />
                      </linearGradient>
                    </defs>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Device Controls - Mobile Optimized */}
          <Card className="shadow-lg">
            <CardHeader className="pb-1 md:pb-2 px-3 md:px-6">
              <CardTitle className="flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
                <Power className="h-3 w-3 md:h-4 md:w-4 text-[#0056B3]" />
                อุปกรณ์ - {currentRoom} ({currentRoomDevices.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2 md:pb-3 px-3 md:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2" key={`devices-${currentRoom}-${devices.length}`}>
                {currentRoomDevices.map((device) => {
                  const isOn = device.power === 'on';
                  const hasValue = device.value !== undefined;
                  
                  return (
                    <Card
                      key={device.id}
                      className={`border transition-all ${
                        isOn ? 'border-[#00945E] bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <CardContent className="p-1.5 md:p-2">
                        <div className="flex flex-col items-center gap-1 md:gap-1.5">
                          <div
                            className={`p-1.5 md:p-2 rounded-full ${
                              isOn ? 'bg-[#00945E] text-white' : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {getDeviceIcon(device.applianceKind)}
                          </div>
                          <div className="text-center w-full">
                            <div className="font-medium text-[10px] md:text-xs truncate">{device.name}</div>
                            {hasValue && isOn && (
                              <div className="text-[10px] md:text-xs font-medium">
                                {device.applianceKind === 'ac' ? `${device.value}°C` : `${device.value}%`}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={isOn ? 'default' : 'outline'}
                            className={`w-full h-6 md:h-7 text-[10px] md:text-xs ${isOn ? 'bg-[#00945E] hover:bg-[#007a4d]' : ''}`}
                            onClick={() => handleDeviceToggle(device.id)}
                          >
                            {isOn ? 'ปิด' : 'เปิด'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {currentRoomDevices.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    <Power className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>ไม่มีอุปกรณ์ในห้องนี้</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Chat & Timeline - Mobile Optimized */}
        <div className="space-y-2 md:space-y-4">
          <Tabs defaultValue="chat" className="h-full">
            <TabsList className="grid w-full grid-cols-3 h-8 md:h-10">
              <TabsTrigger value="chat" className="text-xs md:text-sm py-1 md:py-2">💬 Chat</TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs md:text-sm py-1 md:py-2">📅 Timeline</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs md:text-sm py-1 md:py-2">👤 Profile</TabsTrigger>
            </TabsList>

            {/* AI Chat Tab - Mobile Optimized */}
            <TabsContent value="chat" className="mt-1 md:mt-2">
              <Card className="shadow-lg">
                <CardHeader className="pb-1 md:pb-2 px-3 md:px-6">
                  <CardTitle className="text-xs md:text-sm">🤖 AI Assistant</CardTitle>
                </CardHeader>
                <CardContent className="pb-2 md:pb-3 px-3 md:px-6">
                  <ScrollArea className="h-[250px] md:h-[350px] pr-2 md:pr-4 mb-2 md:mb-3">
                    {chatMessages.map((msg, index) => {
                      const isUser = msg.sender === 'user';
                      const cardType = msg.cardType || 'normal';
                      
                      let bgColor = 'bg-gray-100';
                      let textColor = 'text-gray-800';
                      
                      if (isUser) {
                        bgColor = 'bg-[#0056B3]';
                        textColor = 'text-white';
                      } else if (cardType === 'hero') {
                        // Hero card - ใช้สีอ่อนกับตัวหนังสือสีดำ (อ่านง่าย)
                        bgColor = 'bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-300';
                        textColor = 'text-gray-800';
                      } else if (cardType === 'alert') {
                        bgColor = 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300';
                        textColor = 'text-gray-800';
                      } else if (cardType === 'device') {
                        bgColor = 'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200';
                        textColor = 'text-gray-800';
                      }
                      
                      return (
                        <div
                          key={index}
                          className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] p-3 rounded-lg ${bgColor} ${textColor} shadow-md`}>
                            {msg.icon && (
                              <div className="text-2xl mb-2">{msg.icon}</div>
                            )}
                            <p className="text-sm whitespace-pre-wrap font-medium">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* AI Thinking Animation */}
                    {isAiThinking && (
                      <div className="mb-3 flex justify-start">
                        <div className="max-w-[85%] p-3 rounded-lg bg-gray-100 text-gray-800 shadow-md">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">🤖 AI กำลังคิด</span>
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      placeholder="พิมพ์ข้อความ..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} className="bg-[#0056B3]">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-2">
              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Timeline
                    </CardTitle>
                    <Button size="sm" onClick={handleAIAnalysis} className="bg-[#00945E] h-8">
                      <Brain className="mr-1 h-3 w-3" />
                      <span className="text-xs">วิเคราะห์</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <ScrollArea className="h-[300px] md:h-[350px] pr-4">
                    <div className="space-y-2">
                      {timeline.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-2 p-2 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors bg-white"
                        >
                          <div className="flex flex-col items-center gap-0.5 min-w-[50px]">
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                              {entry.time}
                            </Badge>
                            <span className="text-[10px] text-gray-500">{entry.duration}m</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs truncate">{entry.activity}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate">{entry.room}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab - Enhanced Medical Profile */}
            <TabsContent value="profile" className="mt-2">
              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    ประวัติผู้ป่วย
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <ScrollArea className="h-[300px] md:h-[350px] pr-4">
                    <div className="space-y-3">
                      {/* Medical Information */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-xs">
                          🏥 ข้อมูลทางการแพทย์
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          <div className="p-2 bg-gray-50 rounded border">
                            <span className="text-gray-600">การวินิจฉัย:</span> <strong>{userProfile.diagnosis}</strong>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="p-2 bg-blue-50 rounded border border-blue-200 text-center">
                              <div className="text-[10px] text-gray-600">ส่วนสูง</div>
                              <strong>{userProfile.height} cm</strong>
                            </div>
                            <div className="p-2 bg-green-50 rounded border border-green-200 text-center">
                              <div className="text-[10px] text-gray-600">น้ำหนัก</div>
                              <strong>{userProfile.weight} kg</strong>
                            </div>
                            <div className="p-2 bg-red-50 rounded border border-red-200 text-center">
                              <div className="text-[10px] text-gray-600">หมู่เลือด</div>
                              <strong>{userProfile.bloodType}</strong>
                            </div>
                          </div>
                          {userProfile.allergies && userProfile.allergies.length > 0 && (
                            <div className="p-2 bg-red-50 rounded border border-red-300">
                              <span className="text-gray-600">แพ้ยา:</span> <strong className="text-red-600">{userProfile.allergies.join(', ')}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Physical Therapy Program */}
                      {userProfile.physicalTherapyProgram && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-xs">
                            💪 โปรแกรมกายภาพบำบัด
                          </h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="p-2 bg-purple-50 rounded border border-purple-200">
                              <div className="text-[10px] text-gray-600 mb-1">กำหนดการ</div>
                              <strong>{userProfile.physicalTherapyProgram.schedule}</strong>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded border border-indigo-200">
                              <div className="text-[10px] text-gray-600 mb-1">ระยะเวลา</div>
                              <strong>{userProfile.physicalTherapyProgram.duration}</strong>
                            </div>
                            <div className="p-2 bg-green-50 rounded border border-green-200">
                              <div className="text-[10px] text-gray-600 mb-1">จุดเน้น</div>
                              {userProfile.physicalTherapyProgram.focusAreas.map((area, i) => (
                                <div key={i} className="text-xs ml-2">• {area}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Doctor's Notes */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-xs">
                          <FileText className="h-4 w-4 text-[#0056B3]" />
                          คำแนะนำจากแพทย์
                        </h4>
                        <div className="space-y-1.5">
                          {userProfile.doctorNotes.map((note, index) => (
                            <div
                              key={index}
                              className="p-2 bg-blue-50 rounded-lg text-xs border border-blue-200"
                            >
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Daily Goals */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-xs">
                          <Target className="h-4 w-4 text-[#00945E]" />
                          เป้าหมายวันนี้
                        </h4>
                        <div className="space-y-1.5">
                          {userProfile.dailyGoals.map((goal, index) => (
                            <div
                              key={index}
                              className="p-2 bg-green-50 rounded-lg text-xs border border-green-200"
                            >
                              {goal}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Medications */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-xs">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          รายการยา
                        </h4>
                        <div className="space-y-1.5">
                          {userProfile.medications.map((med, index) => (
                            <div
                              key={index}
                              className="p-2 bg-purple-50 rounded-lg text-xs border border-purple-200"
                            >
                              {med}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Medical History */}
                      {userProfile.medicalHistory && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-xs">
                            📋 ประวัติการรักษา
                          </h4>
                          <div className="space-y-1.5">
                            {userProfile.medicalHistory.map((history, index) => (
                              <div
                                key={index}
                                className="p-2 bg-gray-50 rounded-lg text-xs border border-gray-200"
                              >
                                {history}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attending Physician */}
                      {userProfile.attendingPhysician && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-xs">
                            👨‍⚕️ แพทย์ผู้ดูแล
                          </h4>
                          <div className="p-2 bg-indigo-50 rounded-lg text-xs border border-indigo-200">
                            <div><strong>{userProfile.attendingPhysician.name}</strong></div>
                            <div className="text-gray-600">{userProfile.attendingPhysician.specialty}</div>
                            <div className="text-gray-600">📞 {userProfile.attendingPhysician.phone}</div>
                          </div>
                        </div>
                      )}

                      {/* Emergency Contact */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-xs">
                          🚨 ผู้ติดต่อฉุกเฉิน
                        </h4>
                        <div className="p-2 bg-red-50 rounded-lg text-xs border border-red-200">
                          <div><strong>{userProfile.emergencyContact.name}</strong> ({userProfile.emergencyContact.relation})</div>
                          <div className="text-gray-600">📞 {userProfile.emergencyContact.phone}</div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* AI Analysis Dialog - Compact & Scrollable */}
      <Dialog open={showAIAnalysisDialog} onOpenChange={setShowAIAnalysisDialog}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-3 md:px-4 pt-3 pb-2 border-b shrink-0 bg-gradient-to-r from-[#0056B3] to-[#00945E]">
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg text-white">
              <Brain className="h-4 w-4 md:h-5 md:w-5" />
              รายงานการประเมินกายภาพบำบัด
            </DialogTitle>
          </DialogHeader>
          
          {/* Scrollable Content Area with visible scrollbar */}
          <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: aiAnalysis }}
            />
          </div>

          {/* Action Buttons - Fixed at Bottom */}
          <div className="px-3 md:px-4 py-2 border-t flex gap-2 shrink-0 bg-white shadow-lg">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={() => {
                // Export report
                const blob = new Blob([aiAnalysis], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `PT-Report-${userProfile?.name}-${new Date().toISOString().split('T')[0]}.html`;
                a.click();
              }}
            >
              📥 ดาวน์โหลด
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-[#0056B3]"
              onClick={() => setShowAIAnalysisDialog(false)}
            >
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


