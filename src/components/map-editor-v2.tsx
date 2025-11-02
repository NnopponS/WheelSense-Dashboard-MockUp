import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapCanvas } from './map-editor/MapCanvas';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Building2, Plus, Edit, Trash2, Save, Map, Move, ZoomIn, ZoomOut, 
  Grid3x3, Layers, Eye, EyeOff, X, Lightbulb, DoorClosed, Wind, Fan, Tv 
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import { Room, Floor, Building, Device, ApplianceKind, Corridor } from '../lib/types';
import { BuildingFloorManager } from './map-editor/BuildingFloorManager';
import { RoomCreator } from './map-editor/RoomCreator';

export function MapEditorV2() {
  const {
    buildings,
    floors,
    rooms,
    corridors,
    devices,
    setRooms,
    setDevices,
    setCorridors,
    setBuildings,
    setFloors,
    updateRoom,
    updateDevice,
    deleteCorridor,
  } = useStore();

  const [selectedBuilding, setSelectedBuilding] = useState<string>(buildings[0]?.id || '');
  const [selectedFloor, setSelectedFloor] = useState<string>(floors[0]?.id || '');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  // View controls
  const [zoom, setZoom] = useState<number>(0.8);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAppliances, setShowAppliances] = useState<boolean>(true);
  const [showCorridors, setShowCorridors] = useState<boolean>(true);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Corridor (Path) drawing - pixel-based grid
  const [corridorMode, setCorridorMode] = useState<'none' | 'drawing'>('none');
  const [corridorPoints, setCorridorPoints] = useState<{x: number, y: number}[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor | null>(null);
  const corridorGridSize = 40; // Grid cell size for corridor points
  
  // Appliance management
  const [showApplianceMenu, setShowApplianceMenu] = useState(false);
  const [newAppliance, setNewAppliance] = useState<Partial<Device>>({
    name: '',
    type: 'appliance',
    kind: 'light',
    status: 'offline',
    room: '',
  });

  const currentFloorRooms = rooms.filter((r) => r.floorId === selectedFloor);
  const currentFloorCorridors = corridors.filter((c) => c.floorId === selectedFloor);
  const currentBuildingFloors = floors
    .filter((f) => f.buildingId === selectedBuilding)
    .sort((a, b) => a.level - b.level);

  useEffect(() => {
    if (!selectedBuilding && buildings.length > 0) {
      setSelectedBuilding(buildings[0].id);
    }
  }, [buildings, selectedBuilding]);

  useEffect(() => {
    if (selectedBuilding) {
      const buildingFloors = floors.filter((f) => f.buildingId === selectedBuilding);
      if (!buildingFloors.some((f) => f.id === selectedFloor)) {
        const firstFloor = buildingFloors[0];
        if (firstFloor) setSelectedFloor(firstFloor.id);
      }
    }
  }, [floors, selectedBuilding, selectedFloor]);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setEditingRoom({...room});
  };

  const handleRoomDrag = (roomId: string, newX: number, newY: number) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const updatedRoom = { ...room, x: newX, y: newY };
    
    // Update in the rooms array directly
    const updatedRooms = rooms.map((r) => (r.id === roomId ? updatedRoom : r));
    setRooms(updatedRooms);
    
    if (selectedRoom?.id === roomId) {
      setSelectedRoom(updatedRoom);
      setEditingRoom(updatedRoom);
    }
  };

  const handleRoomResize = (roomId: string, newWidth: number, newHeight: number) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    // Update immediately without snapping for smooth resize
    const updatedRoom = { ...room, width: newWidth, height: newHeight };
    
    // Update in the rooms array directly
    const updatedRooms = rooms.map((r) => (r.id === roomId ? updatedRoom : r));
    setRooms(updatedRooms);
    
    if (selectedRoom?.id === roomId) {
      setSelectedRoom(updatedRoom);
      setEditingRoom(updatedRoom);
    }
  };

  const handleSaveRoom = () => {
    if (!editingRoom) return;
    
    // Update rooms array directly
    const updatedRooms = rooms.map((r) => (r.id === editingRoom.id ? editingRoom : r));
    setRooms(updatedRooms);
    setSelectedRoom(editingRoom);
    
    toast.success(`บันทึก ${editingRoom.name} สำเร็จ`);
  };

  const handleAddAppliance = () => {
    if (!newAppliance.name || !newAppliance.room) {
      toast.error('กรุณากรอกชื่ออุปกรณ์และเลือกห้อง');
      return;
    }

    const appliance: Device = {
      id: `APP-${Date.now()}`,
      name: newAppliance.name,
      mac: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}:BB:CC:DD:EE:FF`,
      rssi: -40 - Math.floor(Math.random() * 30),
      type: 'appliance',
      kind: newAppliance.kind as ApplianceKind,
      status: 'offline',
      room: newAppliance.room,
      x: 0,
      y: 0,
    };

    setDevices([...devices, appliance]);
    setNewAppliance({
      name: '',
      type: 'appliance',
      kind: 'light',
      status: 'offline',
      room: '',
    });
    toast.success(`เพิ่มอุปกรณ์ ${appliance.name} สำเร็จ`);
  };

  const handleDeleteAppliance = (applianceId: string) => {
    if (window.confirm('ต้องการลบอุปกรณ์นี้?')) {
      setDevices(devices.filter(d => d.id !== applianceId));
      toast.success('ลบอุปกรณ์สำเร็จ');
    }
  };

  const getApplianceIcon = (kind?: string) => {
    switch (kind) {
      case 'light': return <Lightbulb className="h-4 w-4" />;
      case 'door': return <DoorClosed className="h-4 w-4" />;
      case 'ac': return <Wind className="h-4 w-4" />;
      case 'fan': return <Fan className="h-4 w-4" />;
      default: return <Tv className="h-4 w-4" />;
    }
  };

  // Pan handlers
  const handleSvgMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStartRef.current) return;
    const nx = e.clientX - panStartRef.current.x;
    const ny = e.clientY - panStartRef.current.y;
    setPan({ x: nx, y: ny });
  };

  const handleSvgMouseUp = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3));
  };

  const appliances = devices.filter(d => d.type === 'appliance');
  const roomAppliances = selectedRoom 
    ? appliances.filter(a => a.room === selectedRoom.name)
    : [];

  // Save corridor path
  const handleFinishCorridor = () => {
    if (corridorPoints.length >= 2) {
      const newCorridor: Corridor = {
        id: `cor-${Date.now()}`,
        name: `Path ${currentFloorCorridors.length + 1}`,
        points: corridorPoints,
        width: 24,
        floorId: selectedFloor,
        color: '#93c5fd',
      };
      setCorridors([...corridors, newCorridor]);
      toast.success(`สร้างเส้นทาง ${newCorridor.name} สำเร็จ!`);
    }
    setCorridorPoints([]);
    setCorridorMode('none');
  };

  // Building/Floor Management
  const handleBuildingAdd = (building: Building) => {
    setBuildings([...buildings, building]);
  };

  const handleBuildingUpdate = (buildingId: string, updates: Partial<Building>) => {
    setBuildings(buildings.map((b) => (b.id === buildingId ? { ...b, ...updates } : b)));
  };

  const handleBuildingDelete = (buildingId: string) => {
    setBuildings(buildings.filter((b) => b.id !== buildingId));
  };

  const handleFloorAdd = (floor: Floor) => {
    setFloors([...floors, floor]);
  };

  const handleFloorUpdate = (floorId: string, updates: Partial<Floor>) => {
    setFloors(floors.map((f) => (f.id === floorId ? { ...f, ...updates } : f)));
  };

  const handleFloorDelete = (floorId: string) => {
    setFloors(floors.filter((f) => f.id !== floorId));
    // Also delete rooms in this floor
    setRooms(rooms.filter((r) => r.floorId !== floorId));
  };

  const handleRoomCreate = (room: Room) => {
    setRooms([...rooms, room]);
  };

  const handleRoomDelete = (roomId: string) => {
    if (window.confirm('ต้องการลบห้องนี้?')) {
      setRooms(rooms.filter((r) => r.id !== roomId));
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(null);
        setEditingRoom(null);
      }
      toast.success('ลบห้องสำเร็จ');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Top Controls Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <Tabs defaultValue="navigate" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-3">
              <TabsTrigger value="navigate">🗺️ Navigate</TabsTrigger>
              <TabsTrigger value="manage">🏢 Manage</TabsTrigger>
              <TabsTrigger value="view">👁️ View</TabsTrigger>
            </TabsList>

            <TabsContent value="navigate" className="m-0">
              <div className="flex flex-wrap items-center gap-3">
                {/* Building Selector */}
                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                  <Building2 className="h-4 w-4 text-[#0056B3]" />
                  <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Floor Selector */}
                <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                  <Layers className="h-4 w-4 text-[#00945E]" />
                  <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentBuildingFloors.map((f) => (
                        <SelectItem key={f.id} value={f.id}>Floor {f.level} - {f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Creator Button */}
                <RoomCreator floorId={selectedFloor} onRoomCreate={handleRoomCreate} />
              </div>
            </TabsContent>

            <TabsContent value="manage" className="m-0">
              <BuildingFloorManager
                buildings={buildings}
                floors={floors}
                onBuildingAdd={handleBuildingAdd}
                onBuildingUpdate={handleBuildingUpdate}
                onBuildingDelete={handleBuildingDelete}
                onFloorAdd={handleFloorAdd}
                onFloorUpdate={handleFloorUpdate}
                onFloorDelete={handleFloorDelete}
              />
            </TabsContent>

            <TabsContent value="view" className="m-0">
              {/* View Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={zoomOut}
                  className="h-9 w-9 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={zoomIn}
                  className="h-9 w-9 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={showGrid ? 'default' : 'outline'}
                  onClick={() => setShowGrid(!showGrid)}
                  className="h-9"
                >
                  <Grid3x3 className="h-4 w-4 mr-1" />
                  Grid
                </Button>
                <Button
                  size="sm"
                  variant={showAppliances ? 'default' : 'outline'}
                  onClick={() => setShowAppliances(!showAppliances)}
                  className="h-9"
                >
                  {showAppliances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="ml-1">Devices</span>
                </Button>
                <Button
                  size="sm"
                  variant={showCorridors ? 'default' : 'outline'}
                  onClick={() => setShowCorridors(!showCorridors)}
                  className="h-9"
                >
                  {showCorridors ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="ml-1">Paths</span>
                </Button>
                <Button
                  size="sm"
                  variant={corridorMode === 'drawing' ? 'default' : 'outline'}
                  onClick={() => {
                    if (corridorMode === 'drawing') {
                      handleFinishCorridor();
                    } else {
                      setCorridorMode('drawing');
                      setCorridorPoints([]);
                      toast.info('คลิกบนแผนที่เพื่อสร้างเส้นทาง');
                    }
                  }}
                  className={corridorMode === 'drawing' ? 'h-9 bg-[#0056B3]' : 'h-9'}
                >
                  {corridorMode === 'drawing' ? `✓ บันทึก (${corridorPoints.length})` : '🛤️ วาดเส้นทาง'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Map Area - Left */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Map Canvas */}
          <Card className="flex-1 border shadow-sm overflow-hidden">
            <CardContent className="p-0 h-full">
              <div 
                className="w-full bg-gray-50 overflow-hidden rounded-lg"
                style={{ height: 'clamp(500px, 60vh, 700px)' }}
              >
                <MapCanvas
                  rooms={currentFloorRooms}
                  corridors={currentFloorCorridors}
                  devices={devices}
                  selectedRoom={selectedRoom}
                  selectedCorridor={selectedCorridor}
                  showGrid={showGrid}
                  showAppliances={showAppliances}
                  showCorridors={showCorridors}
                  corridorMode={corridorMode}
                  corridorPoints={corridorPoints}
                  zoom={zoom}
                  pan={pan}
                  onRoomClick={handleRoomClick}
                  onRoomDrag={handleRoomDrag}
                  onRoomResize={handleRoomResize}
                  onCorridorClick={(corridor) => {
                    setSelectedCorridor(corridor);
                    setSelectedRoom(null);
                    setEditingRoom(null);
                  }}
                  onCanvasClick={(point) => {
                    if (corridorMode === 'drawing') {
                      const exists = corridorPoints.some(p => p.x === point.x && p.y === point.y);
                      if (!exists) {
                        setCorridorPoints([...corridorPoints, point]);
                        toast.info(`จุดที่ ${corridorPoints.length + 1}`);
                      }
                    }
                  }}
                  onPanStart={(e) => {
                    if (corridorMode !== 'drawing') {
                      handleSvgMouseDown(e);
                    }
                  }}
                  onPanMove={handleSvgMouseMove}
                  onPanEnd={handleSvgMouseUp}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Edit Panel */}
        <div className="w-full md:w-80 lg:w-96">
          <Card className="border shadow-sm h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedCorridor ? '🛤️ เส้นทาง' : selectedRoom ? '🏠 แก้ไข Room' : 'เลือก Room'}
              </CardTitle>
              {(selectedRoom || selectedCorridor) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedRoom(null);
                    setEditingRoom(null);
                    setSelectedCorridor(null);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedCorridor ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{selectedCorridor.name}</h4>
                  <Badge variant="outline">{selectedCorridor.id}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">จำนวนจุด:</span>
                    <span>{selectedCorridor.points.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ความกว้าง:</span>
                    <span>{selectedCorridor.width}px</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">สี:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: selectedCorridor.color }}
                      />
                      <span>{selectedCorridor.color}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (window.confirm('ต้องการลบเส้นทางนี้?')) {
                      deleteCorridor(selectedCorridor.id);
                      setSelectedCorridor(null);
                      toast.success('ลบเส้นทางสำเร็จ');
                    }
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  ลบเส้นทาง
                </Button>
              </div>
            ) : selectedRoom && editingRoom ? (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">ข้อมูล</TabsTrigger>
                  <TabsTrigger value="appliances">อุปกรณ์</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div>
                    <Label>ชื่อห้อง</Label>
                    <Input
                      value={editingRoom.name}
                      onChange={(e) => setEditingRoom({...editingRoom, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>X</Label>
                      <Input
                        type="number"
                        value={editingRoom.x}
                        onChange={(e) => setEditingRoom({...editingRoom, x: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Y</Label>
                      <Input
                        type="number"
                        value={editingRoom.y}
                        onChange={(e) => setEditingRoom({...editingRoom, y: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Width</Label>
                      <Input
                        type="number"
                        value={editingRoom.width}
                        onChange={(e) => setEditingRoom({...editingRoom, width: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Height</Label>
                      <Input
                        type="number"
                        value={editingRoom.height}
                        onChange={(e) => setEditingRoom({...editingRoom, height: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>สี</Label>
                    <Input
                      type="color"
                      value={editingRoom.color || '#f5f5f5'}
                      onChange={(e) => setEditingRoom({...editingRoom, color: e.target.value})}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Button onClick={handleSaveRoom} className="w-full bg-[#0056B3] hover:bg-[#004494]">
                      <Save className="mr-2 h-4 w-4" />
                      บันทึก
                    </Button>
                    <Button 
                      onClick={() => handleRoomDelete(editingRoom.id)} 
                      variant="destructive" 
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      ลบห้อง
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="appliances" className="space-y-3 mt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {roomAppliances.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          ไม่มีอุปกรณ์ในห้องนี้
                        </p>
                      ) : (
                        roomAppliances.map((app) => (
                          <Card key={app.id} className="border">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getApplianceIcon(app.kind)}
                                  <div>
                                    <p className="font-medium text-sm">{app.name}</p>
                                    <p className="text-xs text-muted-foreground">{app.kind}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={app.status === 'online' ? 'default' : 'secondary'}>
                                    {app.status}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteAppliance(app.id)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  <Dialog open={showApplianceMenu} onOpenChange={setShowApplianceMenu}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-[#00945E] hover:bg-[#007a4d]">
                        <Plus className="mr-2 h-4 w-4" />
                        เพิ่มอุปกรณ์
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>เพิ่มอุปกรณ์ใหม่</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>ชื่ออุปกรณ์</Label>
                          <Input
                            value={newAppliance.name}
                            onChange={(e) => setNewAppliance({...newAppliance, name: e.target.value})}
                            placeholder="เช่น โคมไฟห้องนั่งเล่น"
                          />
                        </div>

                        <div>
                          <Label>ประเภท</Label>
                          <Select 
                            value={newAppliance.kind} 
                            onValueChange={(value) => setNewAppliance({...newAppliance, kind: value as ApplianceKind})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">💡 ไฟ (Light)</SelectItem>
                              <SelectItem value="door">🚪 ประตู (Door)</SelectItem>
                              <SelectItem value="ac">❄️ แอร์ (AC)</SelectItem>
                              <SelectItem value="fan">🌀 พัดลม (Fan)</SelectItem>
                              <SelectItem value="curtain">🪟 ม่าน (Curtain)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>ห้อง</Label>
                          <Select 
                            value={newAppliance.room} 
                            onValueChange={(value) => setNewAppliance({...newAppliance, room: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกห้อง" />
                            </SelectTrigger>
                            <SelectContent>
                              {currentFloorRooms.map((room) => (
                                <SelectItem key={room.id} value={room.name}>
                                  {room.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button onClick={handleAddAppliance} className="w-full bg-[#0056B3] hover:bg-[#004494]">
                          <Plus className="mr-2 h-4 w-4" />
                          เพิ่มอุปกรณ์
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>คลิกที่ห้องในแผนที่เพื่อแก้ไข</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}

