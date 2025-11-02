import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Square, Edit, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import { DEFAULT_DEMO_SEQUENCE, DemoSequence, DemoSequenceStep } from '../lib/demo-sequences';
import { MapCanvas } from './map-editor/MapCanvas';
import { SequenceEditor } from './demo-control/SequenceEditor';

export function DemoControlPage() {
  const { devices, rooms, corridors, floors, buildings, updateDevice, addEventLog, demoState, setDemoState } = useStore();
  const [sequence, setSequence] = useState<DemoSequence>(DEFAULT_DEMO_SEQUENCE);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showSequenceEditor, setShowSequenceEditor] = useState<boolean>(false);

  const selectedFloor = 'S-F1'; // Smart Home floor
  const selectedBuilding = 'B2';
  const currentFloorRooms = rooms.filter((r) => r.floorId === selectedFloor);
  const currentFloorCorridors = corridors.filter((c) => c.floorId === selectedFloor);
  const currentStep = sequence.steps[currentStepIndex] || sequence.steps[0];

  // Execute step - Simple version (no auto-play, just click)
  const executeStep = (step: DemoSequenceStep, stepIndex: number) => {
    console.log('🎬 [Demo Control] Executing step:', stepIndex, step.sceneName);
    
    // Update devices และบันทึก device states
    console.log('🔧 [Demo Control] Updating devices:', step.actions.length);
    const deviceUpdates: Record<string, Partial<Device>> = {};
    
    step.actions.forEach(({ deviceId, updates }) => {
      console.log(`  → Device ${deviceId}:`, updates);
      updateDevice(deviceId, updates);
      deviceUpdates[deviceId] = updates;
    });

    // Update global demo state
    const newDemoState = {
      isRunning: true,
      currentStep: step,
      currentStepIndex: stepIndex,
      progress: 0,
    };
    
    setDemoState(newDemoState);
    
    // Save to localStorage for cross-tab sync
    try {
      localStorage.setItem('wheelsense-demo-state', JSON.stringify(newDemoState));
      
      // IMPORTANT: บันทึก device updates เพื่อ sync ข้าม tabs
      localStorage.setItem('wheelsense-demo-devices', JSON.stringify(deviceUpdates));
      
      console.log('💾 [Demo Control] Saved to localStorage + dispatching event');
      
      // Dispatch custom events
      window.dispatchEvent(new Event('demo-state-changed'));
      window.dispatchEvent(new Event('demo-devices-changed')); // New event for device sync
      
      console.log('📡 [Demo Control] Events dispatched - other tabs will receive StorageEvent');
    } catch (error) {
      console.error('Error saving demo state:', error);
    }

    toast.success(`🎬 ${step.sceneName}`);
  };

  // Simple: Click timeline item to execute
  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
    const step = sequence.steps[index];
    executeStep(step, index);
  };

  const handleStop = () => {
    setCurrentStepIndex(0);
    const stoppedState = {
      isRunning: false,
      currentStep: null,
      currentStepIndex: 0,
      progress: 0,
    };
    setDemoState(stoppedState);
    
    // Clear localStorage
    try {
      localStorage.setItem('wheelsense-demo-state', JSON.stringify(stoppedState));
      window.dispatchEvent(new Event('demo-state-changed'));
    } catch (error) {
      console.error('Error clearing demo state:', error);
    }
  };


  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <Card className="shadow-lg border-none bg-gradient-to-r from-[#0056B3] to-[#00945E]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                🎬 Demo Control Center
              </CardTitle>
              <p className="text-white/80 mt-1">{sequence.description}</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowSequenceEditor(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              แก้ไข Sequence
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Sequence Editor Dialog */}
      <SequenceEditor
        sequence={sequence}
        open={showSequenceEditor}
        onOpenChange={setShowSequenceEditor}
        onSave={(newSequence) => {
          setSequence(newSequence);
          toast.success('อัพเดท Sequence สำเร็จ');
        }}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Left: Map & Wheelchair */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#0056B3]" />
              Smart Home Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg overflow-hidden" style={{ height: '500px' }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1000 600"
                className="cursor-default"
              >
                <g transform={`translate(0, 0) scale(0.8)`}>
                  {/* Grid */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="1000" height="600" fill="url(#grid)" />
                  
                  {/* Rooms */}
                  {currentFloorRooms.map((room) => {
                    const isSelected = currentStep?.room === room.name;
                    return (
                      <g key={room.id}>
                        <rect
                          x={room.x}
                          y={room.y}
                          width={room.width}
                          height={room.height}
                          fill={isSelected ? '#e8f4ff' : room.color || '#f5f5f5'}
                          stroke={isSelected ? '#0056B3' : '#d0d0d0'}
                          strokeWidth={isSelected ? 3 : 1}
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
                        
                        {/* Show appliances */}
                        {devices
                          .filter((d) => d.type === 'appliance' && d.room === room.name)
                          .map((device, idx) => (
                            <g key={device.id}>
                              <circle
                                cx={room.x + 15}
                                cy={room.y + 15 + idx * 20}
                                r="6"
                                fill={device.power === 'on' ? '#00945E' : '#6b7280'}
                              />
                            </g>
                          ))}
                      </g>
                    );
                  })}
                  
                  {/* Wheelchair Indicator - ใน SVG coordinate */}
                  {(() => {
                    const targetRoom = currentStep && currentFloorRooms.find((r) => r.name === currentStep.room);
                    if (!targetRoom) return null;
                    
                    const wheelchairX = targetRoom.x + targetRoom.width / 2;
                    const wheelchairY = targetRoom.y + targetRoom.height / 2;
                    
                    return (
                      <g className="transition-all duration-700">
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
                          fill="url(#wheelchair-gradient)"
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
                    <linearGradient id="wheelchair-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0056B3" />
                      <stop offset="100%" stopColor="#004494" />
                    </linearGradient>
                  </defs>
                </g>
              </svg>
            </div>

          </CardContent>
        </Card>

        {/* Right: Timeline & Info */}
        <div className="flex flex-col gap-4">
          {/* Current Step Info */}
          {currentStep && (
            <Card className="shadow-lg border-2 border-[#0056B3]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">{currentStep.aiMessages[0]?.icon || '🏠'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default" className="bg-[#0056B3]">
                        <Clock className="mr-1 h-3 w-3" />
                        {currentStep.time}
                      </Badge>
                      <h3 className="font-bold">{currentStep.sceneName}</h3>
                    </div>
                    <p className="text-xs text-gray-600">{currentStep.description.substring(0, 80)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm mb-3">
                  <MapPin className="h-4 w-4 text-[#00945E]" />
                  <span className="font-medium">{currentStep.room}</span>
                </div>
                {demoState.isRunning && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleStop}
                    className="w-full"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    หยุด Demo
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sequence Steps List - คลิกเพื่อ Run */}
          <Card className="shadow-lg flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">📅 Timeline - คลิกเพื่อ Run ทันที</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {sequence.steps.map((step, index) => (
                    <Button
                      key={step.id}
                      variant={index === currentStepIndex ? 'default' : 'outline'}
                      className={`w-full justify-start text-left h-auto py-3 ${
                        index === currentStepIndex ? 'bg-[#0056B3] hover:bg-[#004494]' : ''
                      }`}
                      onClick={() => handleStepClick(index)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="text-2xl">{step.aiMessages[0]?.icon || '📍'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              {step.time}
                            </Badge>
                            <span className="font-medium text-sm">{step.sceneName}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            📍 {step.room}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


