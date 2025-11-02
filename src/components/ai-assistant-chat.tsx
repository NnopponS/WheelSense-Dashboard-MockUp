import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Send, Mic, Bot, User } from 'lucide-react';
import { useStore } from '../lib/store';
import { DataService } from '../lib/data-service';
import {
  parseWheelchairQuery,
  isWheelchairQuery,
  isDeviceControlCommand,
  controlDevices,
  generateSystemStatusReport,
  getHelpMessage,
} from '../lib/ai-commands';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export function AIAssistantChat() {
  const { devices, wheelchairPositions, rooms, updateDevice, addEventLog } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  // Initialize with welcome message
  useEffect(() => {
    const stats = DataService.getSystemStats(devices);
    const welcomeMsg: Message = {
      id: 'welcome',
      sender: 'assistant',
      text: `สวัสดีค่ะ! ฉันคือ WheelSense AI Assistant 🤖\n\nระบบของคุณพร้อมใช้งาน:\n✅ Wheelchairs: ${stats.activeWheelchairs}/${stats.totalWheelchairs} online\n✅ Nodes: ${stats.onlineNodes}/${stats.totalNodes} online\n✅ Smart Devices: ${stats.totalAppliances} devices\n\nคุณสามารถถามฉันเกี่ยวกับ:\n• สถานะของ wheelchair (เช่น "W-01 อยู่ไหน?")\n• ควบคุมอุปกรณ์ (เช่น "เปิดไฟห้องนอน")\n• สถิติการใช้งาน\n\nพิมพ์คำสั่งได้เลยค่ะ!`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
    setMessages([welcomeMsg]);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    setMessages([...messages, newMessage]);
    const userInput = inputText.toLowerCase();
    setInputText('');

    // Process command
    setTimeout(() => {
      let responseText = '';
      
      // Check for wheelchair location query
      if (isWheelchairQuery(userInput)) {
        const wheelId = parseWheelchairQuery(userInput);
        if (wheelId !== null) {
          const wheelData = wheelchairPositions.get(wheelId);
          const wheelDevice = devices.find(d => d.id === `W-${String(wheelId).padStart(2, '0')}`);
          
          if (wheelData || wheelDevice) {
            const room = wheelData?.room || wheelDevice?.room || 'Unknown';
            responseText = `♿ Wheelchair W-${String(wheelId).padStart(2, '0')} ${wheelData ? 'อยู่ที่' : 'ตำแหน่งล่าสุด'} "${room}"\n\n`;
            if (wheelData) {
              responseText += `📊 ข้อมูล:\n• Motion: ${wheelData.motion === 0 ? 'Stationary' : wheelData.motion === 1 ? 'Moving Forward' : 'Moving Backward'}\n• Signal: ${wheelData.rssi} dBm\n• Distance: ${wheelData.distance}m`;
            }
          } else {
            responseText = `ไม่พบข้อมูล Wheelchair W-${wheelId}`;
          }
        }
      }
      // Device control commands
      else {
        const command = isDeviceControlCommand(userInput);
        if (command.isCommand && command.kind && command.action) {
          const result = controlDevices(devices, command.kind, command.action);
          responseText = result.message;
          
          if (result.success && result.actions) {
            result.actions.forEach(({ deviceId, updates }) => {
              updateDevice(deviceId, updates);
            });
            
            addEventLog({
              type: 'voice',
              action: `${command.kind}_${command.action}`,
              details: `AI Assistant: ${result.message.split('\n')[0]}`,
              severity: 'success',
            });
          }
        }
        // System status
        else if (userInput.includes('สถานะ') || userInput.includes('status') || userInput.includes('รายงาน')) {
          responseText = generateSystemStatusReport(devices);
        }
        // List all wheelchairs
        else if (userInput.includes('wheelchair') || userInput.includes('วีลแชร์')) {
          const wheelchairs = DataService.getDevicesByType(devices, 'wheelchair');
          responseText = `♿ Wheelchairs ทั้งหมด:\n\n${wheelchairs.map(w => {
            const pos = wheelchairPositions.get(parseInt(w.id.split('-')[1]));
            return `• ${w.id} - ${w.status} ${pos ? `(${pos.room})` : w.room ? `(${w.room})` : ''}`;
          }).join('\n')}`;
        }
        // Default response
        else {
          responseText = getHelpMessage();
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 800);
  };

  return (
    <div className="w-full max-w-[1280px] h-[900px] bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0056B3] to-[#00945E] text-white p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="english-text">WheelSense AI Assistant</h2>
            <p className="text-sm opacity-90 thai-text">ผู้ช่วย AI สำหรับระบบ WheelSense</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#00945E] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] ${
                  message.sender === 'user' ? 'order-1' : 'order-2'
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-[#e8f4ff] text-[#0056B3] rounded-tr-sm'
                      : 'bg-[#f0fdf4] text-gray-800 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-line english-text">{message.text}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-2">{message.timestamp}</p>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#0056B3] flex items-center justify-center flex-shrink-0 mt-1 order-2">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-2">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-[#00945E] hover:text-[#00945E] hover:bg-[#00945E]/10"
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="พิมพ์คำสั่ง... (เช่น 'W-01 อยู่ไหน?', 'เปิดไฟ', 'สถานะระบบ')"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 border-0 focus-visible:ring-0"
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="flex-shrink-0 bg-[#0056B3] hover:bg-[#004494]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ลองพิมพ์: "W-01 อยู่ไหน?", "เปิดไฟ", "ปิดแอร์" หรือ "สถานะระบบ"
          </p>
        </div>
      </div>

      {/* Suggestions (Optional) */}
      <div className="border-t bg-white p-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputText('W-01 อยู่ไหน?')}
              className="text-xs"
            >
              W-01 อยู่ไหน?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputText('เปิดไฟ')}
              className="text-xs"
            >
              เปิดไฟ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputText('สถานะระบบ')}
              className="text-xs"
            >
              สถานะระบบ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputText('ปิดแอร์')}
              className="text-xs"
            >
              ปิดแอร์
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
