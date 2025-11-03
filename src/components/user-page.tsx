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

    // Calculate statistics
    const totalTime = timeline.reduce((acc, entry) => acc + entry.duration, 0);
    const activeTime = timeline
      .filter((e) => !e.activity.includes('นอน') && !e.activity.includes('พักผ่อน'))
      .reduce((acc, entry) => acc + entry.duration, 0);
    const restTime = totalTime - activeTime;

    const roomStats: Record<string, number> = {};
    timeline.forEach((entry) => {
      roomStats[entry.room] = (roomStats[entry.room] || 0) + entry.duration;
    });

    const sortedRooms = Object.entries(roomStats).sort((a, b) => b[1] - a[1]);
    const mostUsedRoom = sortedRooms[0];
    const hasExercise = timeline.find((e) => e.activity.includes('กายภาพบำบัด'));
    const hasLongSession = timeline.some((e) => e.duration > 120);
    
    // Activity level assessment
    const activityLevel = activeTime >= 300 ? 'ดีเยี่ยม' : activeTime >= 180 ? 'ดี' : 'ปานกลาง';
    const activityColor = activeTime >= 300 ? '#00945E' : activeTime >= 180 ? '#0056B3' : '#f59e0b';

    const analysis = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0056B3 0%, #00945E 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
    <div style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">🤖 AI Analysis Report</div>
    <div style="font-size: 14px; opacity: 0.9;">📅 ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>

  <!-- Summary Cards -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
    <div style="background: #f0f9ff; padding: 16px; border-radius: 10px; border-left: 4px solid #0056B3;">
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">⏱️ เวลาทั้งหมด</div>
      <div style="font-size: 24px; font-weight: bold; color: #0056B3;">${(totalTime / 60).toFixed(1)}</div>
      <div style="font-size: 12px; color: #6b7280;">ชั่วโมง</div>
    </div>
    <div style="background: #f0fdf4; padding: 16px; border-radius: 10px; border-left: 4px solid #00945E;">
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">⚡ กิจกรรม</div>
      <div style="font-size: 24px; font-weight: bold; color: #00945E;">${activeTime}</div>
      <div style="font-size: 12px; color: #6b7280;">นาที (${((activeTime/totalTime)*100).toFixed(0)}%)</div>
    </div>
    <div style="background: #fef3f2; padding: 16px; border-radius: 10px; border-left: 4px solid #f59e0b;">
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">😴 พักผ่อน</div>
      <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${restTime}</div>
      <div style="font-size: 12px; color: #6b7280;">นาที (${((restTime/totalTime)*100).toFixed(0)}%)</div>
    </div>
  </div>

  <!-- Activity Level -->
  <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #e5e7eb;">
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #1f2937;">📊 ระดับกิจกรรม</div>
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="flex: 1; background: #f3f4f6; height: 12px; border-radius: 6px; overflow: hidden;">
        <div style="background: ${activityColor}; height: 100%; width: ${Math.min((activeTime/totalTime)*100, 100)}%; transition: width 0.3s;"></div>
      </div>
      <div style="font-weight: bold; color: ${activityColor};">${activityLevel}</div>
    </div>
    <div style="font-size: 13px; color: #6b7280; margin-top: 8px;">
      ${activeTime >= 300 ? '🎉 ยอดเยี่ยม! คุณมีกิจกรรมสูงมาก' : activeTime >= 180 ? '👍 ดีมาก! รักษาระดับนี้ไว้' : '💪 พยายามเพิ่มกิจกรรมให้มากขึ้น'}
    </div>
  </div>

  <!-- Room Usage -->
  <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #e5e7eb;">
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">🏠 การใช้งานพื้นที่</div>
    <div style="background: linear-gradient(to right, #e0f2fe, #dbeafe); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
      <div style="font-size: 14px; color: #1f2937; font-weight: 600;">🥇 ห้องที่ใช้บ่อยที่สุด: ${mostUsedRoom[0]}</div>
      <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${mostUsedRoom[1]} นาที (${((mostUsedRoom[1]/totalTime)*100).toFixed(0)}% ของเวลาทั้งหมด)</div>
    </div>
    ${sortedRooms.slice(0, 4).map(([room, time], idx) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📍'}</span>
          <span style="font-size: 14px; color: #374151;">${room}</span>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${time} นาที</div>
          <div style="font-size: 12px; color: #6b7280;">${((time/totalTime)*100).toFixed(0)}%</div>
        </div>
      </div>
    `).join('')}
  </div>

  <!-- Exercise -->
  <div style="background: ${hasExercise ? 'linear-gradient(to right, #d1fae5, #a7f3d0)' : 'linear-gradient(to right, #fef3c7, #fde68a)'}; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid ${hasExercise ? '#10b981' : '#f59e0b'};">
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">💪 การออกกำลังกาย</div>
    <div style="font-size: 14px; color: #374151;">
      ${hasExercise 
        ? '✅ <strong>ยอดเยี่ยม!</strong> คุณได้ทำกายภาพบำบัดแล้ววันนี้<br/><span style="font-size: 13px; color: #6b7280;">การออกกำลังกายสม่ำเสมอช่วยเสริมสร้างความแข็งแรงของร่างกาย</span>' 
        : '⚠️ <strong>อย่าลืม!</strong> ยังไม่มีการทำกายภาพบำบัดวันนี้<br/><span style="font-size: 13px; color: #6b7280;">แนะนำให้ออกกำลังกายอย่างน้อย 30 นาทีต่อวัน</span>'}
    </div>
  </div>

  <!-- Recommendations -->
  <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #e5e7eb;">
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">💡 คำแนะนำจาก AI</div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${activeTime >= 180 
        ? '<div style="display: flex; gap: 10px; padding: 12px; background: #f0fdf4; border-radius: 8px;"><span>✅</span><span style="font-size: 14px; color: #065f46;">ระดับกิจกรรมของคุณอยู่ในเกณฑ์ดี รักษาไว้นะคะ!</span></div>'
        : '<div style="display: flex; gap: 10px; padding: 12px; background: #fef3c7; border-radius: 8px;"><span>💪</span><span style="font-size: 14px; color: #78350f;">ลองเพิ่มกิจกรรมให้มากขึ้นสักหน่อยนะคะ</span></div>'
      }
      ${hasLongSession 
        ? '<div style="display: flex; gap: 10px; padding: 12px; background: #fef2f2; border-radius: 8px;"><span>⏰</span><span style="font-size: 14px; color: #991b1b;">ควรลุกขึ้นเคลื่อนไหวทุก 1-2 ชั่วโมง เพื่อสุขภาพที่ดี</span></div>'
        : ''
      }
      <div style="display: flex; gap: 10px; padding: 12px; background: #eff6ff; border-radius: 8px;">
        <span>💧</span>
        <span style="font-size: 14px; color: #1e40af;">อย่าลืมดื่มน้ำให้เพียงพอ อย่างน้อย 8 แก้วต่อวัน</span>
      </div>
      ${!hasExercise 
        ? '<div style="display: flex; gap: 10px; padding: 12px; background: #fef3c7; border-radius: 8px;"><span>🏃</span><span style="font-size: 14px; color: #78350f;">ลองหาเวลาออกกำลังกายสักหน่อยนะคะ จะช่วยให้ร่างกายแข็งแรงขึ้น</span></div>'
        : ''
      }
    </div>
  </div>

  <!-- Summary -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; text-align: center;">
    <div style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">✨ สรุปภาพรวม</div>
    <div style="font-size: 14px; line-height: 1.8; opacity: 0.95;">
      ${activeTime >= 180 && hasExercise 
        ? 'ยอดเยี่ยมมาก! 🎉 วันนี้คุณดูแลตัวเองได้อย่างสมบูรณ์แบบ มีทั้งกิจกรรมและการพักผ่อนที่สมดุล รักษาไว้นะคะ!'
        : activeTime >= 180 
        ? 'ดีมากค่ะ! 👍 คุณมีกิจกรรมที่เหมาะสม แต่อย่าลืมออกกำลังกายด้วยนะคะ จะทำให้สุขภาพดียิ่งขึ้น'
        : 'วันนี้ผ่านไปด้วยดีค่ะ ☺️ พยายามเพิ่มกิจกรรมและออกกำลังกายให้มากขึ้นนะคะ เพื่อสุขภาพที่ดีในระยะยาว'
      }
    </div>
    <div style="margin-top: 16px; font-size: 24px;">💪 🌟 ให้กำลังใจ! 🌟 💪</div>
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

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-2">
              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    ข้อมูลผู้ใช้
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <ScrollArea className="h-[300px] md:h-[350px] pr-4">
                    <div className="space-y-4">
                      {/* Doctor's Notes */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#0056B3]" />
                          คำแนะนำจากแพทย์
                        </h4>
                        <div className="space-y-2">
                          {userProfile.doctorNotes.map((note, index) => (
                            <div
                              key={index}
                              className="p-3 bg-blue-50 rounded-lg text-sm border border-blue-200"
                            >
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Daily Goals */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-[#00945E]" />
                          เป้าหมายวันนี้
                        </h4>
                        <div className="space-y-2">
                          {userProfile.dailyGoals.map((goal, index) => (
                            <div
                              key={index}
                              className="p-3 bg-green-50 rounded-lg text-sm border border-green-200"
                            >
                              {goal}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Medications */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          รายการยา
                        </h4>
                        <div className="space-y-2">
                          {userProfile.medications.map((med, index) => (
                            <div
                              key={index}
                              className="p-3 bg-purple-50 rounded-lg text-sm border border-purple-200"
                            >
                              {med}
                            </div>
                          ))}
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

      {/* AI Analysis Dialog - Compact & Mobile-Friendly */}
      <Dialog open={showAIAnalysisDialog} onOpenChange={setShowAIAnalysisDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-hidden p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-[#0056B3]" />
              วิเคราะห์กิจกรรม
            </DialogTitle>
          </DialogHeader>
          
          {/* Compact Summary Cards */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(() => {
                const totalTime = timeline.reduce((acc, entry) => acc + entry.duration, 0);
                const activeTime = timeline.filter((e) => !e.activity.includes('นอน')).reduce((acc, entry) => acc + entry.duration, 0);
                const restTime = totalTime - activeTime;
                
                return (
                  <>
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-2">
                        <div className="text-[10px] text-gray-500 mb-1">⏱️ รวม</div>
                        <div className="text-lg font-bold text-blue-600">{(totalTime / 60).toFixed(1)}</div>
                        <div className="text-[9px] text-gray-500">ชม.</div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-2">
                        <div className="text-[10px] text-gray-500 mb-1">⚡ กิจกรรม</div>
                        <div className="text-lg font-bold text-green-600">{activeTime}</div>
                        <div className="text-[9px] text-gray-500">นาที</div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500">
                      <CardContent className="p-2">
                        <div className="text-[10px] text-gray-500 mb-1">😴 พัก</div>
                        <div className="text-lg font-bold text-orange-600">{restTime}</div>
                        <div className="text-[9px] text-gray-500">นาที</div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>

            {/* Timeline Items - Compact Version */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">📅 กิจกรรมวันนี้</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1.5">
                    {timeline.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 p-2 rounded bg-gray-50 text-xs"
                      >
                        <Badge variant="outline" className="text-[10px] px-1 h-5 shrink-0">
                          {entry.time}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{entry.activity}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            {entry.room} • {entry.duration}m
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {(() => {
              const activeTime = timeline.filter((e) => !e.activity.includes('นอน')).reduce((acc, entry) => acc + entry.duration, 0);
              const hasExercise = timeline.find((e) => e.activity.includes('กายภาพบำบัด'));
              
              return (
                <Card className="border-l-4 border-l-purple-500 bg-purple-50">
                  <CardContent className="p-3">
                    <div className="text-xs font-semibold mb-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      คำแนะนำ
                    </div>
                    <ul className="text-xs space-y-1 text-gray-700">
                      {activeTime >= 300 && <li>🎉 ยอดเยี่ยม! คุณมีกิจกรรมสูงมาก</li>}
                      {activeTime < 180 && <li>💪 พยายามเพิ่มกิจกรรมให้มากขึ้น</li>}
                      {hasExercise && <li>✅ ดีมาก! ทำกายภาพบำบัดสม่ำเสมอ</li>}
                      {!hasExercise && <li>🏃 ควรออกกำลังกายอย่างน้อย 30 นาที</li>}
                      <li>💧 อย่าลืมดื่มน้ำวันละ 2 ลิตร</li>
                    </ul>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Close Button */}
            <Button
              size="sm"
              className="w-full bg-[#0056B3]"
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


