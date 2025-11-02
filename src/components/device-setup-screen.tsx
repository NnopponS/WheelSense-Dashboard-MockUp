import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Radio, CheckCircle2, Network, ArrowRight, Edit, Save, Plus, Trash2, Settings, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import { Device, MeshRoute, Building, Floor, Room } from '../lib/types';

// Add Wheelchair Form Component
function AddWheelchairForm({ 
  devices, 
  setDevices, 
  buildings, 
  floors, 
  rooms,
  wheelchairCount 
}: { 
  devices: Device[], 
  setDevices: (devices: Device[]) => void,
  buildings: Building[],
  floors: Floor[],
  rooms: Room[],
  wheelchairCount: number
}) {
  const [name, setName] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState(buildings[0]?.id || '');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  const buildingFloors = floors.filter(f => f.buildingId === selectedBuilding);
  const floorRooms = rooms.filter(r => r.floorId === selectedFloor);

  // Auto-select first floor when building changes
  useEffect(() => {
    if (selectedBuilding && buildingFloors.length > 0) {
      setSelectedFloor(buildingFloors[0].id);
    }
  }, [selectedBuilding, buildingFloors]);

  // Auto-select first room when floor changes
  useEffect(() => {
    if (selectedFloor && floorRooms.length > 0) {
      setSelectedRoom(floorRooms[0].name);
    }
  }, [selectedFloor, floorRooms]);

  const handleAdd = () => {
    if (!selectedRoom) {
      toast.error('Please select a room');
      return;
    }

    const newId = `W-${String(wheelchairCount + 1).padStart(2, '0')}`;
    const newWheelchair: Device = {
      id: newId,
      name: name || `WheelSense ${newId}`,
      mac: `AA:BB:CC:DD:EE:${String(Math.floor(Math.random() * 256)).padStart(2, '0')}`,
      rssi: -60 - Math.floor(Math.random() * 20),
      type: 'wheelchair',
      status: 'online',
      room: selectedRoom,
    };
    setDevices([...devices, newWheelchair]);
    toast.success(`Wheelchair ${newId} added to ${selectedRoom}`);
    
    // Close dialog
    const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
    closeButton?.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Wheelchair Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., WheelSense W-01"
        />
      </div>
      <div>
        <Label>Building</Label>
        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
          <SelectTrigger>
            <SelectValue placeholder="Select building" />
          </SelectTrigger>
          <SelectContent>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Floor</Label>
        <Select value={selectedFloor} onValueChange={setSelectedFloor}>
          <SelectTrigger>
            <SelectValue placeholder="Select floor" />
          </SelectTrigger>
          <SelectContent>
            {buildingFloors.map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Room</Label>
        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
          <SelectTrigger>
            <SelectValue placeholder="Select room" />
          </SelectTrigger>
          <SelectContent>
            {floorRooms.map((r) => (
              <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleAdd} className="w-full bg-[#0056B3] hover:bg-[#004494]">
        Add Wheelchair
      </Button>
    </div>
  );
}

interface MQTTRoute {
  from: string;
  to: string;
  topic: string;
  qos: number;
  retained: boolean;
  lastMessage: string;
}

interface MeshRoute {
  nodeId: string;
  path: string[];
  hopCount: number;
  latency: number;
}

interface PatientItem {
  id: string;
  name: string;
  status: 'on_route' | 'arrived' | 'lost';
  destination: string;
  location: string;
  eta_min?: number;
  wheelchairId?: string;
}

export function DeviceSetupScreen() {
  const { devices, setDevices, updateDevice, meshRoutes, updateMeshRoute, buildings, floors, rooms } = useStore();

  const [localDevices] = useState<Device[]>([
    {
      id: 'W-04',
      name: 'WheelSense W-04',
      mac: 'AA:BB:CC:DD:EE:01',
      rssi: -64,
      type: 'wheelchair',
      status: 'online',
      room: 'Clinic',
    },
    {
      id: 'W-02',
      name: 'WheelSense W-02',
      mac: 'AA:BB:CC:DD:EE:02',
      rssi: -58,
      type: 'wheelchair',
      status: 'online',
      room: 'Lobby',
    },
    {
      id: 'W-07',
      name: 'WheelSense W-07',
      mac: 'AA:BB:CC:DD:EE:05',
      rssi: -72,
      type: 'wheelchair',
      status: 'online',
      room: 'Wards',
    },
    {
      id: 'N-01',
      name: 'Room Node - Lobby',
      mac: 'AA:BB:CC:DD:EE:03',
      rssi: -62,
      type: 'node',
      status: 'online',
      room: 'Lobby',
    },
    {
      id: 'N-02',
      name: 'Room Node - Clinic',
      mac: 'AA:BB:CC:DD:EE:04',
      rssi: -68,
      type: 'node',
      status: 'online',
      room: 'Clinic',
    },
    {
      id: 'N-03',
      name: 'Room Node - Wards',
      mac: 'AA:BB:CC:DD:EE:06',
      rssi: -72,
      type: 'node',
      status: 'online',
      room: 'Wards',
    },
    {
      id: 'N-04',
      name: 'Room Node - Corridor',
      mac: 'AA:BB:CC:DD:EE:07',
      rssi: -65,
      type: 'node',
      status: 'online',
      room: 'Corridor',
    },
    {
      id: 'GW-1',
      name: 'Gateway - Main',
      mac: 'AA:BB:CC:DD:EE:FF',
      rssi: -55,
      type: 'gateway',
      status: 'online',
    },
  ]);

  const [mqttRoutes] = useState<MQTTRoute[]>([
    {
      from: 'W-04',
      to: 'GW-1',
      topic: 'wheelsense/wheelchair/W-04/telemetry',
      qos: 1,
      retained: false,
      lastMessage: '2 sec ago',
    },
    {
      from: 'W-02',
      to: 'GW-1',
      topic: 'wheelsense/wheelchair/W-02/telemetry',
      qos: 1,
      retained: false,
      lastMessage: '5 sec ago',
    },
    {
      from: 'W-07',
      to: 'GW-1',
      topic: 'wheelsense/wheelchair/W-07/telemetry',
      qos: 1,
      retained: false,
      lastMessage: '3 sec ago',
    },
    {
      from: 'N-01',
      to: 'GW-1',
      topic: 'wheelsense/node/N-01/status',
      qos: 0,
      retained: true,
      lastMessage: '10 sec ago',
    },
    {
      from: 'N-02',
      to: 'GW-1',
      topic: 'wheelsense/node/N-02/status',
      qos: 0,
      retained: true,
      lastMessage: '8 sec ago',
    },
    {
      from: 'N-03',
      to: 'GW-1',
      topic: 'wheelsense/node/N-03/status',
      qos: 0,
      retained: true,
      lastMessage: '12 sec ago',
    },
    {
      from: 'GW-1',
      to: 'Cloud',
      topic: 'wheelsense/gateway/GW1/status',
      qos: 1,
      retained: true,
      lastMessage: '1 sec ago',
    },
  ]);

  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const updateDeviceName = (device: Device, newName: string) => {
    updateDevice(device.id, { name: newName });
    setEditingDevice(null);
    toast.success(`Device ${device.id} renamed to "${newName}"`);
  };

  const updateDeviceRoom = (device: Device, newRoom: string) => {
    updateDevice(device.id, { room: newRoom });
    toast.success(`Device ${device.id} moved to ${newRoom}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-[#00945E] text-white';
      case 'offline':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const wheelchairDevices = devices.filter((d) => d.type === 'wheelchair');
  const nodeDevices = devices.filter((d) => d.type === 'node');
  const gatewayDevices = devices.filter((d) => d.type === 'gateway');

  return (
    <div className="h-full bg-[#fafafa] overflow-auto">
      <div className="container mx-auto p-2 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="english-text font-bold text-[#0056B3]" style={{fontSize: 'var(--font-size-xl)'}}>Device Manager</h2>
            <p className="thai-text text-muted-foreground font-medium" style={{fontSize: 'var(--font-size-sm)'}}>จัดการรถเข็น อุปกรณ์ และเครือข่าย</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#0056B3] hover:bg-[#004494] h-7 text-xs">
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Wheelchair</DialogTitle>
                </DialogHeader>
                <AddWheelchairForm 
                  devices={devices}
                  setDevices={setDevices}
                  buildings={buildings}
                  floors={floors}
                  rooms={rooms}
                  wheelchairCount={wheelchairDevices.length}
                />
              </DialogContent>
            </Dialog>
            <Badge className="bg-[#00945E] text-white hover:bg-[#00945E]/90 h-10 px-3 md:px-4 hidden md:inline-flex">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              All Systems Online
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="border-l-2 border-l-[#0056B3]">
            <CardHeader className="p-2 pb-1">
              <CardTitle className="text-[10px] text-muted-foreground">
                Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="text-xl font-bold text-[#0056B3]">{devices.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-2 border-l-[#00945E]">
            <CardHeader className="p-2 pb-1">
              <CardTitle className="text-[10px] text-muted-foreground">
                Wheelchairs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="text-xl font-bold text-[#00945E]">{wheelchairDevices.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-2 border-l-[#3b82f6]">
            <CardHeader className="p-2 pb-1">
              <CardTitle className="text-[10px] text-muted-foreground">
                Nodes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="text-xl font-bold text-[#3b82f6]">{nodeDevices.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-2 border-l-[#8b5cf6]">
            <CardHeader className="p-2 pb-1">
              <CardTitle className="text-[10px] text-muted-foreground">
                Routes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="text-xl font-bold text-[#8b5cf6]">{mqttRoutes.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="devices" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="routes" className="text-xs">
              <Network className="h-3 w-3 mr-1" />
              Network
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="mt-2">
            {/* Simplified Single Column Layout */}
            <div className="space-y-3">
              <Card>
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <span className="text-lg">♿</span>
                      <span className="english-text">Wheelchairs ({wheelchairDevices.length})</span>
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="h-7 bg-[#00945E] hover:bg-[#007a4d]">
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Wheelchair</DialogTitle>
                        </DialogHeader>
                        <AddWheelchairForm 
                          devices={devices}
                          setDevices={setDevices}
                          buildings={buildings}
                          floors={floors}
                          rooms={rooms}
                          wheelchairCount={wheelchairDevices.length}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {wheelchairDevices.map((device) => (
                        <Card key={device.id} className="border-l-4 border-l-[#00945E]">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {editingDevice?.id === device.id ? (
                                    <div className="space-y-2">
                                      <div>
                                        <Label className="text-xs">Name</Label>
                                        <Input
                                          value={editingDevice.name}
                                          onChange={(e) =>
                                            setEditingDevice({ ...editingDevice, name: e.target.value })
                                          }
                                          placeholder="Device name"
                                          className="h-8"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">Room</Label>
                                        <Select
                                          value={editingDevice.room}
                                          onValueChange={(value) =>
                                            setEditingDevice({ ...editingDevice, room: value })
                                          }
                                        >
                                          <SelectTrigger className="h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {rooms.map((r) => (
                                              <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            updateDeviceName(device, editingDevice.name);
                                            if (editingDevice.room !== device.room) {
                                              updateDeviceRoom(device, editingDevice.room || '');
                                            }
                                          }}
                                        >
                                          <Save className="mr-2 h-3 w-3" />
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingDevice(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="english-text">{device.name}</h4>
                                        <Badge className={getStatusColor(device.status)}>
                                          {device.status}
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span>MAC:</span>
                                          <code className="bg-gray-100 px-1 rounded">
                                            {device.mac}
                                          </code>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Radio className="h-3 w-3" />
                                          <span>RSSI: {device.rssi} dBm</span>
                                        </div>
                                        {device.room && (
                                          <div className="flex items-center gap-2">
                                            <span>📍 Location: {device.room}</span>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                                {!editingDevice && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => setEditingDevice(device)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                      onClick={() => {
                                        if (confirm(`Delete wheelchair ${device.id}?`)) {
                                          setDevices(devices.filter(d => d.id !== device.id));
                                          toast.success(`Wheelchair ${device.id} deleted`);
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <CheckCircle2 className="h-5 w-5 text-[#00945E]" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                    <Radio className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="english-text">Nodes & Gateways ({nodeDevices.length + gatewayDevices.length})</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Nodes shown here are synced with Map Editor. Add/remove nodes using Map Editor.
                  </p>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {nodeDevices.map((device) => (
                        <Card key={device.id} className="border-l-4 border-l-[#0056B3]">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {editingDevice?.id === device.id ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={editingDevice.name}
                                        onChange={(e) =>
                                          setEditingDevice({ ...editingDevice, name: e.target.value })
                                        }
                                        placeholder="Device name"
                                      />
                                      <Select
                                        value={editingDevice.room}
                                        onValueChange={(value) =>
                                          setEditingDevice({ ...editingDevice, room: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Lobby">Lobby</SelectItem>
                                          <SelectItem value="Clinic">Clinic</SelectItem>
                                          <SelectItem value="Wards">Wards</SelectItem>
                                          <SelectItem value="Corridor">Corridor</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            updateDeviceName(device, editingDevice.name);
                                            if (editingDevice.room !== device.room) {
                                              updateDeviceRoom(device, editingDevice.room || '');
                                            }
                                          }}
                                        >
                                          <Save className="mr-2 h-3 w-3" />
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingDevice(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="english-text">{device.name}</h4>
                                        <Badge className={getStatusColor(device.status)}>
                                          {device.status}
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span>MAC:</span>
                                          <code className="bg-gray-100 px-1 rounded">
                                            {device.mac}
                                          </code>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Radio className="h-3 w-3" />
                                          <span>RSSI: {device.rssi} dBm</span>
                                        </div>
                                        {device.room && (
                                          <div className="flex items-center gap-2">
                                            <span>📍 Room: {device.room}</span>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                                {!editingDevice && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => setEditingDevice(device)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <CheckCircle2 className="h-5 w-5 text-[#0056B3]" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {gatewayDevices.map((device) => (
                        <Card key={device.id} className="border-l-4 border-l-[#8b5cf6]">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="english-text">{device.name}</h4>
                                  <Badge className={getStatusColor(device.status)}>
                                    {device.status}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span>MAC:</span>
                                    <code className="bg-gray-100 px-1 rounded">
                                      {device.mac}
                                    </code>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Radio className="h-3 w-3" />
                                    <span>RSSI: {device.rssi} dBm</span>
                                  </div>
                                </div>
                              </div>
                              <CheckCircle2 className="h-5 w-5 text-[#8b5cf6]" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="routes" className="mt-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {/* MQTT Route Diagram */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    <div>
                      <span className="english-text">MQTT Topology (Live)</span>
                      <p className="thai-text text-sm text-muted-foreground">
                        อัปเดตตาม Mesh Routes
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-[500px] bg-white border-2 border-border rounded-lg overflow-hidden p-4">
                    <svg width="100%" height="100%" viewBox="0 0 400 500">
                      {/* Gateway at center */}
                      <g>
                        <rect x="150" y="240" width="100" height="60" fill="#8b5cf6" rx="8" />
                        <text x="200" y="260" textAnchor="middle" fill="white" fontSize="12">
                          🔗
                        </text>
                        <text x="200" y="280" textAnchor="middle" fill="white" fontSize="11">
                          Gateway
                        </text>
                        <text x="200" y="292" textAnchor="middle" fill="white" fontSize="9">
                          GW-1
                        </text>
                      </g>

                      {/* Cloud/Broker */}
                      <g>
                        <rect x="150" y="20" width="100" height="50" fill="#0056B3" rx="8" />
                        <text x="200" y="40" textAnchor="middle" fill="white" fontSize="12">
                          ☁️
                        </text>
                        <text x="200" y="58" textAnchor="middle" fill="white" fontSize="10">
                          MQTT Broker
                        </text>
                      </g>

                      {/* Arrow Gateway to Cloud */}
                      <line
                        x1="200"
                        y1="240"
                        x2="200"
                        y2="70"
                        stroke="#0056B3"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead-blue)"
                      />

                      {/* Wheelchairs */}
                      <g>
                        <circle cx="50" cy="350" r="30" fill="#00945E" />
                        <text x="50" y="355" textAnchor="middle" fill="white" fontSize="12">
                          ♿
                        </text>
                        <text x="50" y="395" textAnchor="middle" fontSize="9">
                          W-04
                        </text>
                      </g>

                      <g>
                        <circle cx="200" cy="380" r="30" fill="#00945E" />
                        <text x="200" y="385" textAnchor="middle" fill="white" fontSize="12">
                          ♿
                        </text>
                        <text x="200" y="425" textAnchor="middle" fontSize="9">
                          W-02
                        </text>
                      </g>

                      <g>
                        <circle cx="350" cy="350" r="30" fill="#00945E" />
                        <text x="350" y="355" textAnchor="middle" fill="white" fontSize="12">
                          ♿
                        </text>
                        <text x="350" y="395" textAnchor="middle" fontSize="9">
                          W-07
                        </text>
                      </g>

                      {/* Nodes */}
                      <g>
                        <circle cx="80" cy="180" r="25" fill="#3b82f6" />
                        <text x="80" y="185" textAnchor="middle" fill="white" fontSize="10">
                          📡
                        </text>
                        <text x="80" y="215" textAnchor="middle" fontSize="8">
                          N-01
                        </text>
                      </g>

                      <g>
                        <circle cx="320" cy="180" r="25" fill="#3b82f6" />
                        <text x="320" y="185" textAnchor="middle" fill="white" fontSize="10">
                          📡
                        </text>
                        <text x="320" y="215" textAnchor="middle" fontSize="8">
                          N-02
                        </text>
                      </g>

                      {/* Connection lines */}
                      <line x1="50" y1="320" x2="180" y2="285" stroke="#00945E" strokeWidth="2" strokeDasharray="4,4" />
                      <line x1="200" y1="350" x2="200" y2="300" stroke="#00945E" strokeWidth="2" strokeDasharray="4,4" />
                      <line x1="350" y1="320" x2="220" y2="285" stroke="#00945E" strokeWidth="2" strokeDasharray="4,4" />
                      <line x1="80" y1="205" x2="160" y2="250" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" />
                      <line x1="320" y1="205" x2="240" y2="250" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" />

                      <defs>
                        <marker
                          id="arrowhead-blue"
                          markerWidth="10"
                          markerHeight="10"
                          refX="9"
                          refY="3"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3, 0 6" fill="#0056B3" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* Route List */}
              <Card>
                <CardHeader>
                  <CardTitle className="english-text">Active MQTT Routes</CardTitle>
                  <p className="thai-text text-sm text-muted-foreground">เส้นทางการส่งข้อมูล MQTT</p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {mqttRoutes.map((route, idx) => (
                        <Card key={idx} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-[#0056B3] text-white">
                                  {route.from}
                                </Badge>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <Badge className="bg-[#00945E] text-white">
                                  {route.to}
                                </Badge>
                              </div>
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Topic:</span>
                                  <code className="bg-white px-2 py-0.5 rounded text-[#0056B3]">
                                    {route.topic}
                                  </code>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">QoS:</span>
                                    <Badge variant="outline">{route.qos}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Retained:</span>
                                    <Badge variant="outline">
                                      {route.retained ? 'Yes' : 'No'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-muted-foreground">
                                  Last: {route.lastMessage}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
