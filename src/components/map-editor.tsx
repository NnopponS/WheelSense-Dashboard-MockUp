import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Building2, Plus, Edit, Trash2, Save, Map, Move, Undo2, Redo2, Download, Upload, Settings2, Grid3x3, Layers, ChevronDown, Eye, EyeOff, Maximize2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import { Room, Floor, Building, Device, ApplianceKind, Corridor } from '../lib/types';

export function MapEditor() {
  const {
    buildings,
    floors,
    rooms,
    corridors,
    devices,
    setBuildings,
    setFloors,
    setRooms,
    setCorridors,
    updateRoom,
    updateCorridor,
    deleteCorridor,
    setDevices,
    updateDevice,
    resetDemoData,
    setSelectedRoomId,
  } = useStore();

  const [selectedBuilding, setSelectedBuilding] = useState<string>(buildings[0]?.id || '');
  const [selectedFloor, setSelectedFloor] = useState<string>(floors[0]?.id || '');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Grid and locking controls
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(20);
  const [lockPositions, setLockPositions] = useState<boolean>(false);
  
  // Responsive initial zoom based on screen width
  const getInitialZoom = () => {
    if (typeof window === 'undefined') return 1.0;
    const width = window.innerWidth;
    if (width >= 1920) return 1.5;      // Ultra-wide: 150%
    if (width >= 1440) return 1.3;      // Desktop: 130%
    if (width >= 1024) return 1.1;      // Laptop: 110%
    if (width >= 768) return 0.9;       // Tablet: 90%
    return 0.7;                          // Mobile: 70%
  };
  
  const [zoom, setZoom] = useState<number>(getInitialZoom());
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    color: '#e8f4ff',
  });

  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [draggingRoom, setDraggingRoom] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingAppliance, setDraggingAppliance] = useState<string | null>(null);
  const [dragApplianceOffset, setDragApplianceOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  // Node/Gateway placement mode
  const [placementMode, setPlacementMode] = useState<'none' | 'node' | 'gateway'>('none');

  // Corridor drawing mode (grid-based)
  const [corridorMode, setCorridorMode] = useState<'none' | 'drawing'>('none');
  const [corridorPoints, setCorridorPoints] = useState<{x: number, y: number}[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor | null>(null);
  
  // All Rooms collapsible state
  const [showAllRooms, setShowAllRooms] = useState(false);
  const corridorGridSize = 40; // Grid cell size for corridor points

  // Node/Gateway management
  const [selectedNode, setSelectedNode] = useState<Device | null>(null);

  // UI organization states
  const [showViewControls, setShowViewControls] = useState(true);
  const [showEditControls, setShowEditControls] = useState(true);
  const [showLayerControls, setShowLayerControls] = useState(false);
  const [showRooms, setShowRooms] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [showNodes, setShowNodes] = useState(true);
  const [showAppliances, setShowAppliances] = useState(true);

  // Undo/Redo state
  const [history, setHistory] = useState<{rooms: Room[], corridors: Corridor[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ rooms: [...rooms], corridors: [...corridors] });
    // Keep only last 50 actions
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [rooms, corridors, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setRooms(prevState.rooms);
      setCorridors(prevState.corridors);
      setHistoryIndex(historyIndex - 1);
      toast.success('Undo');
    }
  }, [history, historyIndex, setRooms, setCorridors]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setRooms(nextState.rooms);
      setCorridors(nextState.corridors);
      setHistoryIndex(historyIndex + 1);
      toast.success('Redo');
    }
  }, [history, historyIndex, setRooms, setCorridors]);

  const currentFloorRooms = rooms.filter((r) => r.floorId === selectedFloor);
  const currentFloorCorridors = corridors.filter((c) => c.floorId === selectedFloor);
  const currentBuilding = buildings.find((b) => b.id === selectedBuilding);
  const currentFloor = floors.find((f) => f.id === selectedFloor);
  const sortedBuildings = [...buildings].sort((a, b) => a.name.localeCompare(b.name));
  const currentBuildingFloors = floors
    .filter((f) => f.buildingId === selectedBuilding)
    .sort((a, b) => a.level - b.level);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Ensure defaults are valid once data loads or changes
  useEffect(() => {
    if (!selectedBuilding && buildings.length > 0) {
      setSelectedBuilding(buildings[0].id);
    }
  }, [buildings, selectedBuilding]);

  useEffect(() => {
    if (selectedBuilding) {
      const buildingFloors = floors.filter((f) => f.buildingId === selectedBuilding);
      const hasSelectedOnBuilding = buildingFloors.some((f) => f.id === selectedFloor);
      if (!hasSelectedOnBuilding) {
        const firstFloor = buildingFloors[0];
        if (firstFloor) setSelectedFloor(firstFloor.id);
      }
    } else if (!selectedFloor && floors.length > 0) {
      setSelectedFloor(floors[0].id);
    }
  }, [floors, selectedBuilding, selectedFloor]);

  // Sync rooms with nodes - create rooms for nodes that don't have rooms
  useEffect(() => {
    const nodes = devices.filter((d) => d.type === 'node');
    const newRooms: Room[] = [];

    nodes.forEach((node) => {
      const existingRoom = rooms.find((r) => r.nodeId === node.id);
      if (!existingRoom && node.room) {
        // Create new room for this node
        const newRoom: Room = {
          id: `room-${node.id}`,
          name: node.room,
          x: 100 + newRooms.length * 220,
          y: 100,
          width: 200,
          height: 150,
          color: '#e8f4ff',
          floorId: selectedFloor,
          nodeId: node.id,
        };
        newRooms.push(newRoom);
      }
    });

    if (newRooms.length > 0) {
      setRooms([...rooms, ...newRooms]);
      toast.success(`Added ${newRooms.length} new room(s) from nodes`);
    }
  }, [devices]);

  // Building Management
  const addBuilding = () => {
    const newId = `B${buildings.length + 1}`;
    const building: Building = {
      id: newId,
      name: `Building ${buildings.length + 1}`,
    };
    setBuildings([...buildings, building]);
    toast.success('Building added');
  };

  const updateBuilding = (id: string, name: string) => {
    setBuildings(buildings.map((b) => (b.id === id ? { ...b, name } : b)));
    setEditingBuilding(null);
    toast.success('Building updated');
  };

  const deleteBuilding = (id: string) => {
    if (buildings.length === 1) {
      toast.error('Cannot delete the last building');
      return;
    }
    
    // Delete all related data
    const buildingFloors = floors.filter(f => f.buildingId === id);
    const floorIds = buildingFloors.map(f => f.id);
    
    // Delete rooms on these floors
    setRooms(rooms.filter(r => !floorIds.includes(r.floorId)));
    
    // Delete corridors on these floors
    setCorridors(corridors.filter(c => !floorIds.includes(c.floorId)));
    
    // Delete floors
    setFloors(floors.filter((f) => f.buildingId !== id));
    
    // Delete building
    setBuildings(buildings.filter((b) => b.id !== id));
    
    // Switch to another building if current one is deleted
    if (selectedBuilding === id) {
      const remainingBuildings = buildings.filter((b) => b.id !== id);
      if (remainingBuildings.length > 0) {
        setSelectedBuilding(remainingBuildings[0].id);
      }
    }
    
    toast.success('Building and all related data deleted');
  };

  // Floor Management
  const addFloor = () => {
    const buildingFloors = floors.filter((f) => f.buildingId === selectedBuilding);
    const newId = `F${floors.length + 1}`;
    const floor: Floor = {
      id: newId,
      name: `Floor ${buildingFloors.length + 1}`,
      level: buildingFloors.length + 1,
      buildingId: selectedBuilding,
    };
    setFloors([...floors, floor]);
    toast.success('Floor added');
  };

  const updateFloor = (id: string, name: string) => {
    setFloors(floors.map((f) => (f.id === id ? { ...f, name } : f)));
    setEditingFloor(null);
    toast.success('Floor updated');
  };

  const deleteFloor = (id: string) => {
    if (currentBuildingFloors.length === 1) {
      toast.error('Cannot delete the last floor');
      return;
    }
    setFloors(floors.filter((f) => f.id !== id));
    setRooms(rooms.filter((r) => r.floorId !== id));
    toast.success('Floor deleted');
  };

  // Room Management
  const addRoom = () => {
    if (!newRoom.name) {
      toast.error('Please enter room name');
      return;
    }
    saveToHistory();
    const room: Room = {
      id: `room-${Date.now()}`,
      name: newRoom.name,
      x: newRoom.x || 100,
      y: newRoom.y || 100,
      width: newRoom.width || 200,
      height: newRoom.height || 150,
      color: newRoom.color || '#e8f4ff',
      floorId: selectedFloor,
    };
    setRooms([...rooms, room]);
    setIsAddingRoom(false);
    setNewRoom({ name: '', x: 100, y: 100, width: 200, height: 150, color: '#e8f4ff' });
    toast.success('Room added');
  };

  const updateRoomData = (room: Room) => {
    saveToHistory();
    setRooms(rooms.map((r) => (r.id === room.id ? room : r)));
    setEditingRoom(null);
    toast.success('Room updated');
  };

  const deleteRoom = (id: string) => {
    saveToHistory();
    setRooms(rooms.filter((r) => r.id !== id));
    toast.success('Room deleted');
  };

  const saveMapLayout = () => {
    toast.success('Map layout saved to localStorage');
  };

  // Export map data to JSON file
  const exportMapData = () => {
    const mapData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      buildings,
      floors,
      rooms,
      corridors,
      devices: devices.filter(d => d.type === 'node' || d.type === 'gateway'),
    };
    
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wheelsense-map-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Map data exported successfully!');
  };

  // Import map data from JSON file
  const importMapData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const mapData = JSON.parse(e.target?.result as string);
        
        // Validate data
        if (!mapData.buildings || !mapData.floors || !mapData.rooms) {
          toast.error('Invalid map data format');
          return;
        }

        // Save current state to history before import
        saveToHistory();

        // Import data
        setBuildings(mapData.buildings);
        setFloors(mapData.floors);
        setRooms(mapData.rooms);
        setCorridors(mapData.corridors || []);
        
        // Merge devices (keep existing wheelchairs, update nodes/gateways)
        const importedNodes = mapData.devices || [];
        const existingWheelchairs = devices.filter(d => d.type === 'wheelchair');
        const existingAppliances = devices.filter(d => d.type === 'appliance');
        setDevices([...existingWheelchairs, ...existingAppliances, ...importedNodes]);

        toast.success('Map data imported successfully!');
      } catch (error) {
        toast.error('Failed to import map data');
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  // Drag and Drop
  const handleMouseDown = (e: React.MouseEvent, roomId: string) => {
    if (lockPositions) return; // prevent dragging when locked
    const room = rooms.find((r) => r.id === roomId);
    if (!room || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    setDraggingRoom(roomId);
    setDragOffset({
      x: svgP.x - room.x,
      y: svgP.y - room.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    if (draggingRoom) {
      const rawX = svgP.x - dragOffset.x;
      const rawY = svgP.y - dragOffset.y;
      const snap = (v: number) => Math.round(v / gridSize) * gridSize;
      const newX = snapToGrid ? snap(rawX) : rawX;
      const newY = snapToGrid ? snap(rawY) : rawY;
      updateRoom(draggingRoom, { x: newX, y: newY });
    }

    if (draggingAppliance) {
      const rawX = svgP.x - dragApplianceOffset.x;
      const rawY = svgP.y - dragApplianceOffset.y;
      const ap = devices.find((d) => d.id === draggingAppliance);
      if (ap) {
        updateDevice(ap.id, { x: rawX, y: rawY });
      }
    }
  };

  // Zoom controls - disabled mouse wheel, only use buttons
  const clampZoom = (z: number) => Math.min(3, Math.max(0.5, z));
  const handleWheel = (e: React.WheelEvent) => {
    // Note: Zoom disabled with mouse wheel - use buttons instead
  };

  const zoomIn = () => setZoom((z) => clampZoom(Number((z + 0.1).toFixed(2))));
  const zoomOut = () => setZoom((z) => clampZoom(Number((z - 0.1).toFixed(2))));
  const resetZoom = () => setZoom(1);

  const handleSvgMouseDown = (e: React.MouseEvent) => {
    if (!isPanMode) return;
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

  const handleMouseUp = () => {
    if (draggingRoom) {
      toast.success('Room position updated');
    }
    if (draggingAppliance) {
      toast.success('Appliance position updated');
    }
    setDraggingRoom(null);
    setDraggingAppliance(null);
  };

  // Combine SVG pan handlers with drag handlers to avoid duplicate JSX props
  const handleSvgCombinedMouseMove = (e: React.MouseEvent) => {
    handleSvgMouseMove(e);
    handleMouseMove(e);
  };

  const handleSvgCombinedMouseUp = (e: React.MouseEvent) => {
    handleSvgMouseUp();
    handleMouseUp();
  };

  // Get room status from node
  const getRoomStatus = (room: Room) => {
    if (!room.nodeId) return null;
    const node = devices.find((d) => d.id === room.nodeId);
    return node?.status;
  };

  const getApplianceIcon = (kind?: ApplianceKind) => {
    switch (kind) {
      case 'light':
        return '💡';
      case 'door':
        return '🚪';
      case 'curtain':
        return '🪟';
      case 'ac':
        return '❄️';
      case 'fan':
        return '🌀';
      default:
        return '🔌';
    }
  };

  // Helper functions for map controls
  const centerMap = () => {
    setPan({ x: 0, y: 0 });
    toast.success('Map centered');
  };

  const fitToScreen = () => {
    const screenWidth = window.innerWidth;
    let newZoom = 1.0;
    if (screenWidth >= 1920) newZoom = 1.5;
    else if (screenWidth >= 1440) newZoom = 1.3;
    else if (screenWidth >= 1024) newZoom = 1.1;
    else if (screenWidth >= 768) newZoom = 0.9;
    else newZoom = 0.7;
    
    setZoom(newZoom);
    setPan({ x: 0, y: 0 });
    toast.success(`Zoom adjusted to ${Math.round(newZoom * 100)}%`);
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/20 overflow-auto">
      <div className="container mx-auto" style={{padding: 'var(--spacing-md)', paddingBottom: 'var(--spacing-xl)'}}>
        {/* Header */}
        <div className="flex items-center justify-between mb-[var(--spacing-md)]">
          <div>
            <h2 className="english-text font-bold text-[#0056B3]" style={{fontSize: 'var(--font-size-xl)'}}>Map Editor</h2>
            <p className="thai-text text-muted-foreground font-medium" style={{fontSize: 'var(--font-size-sm)'}}>แก้ไขผังอาคารและห้อง</p>
          </div>
          <div className="flex items-center" style={{gap: 'clamp(0.5rem, 1vw, 1rem)'}}>
            <Button 
              onClick={saveMapLayout} 
              className="bg-gradient-to-r from-[#00945E] to-[#00b377] hover:from-[#007a4d] hover:to-[#00945E] shadow-md hover:shadow-lg"
              style={{
                height: 'clamp(2rem, 3vw, 2.75rem)',
                fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
                padding: '0 clamp(0.75rem, 1.5vw, 1.5rem)'
              }}
            >
              <Save style={{marginRight: '0.5rem', width: 'clamp(0.875rem, 1.2vw, 1.125rem)', height: 'clamp(0.875rem, 1.2vw, 1.125rem)'}} />
              Save
            </Button>
            <Button 
              onClick={exportMapData} 
              variant="outline" 
              className="hover:bg-blue-50 hover:border-[#0056B3]"
              style={{
                height: 'clamp(2rem, 3vw, 2.75rem)',
                fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
                padding: '0 clamp(0.75rem, 1.5vw, 1.5rem)'
              }}
            >
              <Download style={{marginRight: '0.5rem', width: 'clamp(0.875rem, 1.2vw, 1.125rem)', height: 'clamp(0.875rem, 1.2vw, 1.125rem)'}} />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById('import-map-input')?.click()}
              className="hover:bg-blue-50 hover:border-[#0056B3]"
              style={{
                height: 'clamp(2rem, 3vw, 2.75rem)',
                fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
                padding: '0 clamp(0.75rem, 1.5vw, 1.5rem)'
              }}
            >
              <Upload style={{marginRight: '0.5rem', width: 'clamp(0.875rem, 1.2vw, 1.125rem)', height: 'clamp(0.875rem, 1.2vw, 1.125rem)'}} />
              Import
            </Button>
            <input
              id="import-map-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={importMapData}
            />
          </div>
        </div>

        {/* Enhanced Control Panel */}
        <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
          <CardContent style={{padding: 'var(--spacing-md)'}}>
            <div className="flex flex-wrap items-center" style={{gap: 'clamp(0.75rem, 1.5vw, 1.25rem)'}}>
              {/* Zoom Controls Group */}
              <div className="flex items-center bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border-2 border-blue-300 shadow-md" style={{gap: 'clamp(0.5rem, 1vw, 1rem)', padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 1.5vw, 1.25rem)'}}>
                <Button 
                  variant="outline" 
                  onClick={zoomOut} 
                  className="bg-white hover:bg-blue-100 hover:border-blue-500 hover:scale-110 transition-all shadow-sm"
                  style={{
                    height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                    width: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                    padding: 0
                  }}
                >
                  <span style={{fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', fontWeight: 'bold'}}>−</span>
                </Button>
                <span 
                  className="font-bold text-[#0056B3] text-center select-none" 
                  style={{
                    fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                    minWidth: 'clamp(4rem, 6vw, 5rem)'
                  }}
                >
                  {Math.round(zoom * 100)}%
                </span>
                <Button 
                  variant="outline" 
                  onClick={zoomIn} 
                  className="bg-white hover:bg-blue-100 hover:border-blue-500 hover:scale-110 transition-all shadow-sm"
                  style={{
                    height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                    width: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                    padding: 0
                  }}
                >
                  <span style={{fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', fontWeight: 'bold'}}>+</span>
                </Button>
              </div>

              {/* Map Control Buttons */}
              <Button
                variant="outline"
                onClick={centerMap}
                className="hover:bg-green-50 hover:border-green-500"
                style={{
                  height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                  padding: '0 clamp(1rem, 2vw, 1.5rem)'
                }}
              >
                <Target style={{marginRight: '0.5rem', width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)'}} />
                Center
              </Button>

              <Button
                variant="outline"
                onClick={fitToScreen}
                className="hover:bg-purple-50 hover:border-purple-500"
                style={{
                  height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                  padding: '0 clamp(1rem, 2vw, 1.5rem)'
                }}
              >
                <Maximize2 style={{marginRight: '0.5rem', width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)'}} />
                Fit Screen
              </Button>

              <div className="h-8 w-px bg-gray-300"></div>

              {/* Toggle Buttons */}
              <Button
                variant={showGrid ? 'default' : 'outline'}
                onClick={() => setShowGrid(!showGrid)}
                className={showGrid ? 'bg-[#0056B3] hover:bg-[#004494] shadow-md' : 'hover:bg-blue-50'}
                style={{
                  height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                  padding: '0 clamp(1rem, 2vw, 1.5rem)'
                }}
              >
                <Grid3x3 style={{marginRight: '0.5rem', width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)'}} />
                Grid
              </Button>

              <Button
                variant={lockPositions ? 'destructive' : 'outline'}
                onClick={() => setLockPositions(!lockPositions)}
                className={lockPositions ? 'shadow-md' : 'hover:bg-orange-50'}
                style={{
                  height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                  padding: '0 clamp(1rem, 2vw, 1.5rem)'
                }}
              >
                {lockPositions ? '🔒 Locked' : '🔓 Unlocked'}
              </Button>

              <div style={{height: 'clamp(1.5rem, 2vw, 2rem)', width: '2px'}} className="bg-gray-300" />

              {/* Add Tools */}
              <Dialog open={isAddingRoom} onOpenChange={setIsAddingRoom}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-[#0056B3] to-[#0066CC] hover:from-[#004494] hover:to-[#0056B3] shadow-md hover:shadow-lg"
                    style={{
                      height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                      fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                      padding: '0 clamp(1rem, 2vw, 1.5rem)'
                    }}
                  >
                    <Plus style={{marginRight: '0.5rem', width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)'}} />
                    Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Room</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Room Name</Label>
                      <Input
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                        placeholder="e.g., Meeting Room"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>X / Y Position</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={newRoom.x}
                            onChange={(e) => setNewRoom({ ...newRoom, x: Number(e.target.value) })}
                            placeholder="X"
                          />
                          <Input
                            type="number"
                            value={newRoom.y}
                            onChange={(e) => setNewRoom({ ...newRoom, y: Number(e.target.value) })}
                            placeholder="Y"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Width / Height</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={newRoom.width}
                            onChange={(e) => setNewRoom({ ...newRoom, width: Number(e.target.value) })}
                            placeholder="W"
                          />
                          <Input
                            type="number"
                            value={newRoom.height}
                            onChange={(e) => setNewRoom({ ...newRoom, height: Number(e.target.value) })}
                            placeholder="H"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input
                        type="color"
                        value={newRoom.color}
                        onChange={(e) => setNewRoom({ ...newRoom, color: e.target.value })}
                      />
                    </div>
                    <Button onClick={addRoom} className="w-full">Add Room</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant={placementMode === 'node' ? 'default' : 'outline'}
                onClick={() => {
                  setPlacementMode(placementMode === 'node' ? 'none' : 'node');
                  setCorridorMode('none');
                }}
                className={placementMode === 'node' ? 'bg-gradient-to-r from-[#0056B3] to-[#0066CC] shadow-md' : 'hover:bg-blue-50 hover:border-[#0056B3]'}
                style={{
                  height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                  padding: '0 clamp(1rem, 2vw, 1.5rem)'
                }}
              >
                📡 {placementMode === 'node' ? 'Click Room' : 'Add Node'}
              </Button>

              <Button 
                variant={corridorMode === 'drawing' ? 'default' : 'outline'}
                onClick={() => {
                  if (corridorMode === 'drawing') {
                    if (corridorPoints.length >= 2) {
                      saveToHistory();
                      const newCorridor: Corridor = {
                        id: `cor-${Date.now()}`,
                        name: `Corridor ${currentFloorCorridors.length + 1}`,
                        points: corridorPoints,
                        width: 24,
                        floorId: selectedFloor,
                        color: '#e5e7eb',
                      };
                      setCorridors([...corridors, newCorridor]);
                      toast.success('Corridor created!');
                    }
                    setCorridorPoints([]);
                    setCorridorMode('none');
                  } else {
                    setCorridorMode('drawing');
                    setPlacementMode('none');
                    setCorridorPoints([]);
                    toast.info('Click points on map');
                  }
                }}
                className={corridorMode === 'drawing' ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-md' : 'hover:bg-orange-50 hover:border-orange-400'}
                style={{
                  height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                  padding: '0 clamp(1rem, 2vw, 1.5rem)'
                }}
              >
                🛤️ {corridorMode === 'drawing' ? `Finish (${corridorPoints.length})` : 'Draw Path'}
              </Button>

              <div style={{height: 'clamp(1.5rem, 2vw, 2rem)', width: '2px'}} className="bg-gray-300" />

              {/* Undo/Redo */}
              <Button 
                variant="outline"
                onClick={undo}
                disabled={historyIndex <= 0}
                title="Undo (Ctrl+Z)"
                className="hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  width: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  padding: 0
                }}
              >
                <Undo2 style={{width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)'}} />
              </Button>
              <Button 
                variant="outline"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="Redo (Ctrl+Y)"
                className="hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  width: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  padding: 0
                }}
              >
                <Redo2 style={{width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)'}} />
              </Button>

              <div className="flex-1" />

              {/* Layer Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowLayerControls(!showLayerControls)}
                className="hover:bg-indigo-50 hover:border-indigo-400"
                style={{
                  height: 'clamp(2.5rem, 3.5vw, 3.25rem)',
                  fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                  padding: '0 clamp(1rem, 2vw, 1.5rem)'
                }}
              >
                <Layers style={{marginRight: '0.5rem', width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)'}} />
                Layers
              </Button>
            </div>

            {/* Layer Controls (Collapsible) */}
            {showLayerControls && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={showRooms ? 'default' : 'outline'}
                  onClick={() => setShowRooms(!showRooms)}
                  className={`h-7 ${showRooms ? 'bg-[#0056B3]' : ''}`}
                >
                  Rooms
                </Button>
                <Button
                  size="sm"
                  variant={showCorridors ? 'default' : 'outline'}
                  onClick={() => setShowCorridors(!showCorridors)}
                  className={`h-7 ${showCorridors ? 'bg-[#f59e0b]' : ''}`}
                >
                  Corridors
                </Button>
                <Button
                  size="sm"
                  variant={showNodes ? 'default' : 'outline'}
                  onClick={() => setShowNodes(!showNodes)}
                  className={`h-7 ${showNodes ? 'bg-[#3b82f6]' : ''}`}
                >
                  Nodes
                </Button>
                <Button
                  size="sm"
                  variant={showAppliances ? 'default' : 'outline'}
                  onClick={() => setShowAppliances(!showAppliances)}
                  className={`h-7 ${showAppliances ? 'bg-[#00945E]' : ''}`}
                >
                  Devices
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compact Building & Floor Selector */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Building2 className="h-4 w-4 text-[#0056B3]" />
                <Select value={selectedBuilding} onValueChange={(value) => {
                  setSelectedBuilding(value);
                  const firstFloor = floors.find((f) => f.buildingId === value);
                  if (firstFloor) setSelectedFloor(firstFloor.id);
                }}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedBuildings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage Buildings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Button onClick={addBuilding} variant="outline" className="w-full" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Building
                      </Button>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {sortedBuildings.map((building) => (
                            <Card key={building.id} className="border">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    {editingBuilding?.id === building.id ? (
                                      <Input
                                        value={editingBuilding.name}
                                        onChange={(e) => setEditingBuilding({ ...editingBuilding, name: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && updateBuilding(building.id, editingBuilding.name)}
                                        className="h-8"
                                      />
                                    ) : (
                                      <h4 className="english-text">{building.name}</h4>
                                    )}
                                    <p className="text-xs text-muted-foreground">{building.id}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingBuilding(building); }}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => {
                                      e.stopPropagation();
                                      if (buildings.length <= 1) { toast.error('Cannot delete the last building'); return; }
                                      if (window.confirm(`Delete "${building.name}"?`)) deleteBuilding(building.id);
                                    }}>
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Layers className="h-4 w-4 text-[#00945E]" />
                <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentBuildingFloors.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage Floors - {currentBuilding?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Button onClick={addFloor} variant="outline" className="w-full" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Floor
                      </Button>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {currentBuildingFloors.map((floor) => (
                            <Card key={floor.id} className="border">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    {editingFloor?.id === floor.id ? (
                                      <Input
                                        value={editingFloor.name}
                                        onChange={(e) => setEditingFloor({ ...editingFloor, name: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && updateFloor(floor.id, editingFloor.name)}
                                        className="h-8"
                                      />
                                    ) : (
                                      <h4 className="english-text">{floor.name}</h4>
                                    )}
                                    <p className="text-xs text-muted-foreground">Level {floor.level}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingFloor(floor); }}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    {currentBuildingFloors.length > 1 && (
                                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteFloor(floor.id); }}>
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Badge variant="outline" className="text-xs">
                {currentFloorRooms.length} rooms
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,400px)] xl:grid-cols-[1fr_minmax(350px,450px)]" style={{gap: 'var(--spacing-md)'}}>
          {/* Map Canvas - Responsive Size */}
          <Card className="shadow-xl border-2 border-blue-200">
            <CardContent style={{padding: 'var(--spacing-sm)'}}>
              <div 
                className="relative w-full bg-gradient-to-br from-white to-blue-50/20 border-4 border-blue-300 rounded-2xl overflow-hidden touch-manipulation shadow-2xl hover:shadow-blue-300/50 transition-shadow"
                style={{
                  height: 'clamp(600px, 70vh, 900px)',
                }}
              >

                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  viewBox="0 0 1400 800"
                  onWheel={handleWheel}
                  onMouseDown={handleSvgMouseDown}
                  onMouseMove={handleSvgCombinedMouseMove}
                  onMouseUp={handleSvgCombinedMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={(e) => {
                    if (corridorMode === 'drawing') {
                      if (!svgRef.current) return;
                      const svg = svgRef.current;
                      const pt = svg.createSVGPoint();
                      pt.x = e.clientX;
                      pt.y = e.clientY;
                      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
                      
                      // Snap to grid
                      const snappedX = Math.round(svgP.x / corridorGridSize) * corridorGridSize;
                      const snappedY = Math.round(svgP.y / corridorGridSize) * corridorGridSize;
                      
                      // Check if this point already exists
                      const exists = corridorPoints.some(p => p.x === snappedX && p.y === snappedY);
                      if (!exists) {
                        setCorridorPoints([...corridorPoints, { x: snappedX, y: snappedY }]);
                        toast.info(`Point ${corridorPoints.length + 1} added`);
                      }
                    }
                  }}
                >
                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* Grid background */}
                    {showGrid && (
                      <>
                        <defs>
                          <pattern id="smallGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                            <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#eeeeee" strokeWidth="1" />
                          </pattern>
                          <pattern id="grid" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
                            <rect width={gridSize * 5} height={gridSize * 5} fill="url(#smallGrid)" />
                            <path d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`} fill="none" stroke="#dddddd" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </>
                    )}
                    
                    {/* Corridors */}
                    {showCorridors && currentFloorCorridors.map((corridor) => (
                      <g key={corridor.id}>
                        <polyline
                          points={corridor.points.map(p => `${p.x},${p.y}`).join(' ')}
                          stroke={corridor.color || '#e5e7eb'}
                          strokeWidth={corridor.width}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => setSelectedCorridor(corridor)}
                        />
                        {corridor.points.map((point, idx) => (
                          <circle
                            key={idx}
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill={selectedCorridor?.id === corridor.id ? '#f59e0b' : '#9ca3af'}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCorridor(corridor);
                            }}
                          />
                        ))}
                      </g>
                    ))}
                    
                    {/* Temporary corridor being drawn */}
                    {corridorMode === 'drawing' && corridorPoints.length > 0 && (
                      <>
                        <polyline
                          points={corridorPoints.map(p => `${p.x},${p.y}`).join(' ')}
                          stroke="#f59e0b"
                          strokeWidth="24"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="10,5"
                          opacity="0.6"
                        />
                        {corridorPoints.map((point, idx) => (
                          <circle
                            key={idx}
                            cx={point.x}
                            cy={point.y}
                            r="8"
                            fill="#f59e0b"
                          />
                        ))}
                      </>
                    )}
                    {showRooms && currentFloorRooms.map((room) => {
                    const status = getRoomStatus(room);
                      const roomAppliances = devices.filter((d) => d.type === 'appliance' && d.room === room.name);
                    return (
                      <g
                        key={room.id}
                        className={placementMode !== 'none' ? 'cursor-pointer' : 'cursor-move hover:opacity-80'}
                        onMouseDown={(e) => !placementMode && handleMouseDown(e, room.id)}
                        onClick={(e) => {
                          if (placementMode !== 'none') {
                            e.stopPropagation();
                            // Add node or gateway
                            const deviceType = placementMode === 'node' ? 'node' : 'gateway';
                            const existingDevices = devices.filter(d => d.type === deviceType);
                            const newId = deviceType === 'node' 
                              ? `N-${String(existingDevices.length + 1).padStart(2, '0')}`
                              : `GW-${existingDevices.length + 1}`;
                            
                            const newDevice: Device = {
                              id: newId,
                              name: `${deviceType === 'node' ? 'Room Node' : 'Gateway'} - ${room.name}`,
                              mac: `AA:BB:CC:DD:EE:${String(Math.floor(Math.random() * 256)).padStart(2, '0')}`,
                              rssi: -55 - Math.floor(Math.random() * 15),
                              type: deviceType,
                              status: 'online',
                              room: room.name,
                            };
                            
                            setDevices([...devices, newDevice]);
                            updateRoom(room.id, { nodeId: newId });
                            toast.success(`${deviceType === 'node' ? 'Node' : 'Gateway'} ${newId} placed in ${room.name}`);
                            setPlacementMode('none');
                          } else {
                            setSelectedRoom(room);
                            setSelectedRoomId(room.id);
                          }
                        }}
                        onMouseEnter={() => setHoveredRoomId(room.id)}
                        onMouseLeave={() => setHoveredRoomId((prev) => (prev === room.id ? null : prev))}
                      >
                        <rect
                          x={room.x}
                          y={room.y}
                          width={room.width}
                          height={room.height}
                          fill={corridorMode === 'drawing' ? '#d1d5db' : room.color}
                          stroke={
                            selectedRoom?.id === room.id
                              ? '#0056B3'
                              : status === 'online'
                              ? '#00945E'
                              : status === 'offline'
                              ? '#dc2626'
                              : '#cccccc'
                          }
                          strokeWidth={selectedRoom?.id === room.id ? '3' : '2'}
                          rx="8"
                          opacity={corridorMode === 'drawing' ? 0.5 : (status === 'offline' ? 0.5 : 1)}
                        />
                        <text
                          x={room.x + room.width / 2}
                          y={room.y + room.height / 2}
                          textAnchor="middle"
                          className="english-text pointer-events-none"
                          fill="#1a1a1a"
                          fontSize="14"
                        >
                          {room.name}
                        </text>
                        {/* Appliances icons in this room */}
                        {showAppliances && roomAppliances.map((ap, idx) => {
                          const ax = ap.x ?? room.x + room.width - 20;
                          const ay = ap.y ?? room.y + 25 + idx * 22;
                          return (
                            <g
                              key={ap.id}
                              transform={`translate(${ax}, ${ay})`}
                              className="cursor-pointer"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                if (lockPositions) return;
                                if (!svgRef.current) return;
                                const svg = svgRef.current;
                                const pt = svg.createSVGPoint();
                                pt.x = e.clientX; pt.y = e.clientY;
                                const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
                                setDraggingAppliance(ap.id);
                                setDragApplianceOffset({ x: svgP.x - (ap.x ?? ax), y: svgP.y - (ap.y ?? ay) });
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateDevice(ap.id, { power: ap.power === 'on' ? 'off' : 'on' });
                              }}
                            >
                              <circle r="10" fill={ap.power === 'on' ? '#00945E' : '#e5e7eb'} stroke="#ffffff" strokeWidth="2" />
                              <text y="4" textAnchor="middle" fontSize="12">{getApplianceIcon(ap.applianceKind)}</text>
                            </g>
                          );
                        })}
                        {showNodes && room.nodeId && (
                          <g
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              const node = devices.find(d => d.id === room.nodeId);
                              if (node) {
                                setSelectedNode(node);
                                setSelectedRoom(null);
                                setSelectedCorridor(null);
                              }
                            }}
                          >
                            <circle
                              cx={room.x + room.width / 2}
                              cy={room.y + room.height / 2 + 20}
                              r="12"
                              fill={status === 'online' ? '#0056B3' : '#dc2626'}
                              stroke="white"
                              strokeWidth="2"
                            />
                            <text
                              x={room.x + room.width / 2}
                              y={room.y + room.height / 2 + 25}
                              textAnchor="middle"
                              fill="white"
                              fontSize="10"
                              className="pointer-events-none"
                            >
                              📡
                            </text>
                            <text
                              x={room.x + room.width / 2}
                              y={room.y + room.height / 2 + 40}
                              textAnchor="middle"
                              fill={status === 'online' ? '#0056B3' : '#dc2626'}
                              fontSize="9"
                              className="pointer-events-none"
                            >
                              {room.nodeId}
                            </text>
                          </g>
                        )}
                        <text
                          x={room.x + 5}
                          y={room.y + 15}
                          className="pointer-events-none"
                          fill="#666"
                          fontSize="10"
                        >
                          <Move className="inline h-3 w-3" />
                        </text>
                      </g>
                    );
                  })}
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Room/Corridor Properties Panel */}
          <Card className="shadow-xl border-2 border-indigo-200 hover:border-indigo-300 transition-colors">
            <CardHeader style={{padding: 'var(--spacing-md)'}}>
              <CardTitle className="english-text font-bold text-[#0056B3]" style={{fontSize: 'var(--font-size-lg)'}}>
                {selectedNode ? '📡 Node' : selectedCorridor ? '🛤️ Corridor' : '🏠 Room'}
              </CardTitle>
            </CardHeader>
            <CardContent style={{padding: 'var(--spacing-md)'}}>
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="english-text mb-2">{selectedNode.name}</h4>
                    <Badge variant="outline">{selectedNode.id}</Badge>
                    <Badge className="ml-2 bg-[#0056B3]">
                      {selectedNode.type === 'node' ? '📡 Node' : '🔗 Gateway'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={selectedNode.status === 'online' ? 'bg-[#00945E]' : 'bg-gray-400'}>
                        {selectedNode.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room:</span>
                      <span>{selectedNode.room || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MAC:</span>
                      <code className="text-xs">{selectedNode.mac}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RSSI:</span>
                      <span>{selectedNode.rssi} dBm</span>
                    </div>
                  </div>
                  <div>
                    <Label>Change Room</Label>
                    <Select
                      value={selectedNode.room || ''}
                      onValueChange={(value) => {
                        updateDevice(selectedNode.id, { room: value });
                        // Update room's nodeId
                        const targetRoom = rooms.find(r => r.name === value);
                        if (targetRoom) {
                          updateRoom(targetRoom.id, { nodeId: selectedNode.id });
                        }
                        // Clear nodeId from previous room
                        rooms.forEach(r => {
                          if (r.nodeId === selectedNode.id && r.name !== value) {
                            updateRoom(r.id, { nodeId: undefined });
                          }
                        });
                        setSelectedNode({ ...selectedNode, room: value });
                        toast.success(`${selectedNode.id} moved to ${value}`);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
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
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => {
                        if (window.confirm(`Delete ${selectedNode.type} ${selectedNode.id}?`)) {
                          // Remove from room
                          const linkedRoom = rooms.find(r => r.nodeId === selectedNode.id);
                          if (linkedRoom) {
                            updateRoom(linkedRoom.id, { nodeId: undefined });
                          }
                          // Delete device
                          setDevices(devices.filter(d => d.id !== selectedNode.id));
                          setSelectedNode(null);
                          toast.success(`${selectedNode.id} deleted`);
                        }
                      }}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : selectedCorridor ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="english-text mb-2">{selectedCorridor.name}</h4>
                    <Badge variant="outline">{selectedCorridor.id}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points:</span>
                      <span>{selectedCorridor.points.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Width:</span>
                      <span>{selectedCorridor.width}px</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Color:</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: selectedCorridor.color }}
                        />
                        <span>{selectedCorridor.color}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => {
                        saveToHistory();
                        deleteCorridor(selectedCorridor.id);
                        setSelectedCorridor(null);
                        toast.success('Corridor deleted');
                      }}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : selectedRoom ? (
                <div className="space-y-4">
                  {editingRoom?.id === selectedRoom.id ? (
                    <>
                      <div>
                        <Label>Room Name</Label>
                        <Input
                          value={editingRoom.name}
                          onChange={(e) =>
                            setEditingRoom({ ...editingRoom, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>X</Label>
                          <Input
                            type="number"
                            value={editingRoom.x}
                            onChange={(e) =>
                              setEditingRoom({ ...editingRoom, x: Number(e.target.value) })
                            }
                          />
                        </div>
                        <div>
                          <Label>Y</Label>
                          <Input
                            type="number"
                            value={editingRoom.y}
                            onChange={(e) =>
                              setEditingRoom({ ...editingRoom, y: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Width</Label>
                          <Input
                            type="number"
                            value={editingRoom.width}
                            onChange={(e) =>
                              setEditingRoom({ ...editingRoom, width: Number(e.target.value) })
                            }
                          />
                        </div>
                        <div>
                          <Label>Height</Label>
                          <Input
                            type="number"
                            value={editingRoom.height}
                            onChange={(e) =>
                              setEditingRoom({ ...editingRoom, height: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input
                          type="color"
                          value={editingRoom.color}
                          onChange={(e) =>
                            setEditingRoom({ ...editingRoom, color: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Link to Node</Label>
                        <Select
                          value={editingRoom.nodeId || ''}
                          onValueChange={(value) =>
                            setEditingRoom({ ...editingRoom, nodeId: value || undefined })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select node" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {devices
                              .filter((d) => d.type === 'node')
                              .map((node) => (
                                <SelectItem key={node.id} value={node.id}>
                                  {node.id} - {node.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => updateRoomData(editingRoom)} className="flex-1">
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingRoom(null)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="english-text mb-2">{selectedRoom.name}</h4>
                        <Badge variant="outline">{selectedRoom.id}</Badge>
                        {selectedRoom.nodeId && (
                          <Badge className="ml-2 bg-[#0056B3]">
                            📡 {selectedRoom.nodeId}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Position:</span>
                          <span>
                            ({Math.round(selectedRoom.x)}, {Math.round(selectedRoom.y)})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span>
                            {selectedRoom.width} × {selectedRoom.height}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Color:</span>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: selectedRoom.color }}
                            />
                            <span>{selectedRoom.color}</span>
                          </div>
                        </div>
                        {selectedRoom.nodeId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Node Status:</span>
                            <Badge
                              className={
                                getRoomStatus(selectedRoom) === 'online'
                                  ? 'bg-[#00945E]'
                                  : 'bg-[#dc2626]'
                              }
                            >
                              {getRoomStatus(selectedRoom) || 'Unknown'}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => setEditingRoom(selectedRoom)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            deleteRoom(selectedRoom.id);
                            setSelectedRoom(null);
                          }}
                          variant="destructive"
                          className="flex-1"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="english-text">Select a room to edit properties</p>
                  <p className="thai-text text-sm">หรือ Drag เพื่อย้ายตำแหน่ง</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Rooms Section */}
        <Collapsible open={showAllRooms} onOpenChange={setShowAllRooms}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-[#0056B3] transition-all duration-300 border-2 shadow-md hover:shadow-lg"
              style={{
                height: 'clamp(3rem, 4vw, 4rem)',
                fontSize: 'var(--font-size-lg)',
                padding: 'var(--spacing-md)'
              }}
            >
              <span className="font-bold text-[#0056B3]">🏠 All Rooms ({currentFloorRooms.length})</span>
              <ChevronDown 
                className={`transition-transform duration-300 ${showAllRooms ? 'rotate-180' : ''}`}
                style={{width: 'clamp(1.25rem, 2vw, 1.75rem)', height: 'clamp(1.25rem, 2vw, 1.75rem)'}}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-[var(--spacing-md)]">
            <Card className="shadow-lg border-2 border-blue-200">
              <CardContent style={{padding: 'var(--spacing-md)'}}>
                <div className="grid-responsive-sm">
              {currentFloorRooms.map((room) => {
                const status = getRoomStatus(room);
                return (
                  <Card
                    key={room.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedRoom(room)}
                  >
                    <CardContent className="p-3">
                      <div
                        className="w-full h-16 rounded mb-2 relative"
                        style={{ backgroundColor: room.color }}
                      >
                        {room.nodeId && (
                          <Badge
                            className={`absolute top-1 right-1 text-xs ${
                              status === 'online' ? 'bg-[#00945E]' : 'bg-[#dc2626]'
                            }`}
                          >
                            📡
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm english-text truncate">{room.name}</h4>
                      <p className="text-xs text-muted-foreground">{room.id}</p>
                      {room.nodeId && (
                        <p className="text-xs text-[#0056B3]">{room.nodeId}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
