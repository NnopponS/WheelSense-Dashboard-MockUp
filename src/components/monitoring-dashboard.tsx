import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { 
  Info, 
  Navigation,
  MapPin,
  Settings,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { StatisticsCards, PerformanceMetrics, RecentActivityPanel } from './dashboard';
import {
  statusText,
  motionText,
  directionText,
  getStatusColor,
  getMotionIcon,
  getDirectionIcon,
  WheelchairData,
} from '../lib/types';
import { ZOOM_CONFIG, MAP_STYLES, APPLIANCE_ICONS, COLORS, TIMING } from '../lib/constants';

export function MonitoringDashboard() {
  const {
    buildings,
    floors,
    rooms,
    corridors,
    devices,
    meshRoutes,
    wheelchairPositions,
    updateWheelchairPosition,
    selectedItem,
    setSelectedItem,
    updateDevice,
    eventLogs,
  } = useStore();

  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [zoom, setZoom] = useState<number>(ZOOM_CONFIG.default);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Navigation state
  const [showNavigation, setShowNavigation] = useState(false);
  const [navFrom, setNavFrom] = useState<string>('');
  const [navTo, setNavTo] = useState<string>('');
  const [navigationPath, setNavigationPath] = useState<{x: number, y: number}[]>([]);

  // Smart Home Controls filter
  const [smartHomeFilterBuilding, setSmartHomeFilterBuilding] = useState<string>('');
  const [smartHomeFilterRoom, setSmartHomeFilterRoom] = useState<string>('');

  // Building/Floor selection
  const [selectedBuilding, setSelectedBuilding] = useState<string>(buildings[0]?.id || '');
  const [selectedFloor, setSelectedFloor] = useState<string>('');

  // Keep defaults valid as data loads
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

  // Memoized computed values for performance
  const nodes = useMemo(
    () => devices.filter((d) => d.type === 'node' || d.type === 'gateway'),
    [devices]
  );

  const sortedBuildings = useMemo(
    () => [...buildings].sort((a, b) => a.name.localeCompare(b.name)),
    [buildings]
  );

  const currentBuildingFloors = useMemo(
    () => floors.filter((f) => f.buildingId === selectedBuilding).sort((a, b) => a.level - b.level),
    [floors, selectedBuilding]
  );

  const currentFloorRooms = useMemo(
    () => rooms.filter((r) => r.floorId === selectedFloor),
    [rooms, selectedFloor]
  );

  const currentFloorCorridors = useMemo(
    () => corridors.filter((c) => c.floorId === selectedFloor),
    [corridors, selectedFloor]
  );

  const wheelchairs = useMemo(
    () => devices.filter((d) => d.type === 'wheelchair'),
    [devices]
  );

  // Calculate node positions from rooms (memoized)
  const nodePositions = useMemo(
    () =>
      new Map(
        nodes.map((node) => {
          const room = currentFloorRooms.find((r) => r.nodeId === node.id || r.name === node.room);
          return [
            node.id,
            {
              x: room ? room.x + room.width / 2 : 450,
              y: room ? room.y + room.height / 2 : 450,
            },
          ];
        })
      ),
    [nodes, currentFloorRooms]
  );

  // Simulate wheelchair movement for demo (simplified)
  useEffect(() => {
    const interval = setInterval(() => {
      const wheelchairs = devices.filter(d => d.type === 'wheelchair');
      const pool = currentFloorRooms.length > 0 ? currentFloorRooms : rooms;
      
      wheelchairs.forEach(w => {
        const wheelId = parseInt(w.id.split('-')[1]);
        const room = pool[Math.floor(Math.random() * pool.length)];
        
        if (room) {
          const wheelData: WheelchairData = {
            wheel: wheelId,
            distance: Math.floor(Math.random() * 50),
            status: 0, // OK
            motion: Math.random() > 0.8 ? 1 : 0, // Mostly stationary
            direction: 0,
            rssi: -50 - Math.floor(Math.random() * 25),
            stale: false,
            ts: new Date().toISOString(),
            route_recovered: false,
            route_latency_ms: 400 + Math.floor(Math.random() * 600),
            route_path: [w.room || room.name, 'Gateway'],
            x: room.x + room.width / 2 + (Math.random() - 0.5) * 60,
            y: room.y + room.height / 2 + (Math.random() - 0.5) * 40,
            room: room.name,
          };
          updateWheelchairPosition(wheelId, wheelData);
        }
      });
    }, TIMING.wheelchairUpdateInterval);

    return () => clearInterval(interval);
  }, [devices, rooms, currentFloorRooms, updateWheelchairPosition]);

  // Memoized utility functions
  const getRSSIColor = useCallback((rssi: number) => {
    if (rssi >= -60) return COLORS.success;
    if (rssi >= -75) return COLORS.warning;
    return COLORS.error;
  }, []);

  const getApplianceIcon = useCallback((kind?: string) => {
    return APPLIANCE_ICONS[kind as keyof typeof APPLIANCE_ICONS] || APPLIANCE_ICONS.default;
  }, []);

  const getSelectedDetails = () => {
    if (selectedItem.type === 'wheelchair') {
      const wheelData = wheelchairPositions.get(Number(selectedItem.id));
      if (!wheelData) return null;

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-muted-foreground">Wheelchair ID</h4>
              <p className="english-text">W-0{wheelData.wheel}</p>
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground">Current Room</h4>
              <p className="english-text">{wheelData.room || 'Unknown'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-muted-foreground">Status</h4>
              <Badge style={{ backgroundColor: getStatusColor(wheelData.status) }}>
                {statusText(wheelData.status)}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground">Motion</h4>
              <div className="flex items-center gap-2">
                <span>{getMotionIcon(wheelData.motion)}</span>
                <span className="english-text">{motionText(wheelData.motion)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-muted-foreground">Direction</h4>
              <div className="flex items-center gap-2">
                <span>{getDirectionIcon(wheelData.direction)}</span>
                <span className="english-text">{directionText(wheelData.direction)}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground">Distance</h4>
              <p className="english-text">{wheelData.distance}m</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-muted-foreground">RSSI</h4>
              <Badge style={{ backgroundColor: getRSSIColor(wheelData.rssi) }}>
                {wheelData.rssi} dBm
              </Badge>
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground">Stale</h4>
              <Badge variant={wheelData.stale ? 'destructive' : 'outline'}>
                {wheelData.stale ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm text-muted-foreground mb-2">Route Path</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {wheelData.route_path.map((hop, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Badge variant="outline">{hop}</Badge>
                  {idx < wheelData.route_path.length - 1 && <span>→</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Latency: {wheelData.route_latency_ms}ms | Recovered: {wheelData.route_recovered ? 'Yes' : 'No'}
            </p>
          </div>

          <div>
            <h4 className="text-sm text-muted-foreground">Last Update</h4>
            <p className="text-sm">{new Date(wheelData.ts).toLocaleString()}</p>
          </div>
        </div>
      );
    } else if (selectedItem.type === 'node') {
      const node = devices.find((d) => d.id === selectedItem.id);
      if (!node) return null;

      const route = meshRoutes.find((r) => r.nodeId === node.id);

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-muted-foreground">Node ID</h4>
              <p className="english-text">{node.id}</p>
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground">Room</h4>
              <p className="english-text">{node.room || 'Unknown'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-muted-foreground">Status</h4>
              <Badge className={node.status === 'online' ? 'bg-[#00945E]' : 'bg-gray-400'}>
                {node.status}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground">RSSI</h4>
              <Badge style={{ backgroundColor: getRSSIColor(node.rssi) }}>
                {node.rssi} dBm
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm text-muted-foreground">MAC Address</h4>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{node.mac}</code>
          </div>

          {route && (
            <div>
              <h4 className="text-sm text-muted-foreground mb-2">Mesh Route</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {route.path.map((hop, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Badge variant="outline">{hop}</Badge>
                    {idx < route.path.length - 1 && <span>→</span>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Hops: {route.hopCount} | Latency: {route.latency}ms
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const onlineNodes = useMemo(
    () => nodes.filter((n) => n.status === 'online').length,
    [nodes]
  );

  const activeWheelchairs = useMemo(
    () => wheelchairs.filter((w) => w.status === 'online').length,
    [wheelchairs]
  );

  // Auto-routing pathfinding using corridors (memoized callback)
  const calculateRoute = useCallback(() => {
    if (!navFrom || !navTo) return;
    
    const startRoom = currentFloorRooms.find((r) => r.id === navFrom);
    const endRoom = currentFloorRooms.find((r) => r.id === navTo);
    
    if (!startRoom || !endRoom) return;

    const startPoint = { x: startRoom.x + startRoom.width / 2, y: startRoom.y + startRoom.height / 2 };
    const endPoint = { x: endRoom.x + endRoom.width / 2, y: endRoom.y + endRoom.height / 2 };
    
    const path: {x: number, y: number}[] = [startPoint];
    
    // If there are corridors, route through them
    if (currentFloorCorridors.length > 0) {
      // Find nearest corridor point to start room
      let minDistStart = Infinity;
      let nearestStartPoint: {x: number, y: number} | null = null;
      let nearestStartCorridorId: string | null = null;
      
      currentFloorCorridors.forEach(corridor => {
        corridor.points.forEach(point => {
          const dist = Math.hypot(point.x - startPoint.x, point.y - startPoint.y);
          if (dist < minDistStart) {
            minDistStart = dist;
            nearestStartPoint = point;
            nearestStartCorridorId = corridor.id;
          }
        });
      });
      
      // Find nearest corridor point to end room
      let minDistEnd = Infinity;
      let nearestEndPoint: {x: number, y: number} | null = null;
      
      currentFloorCorridors.forEach(corridor => {
        corridor.points.forEach(point => {
          const dist = Math.hypot(point.x - endPoint.x, point.y - endPoint.y);
          if (dist < minDistEnd) {
            minDistEnd = dist;
            nearestEndPoint = point;
          }
        });
      });
      
      // Add corridor waypoints
      if (nearestStartPoint) path.push(nearestStartPoint);
      
      // If start and end are on different corridors, add intermediate corridor points
      if (nearestStartPoint && nearestEndPoint && nearestStartCorridorId) {
        const startCorridor = currentFloorCorridors.find(c => c.id === nearestStartCorridorId);
        if (startCorridor) {
          // Add all points from the corridor to create a smooth path
          const startIdx = startCorridor.points.findIndex(p => p.x === nearestStartPoint!.x && p.y === nearestStartPoint!.y);
          const endIdx = startCorridor.points.findIndex(p => p.x === nearestEndPoint!.x && p.y === nearestEndPoint!.y);
          
          if (startIdx !== -1 && endIdx !== -1) {
            const step = startIdx < endIdx ? 1 : -1;
            for (let i = startIdx; i !== endIdx; i += step) {
              if (i !== startIdx) path.push(startCorridor.points[i]);
            }
          } else if (nearestEndPoint && !(nearestEndPoint.x === nearestStartPoint.x && nearestEndPoint.y === nearestStartPoint.y)) {
            path.push(nearestEndPoint);
          }
        }
      }
      
      const lastPoint = path[path.length-1];
      if (nearestEndPoint && lastPoint && !(nearestEndPoint.x === lastPoint.x && nearestEndPoint.y === lastPoint.y)) {
        path.push(nearestEndPoint);
      }
    }
    
    path.push(endPoint);
    setNavigationPath(path);
    console.log('Route calculated using corridors!');
  }, [navFrom, navTo, currentFloorRooms, currentFloorCorridors]);

  const clampZoom = useCallback(
    (z: number) => Math.min(ZOOM_CONFIG.max, Math.max(ZOOM_CONFIG.min, z)),
    []
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const delta = e.deltaY > 0 ? -ZOOM_CONFIG.step : ZOOM_CONFIG.step;
      setZoom((z) => clampZoom(Number((z + delta).toFixed(2))));
    },
    [clampZoom]
  );

  const handleSvgMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, [pan]);

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning || !panStartRef.current) return;
      const nx = e.clientX - panStartRef.current.x;
      const ny = e.clientY - panStartRef.current.y;
      setPan({ x: nx, y: ny });
    },
    [isPanning]
  );

  const handleSvgMouseUp = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  // Calculate metrics (memoized)
  const totalWheelchairs = useMemo(() => wheelchairs.length, [wheelchairs]);
  const totalNodes = useMemo(() => nodes.length, [nodes]);
  const systemHealth = useMemo(
    () => Math.round((onlineNodes / totalNodes) * 100 || 0),
    [onlineNodes, totalNodes]
  );
  const wheelchairUtilization = useMemo(
    () => Math.round((activeWheelchairs / totalWheelchairs) * 100 || 0),
    [activeWheelchairs, totalWheelchairs]
  );
  const signalStrength = useMemo(() => {
    if (onlineNodes === 0 || wheelchairPositions.size === 0) return 0;
    const avgRssi = Array.from(wheelchairPositions.values()).reduce((sum, w) => sum + (w.rssi || -70), 0) / wheelchairPositions.size;
    return Math.abs(avgRssi + 100);
  }, [onlineNodes, wheelchairPositions]);

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-auto">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Hero Stats Section */}
        <StatisticsCards
          activeWheelchairs={activeWheelchairs}
          totalWheelchairs={totalWheelchairs}
          onlineNodes={onlineNodes}
          totalNodes={totalNodes}
          totalRooms={rooms.length}
          totalBuildings={buildings.length}
          systemHealth={systemHealth}
        />

        {/* Performance Metrics with Gauges */}
        <PerformanceMetrics
          systemHealth={systemHealth}
          wheelchairUtilization={wheelchairUtilization}
          signalStrength={signalStrength}
          networkUptime={100}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Floor Map */}
          <Card className="lg:col-span-2 border-none shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#0056B3]" />
                      <span>Real-time Floor Map</span>
                    </CardTitle>
                    <CardDescription>Interactive building navigation and monitoring</CardDescription>
                  </div>
                </div>
                
                {/* Controls Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Building:</label>
                    <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedBuildings.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Floor:</label>
                    <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentBuildingFloors.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator orientation="vertical" className="h-10 md:h-12" />
                  
                  <div className="flex items-center gap-2 md:gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 md:px-4 py-2 rounded-lg border-2 border-blue-200 shadow-sm" role="group" aria-label="Map zoom controls">
                    <Button 
                      size="default" 
                      variant="outline" 
                      className="h-10 md:h-11 w-10 md:w-11 p-0 hover:bg-blue-100 hover:border-blue-400 bg-white" 
                      onClick={() => setZoom((z) => Math.max(ZOOM_CONFIG.min, Number((z - ZOOM_CONFIG.step).toFixed(2))))}
                      aria-label="Zoom out"
                      disabled={zoom <= ZOOM_CONFIG.min}
                    >
                      <ZoomOut className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                    <span className="text-base md:text-lg font-bold w-16 md:w-20 text-center text-[#0056B3]" aria-live="polite" aria-label="Current zoom level">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button 
                      size="default" 
                      variant="outline" 
                      className="h-10 md:h-11 w-10 md:w-11 p-0 hover:bg-blue-100 hover:border-blue-400 bg-white" 
                      onClick={() => setZoom((z) => Math.min(ZOOM_CONFIG.max, Number((z + ZOOM_CONFIG.step).toFixed(2))))}
                      aria-label="Zoom in"
                      disabled={zoom >= ZOOM_CONFIG.max}
                    >
                      <ZoomIn className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => setShowNavigation(!showNavigation)} 
                    size="sm" 
                    variant={showNavigation ? 'default' : 'outline'}
                    className={showNavigation ? 'bg-[#0056B3] hover:bg-[#004494]' : ''}
                    aria-label="Toggle navigation panel"
                    aria-expanded={showNavigation}
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Navigation
                  </Button>
                  
                  {selectedItem.type && (
                    <Button 
                      onClick={() => setShowDetailsDialog(true)} 
                      size="sm" 
                      className="bg-[#00945E] hover:bg-[#007a4d]"
                      aria-label={`View details for ${selectedItem.type} ${selectedItem.id}`}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Details
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Navigation Controls */}
              {showNavigation && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <Select value={navFrom} onValueChange={setNavFrom}>
                      <SelectTrigger className="md:col-span-2 bg-white">
                        <SelectValue placeholder="Select starting point..." />
                      </SelectTrigger>
                      <SelectContent>
                        {currentFloorRooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={navTo} onValueChange={setNavTo}>
                      <SelectTrigger className="md:col-span-2 bg-white">
                        <SelectValue placeholder="Select destination..." />
                      </SelectTrigger>
                      <SelectContent>
                        {currentFloorRooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={calculateRoute} 
                        className="flex-1 bg-[#0056B3] hover:bg-[#004494]"
                      >
                        Calculate
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setNavigationPath([]);
                          setNavFrom('');
                          setNavTo('');
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div 
                className="relative w-full h-[600px] bg-white border-2 border-muted rounded-xl overflow-hidden shadow-inner"
                role="application"
                aria-label="Interactive floor map"
              >
                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 1400 750" 
                  onWheel={handleWheel} 
                  onMouseDown={handleSvgMouseDown} 
                  onMouseMove={handleSvgMouseMove} 
                  onMouseUp={handleSvgMouseUp}
                  role="img"
                  aria-label="Floor plan with wheelchair and node positions"
                >
                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  
                  {/* Corridors */}
                  {currentFloorCorridors.map((corridor) => (
                    <polyline
                      key={corridor.id}
                      points={corridor.points.map(p => `${p.x},${p.y}`).join(' ')}
                      stroke={corridor.color || '#e5e7eb'}
                      strokeWidth={corridor.width}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  
                  {/* Rooms */}
                  {currentFloorRooms.map((room) => {
                    const hasNode = devices.some(
                      (d) => (d.type === 'node' || d.type === 'gateway') && 
                             (d.room === room.name || room.nodeId === d.id)
                    );
                    const nodeStatus = devices.find(
                      (d) => (d.type === 'node' || d.type === 'gateway') && 
                             (d.room === room.name || room.nodeId === d.id)
                    )?.status;
                    const roomAppliances = devices.filter((d) => d.type === 'appliance' && d.room === room.name);

                    return (
                      <g key={room.id}>
                        <rect
                          x={room.x}
                          y={room.y}
                          width={room.width}
                          height={room.height}
                          fill={room.color}
                          stroke={hasNode && nodeStatus === 'online' ? '#00945E' : '#cccccc'}
                          strokeWidth="2"
                          rx="8"
                          opacity={nodeStatus === 'offline' ? 0.5 : 1}
                        />
                        <text
                          x={room.x + room.width / 2}
                          y={room.y + room.height / 2}
                          textAnchor="middle"
                          className="english-text"
                          fill="#1a1a1a"
                          fontSize="14"
                        >
                          {room.name}
                        </text>
                        {roomAppliances.map((ap, idx) => {
                          const ax = ap.x ?? room.x + room.width - 14;
                          const ay = ap.y ?? room.y + 16 + idx * 16;
                          return (
                            <g
                              key={ap.id}
                              transform={`translate(${ax}, ${ay})`}
                              className="cursor-pointer"
                              onClick={(e) => {
                                // altKey: increase value 10 (wrap for 0-100). default: toggle power
                                if (e.altKey) {
                                  const next = ((ap.value ?? 0) + 10) % 110;
                                  updateDevice(ap.id, { value: next > 100 ? 100 : next });
                                } else {
                                  updateDevice(ap.id, { power: ap.power === 'on' ? 'off' : 'on' });
                                }
                              }}
                            >
                              <circle r="7" fill={ap.power === 'on' ? '#00945E' : '#e5e7eb'} stroke="#ffffff" strokeWidth="1" />
                              <text y="3" textAnchor="middle" fontSize="9">{getApplianceIcon(ap.applianceKind)}</text>
                            </g>
                          );
                        })}
                        {hasNode && (
                          <text
                            x={room.x + room.width / 2}
                            y={room.y + room.height / 2 + 20}
                            textAnchor="middle"
                            fill={nodeStatus === 'online' ? '#00945E' : '#dc2626'}
                            fontSize="10"
                          >
                            {nodeStatus === 'online' ? '● Online' : '● Offline'}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map((node) => {
                    const pos = nodePositions.get(node.id);
                    // only show node if it belongs to a room on this floor
                    const mappedRoom = currentFloorRooms.find((r) => r.nodeId === node.id || r.name === node.room);
                    if (!pos || !mappedRoom) return null;

                    return (
                      <g
                        key={node.id}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => {
                          setSelectedItem({ type: 'node', id: node.id });
                        }}
                      >
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="15"
                          fill={node.status === 'online' ? '#0056B3' : '#666666'}
                          stroke={selectedItem.id === node.id ? '#fbbf24' : 'white'}
                          strokeWidth={selectedItem.id === node.id ? '3' : '2'}
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 5}
                          textAnchor="middle"
                          fill="white"
                          fontSize="10"
                        >
                          📡
                        </text>
                        <text
                          x={pos.x}
                          y={pos.y + 30}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#0056B3"
                        >
                          {node.id}
                        </text>
                      </g>
                    );
                  })}

                  {/* Wheelchairs with real-time positions */}
                  {Array.from(wheelchairPositions.entries()).map(([wheelId, wheelData]) => {
                    if (!wheelData.x || !wheelData.y) return null;
                    // hide wheelchairs not on current floor (simple check by bounds)
                    const onFloor = currentFloorRooms.some(
                      (r) => wheelData.x! >= r.x && wheelData.x! <= r.x + r.width && wheelData.y! >= r.y && wheelData.y! <= r.y + r.height
                    );
                    if (!onFloor && currentFloorRooms.length > 0) return null;

                    // Calculate rotation based on direction
                    let rotation = 0;
                    if (wheelData.motion === 1) {
                      // Forward
                      rotation = wheelData.direction === 1 ? -30 : wheelData.direction === 2 ? 30 : 0;
                    } else if (wheelData.motion === 2) {
                      // Backward
                      rotation = 180;
                    }

                    return (
                      <g
                        key={wheelId}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => {
                          setSelectedItem({ type: 'wheelchair', id: wheelId });
                        }}
                        transform={`translate(${wheelData.x}, ${wheelData.y}) rotate(${rotation})`}
                      >
                        <circle
                          r="20"
                          fill={getStatusColor(wheelData.status)}
                          stroke={selectedItem.id === wheelId ? '#fbbf24' : 'white'}
                          strokeWidth={selectedItem.id === wheelId ? '3' : '2'}
                          opacity={wheelData.motion === 0 ? 0.7 : 1}
                        />
                        <text
                          y="6"
                          textAnchor="middle"
                          fill="white"
                          fontSize="16"
                        >
                          ♿
                        </text>
                        <text
                          y="35"
                          textAnchor="middle"
                          fontSize="11"
                          fill={getStatusColor(wheelData.status)}
                        >
                          W-0{wheelId}
                        </text>
                        {/* Motion indicator */}
                        {wheelData.motion !== 0 && (
                          <text y="-25" textAnchor="middle" fontSize="14">
                            {getMotionIcon(wheelData.motion)}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Navigation Path */}
                  {navigationPath.length > 1 && (
                    <>
                      <polyline
                        points={navigationPath.map((p) => `${p.x},${p.y}`).join(' ')}
                        stroke="#0056B3"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="8,4"
                        opacity="0.8"
                      />
                      {/* Start marker */}
                      <circle 
                        cx={navigationPath[0].x} 
                        cy={navigationPath[0].y} 
                        r="12" 
                        fill="#f59e0b" 
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={navigationPath[0].x}
                        y={navigationPath[0].y + 25}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#f59e0b"
                        fontWeight="bold"
                      >
                        START
                      </text>
                      {/* End marker */}
                      <circle 
                        cx={navigationPath[navigationPath.length - 1].x} 
                        cy={navigationPath[navigationPath.length - 1].y} 
                        r="12" 
                        fill="#10b981" 
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={navigationPath[navigationPath.length - 1].x}
                        y={navigationPath[navigationPath.length - 1].y + 25}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#10b981"
                        fontWeight="bold"
                      >
                        END
                      </text>
                    </>
                  )}
                  </g>
                </svg>
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-lg border">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Map Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00945E] shadow-sm" />
                    <span className="text-sm">Status OK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#fbbf24] shadow-sm" />
                    <span className="text-sm">Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#dc2626] shadow-sm" />
                    <span className="text-sm">Error</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#0056B3] shadow-sm" />
                    <span className="text-sm">Node Online</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Panel */}
          <RecentActivityPanel eventLogs={eventLogs} />
        </div>

        {/* Smart Home Controls Section */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#0056B3]" />
                  Smart Home Controls
                </CardTitle>
                <CardDescription>Manage and control smart appliances across all locations</CardDescription>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <Select value={smartHomeFilterBuilding} onValueChange={(value) => {
                  setSmartHomeFilterBuilding(value);
                  setSmartHomeFilterRoom('');
                  const buildingFloors = floors.filter(f => f.buildingId === value);
                  if (buildingFloors.length > 0) {
                    setSelectedFloor(buildingFloors[0].id);
                  }
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Buildings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    {sortedBuildings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={smartHomeFilterRoom} onValueChange={setSmartHomeFilterRoom}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    {currentFloorRooms.map((r) => (
                      <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {currentFloorRooms
                .filter(room => !smartHomeFilterRoom || smartHomeFilterRoom === 'all' || room.name === smartHomeFilterRoom)
                .map((room) => {
                const roomAppliances = devices.filter((d) => d.type === 'appliance' && d.room === room.name);
                if (roomAppliances.length === 0) return null;
                
                return (
                  <Card 
                    key={room.id} 
                    className="border-none shadow-md hover:shadow-lg transition-shadow"
                    style={{ 
                      background: `linear-gradient(135deg, ${room.color}10 0%, white 50%)`
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div 
                            className="w-1 h-8 rounded-full" 
                            style={{ backgroundColor: room.color }}
                          />
                          {room.name}
                        </CardTitle>
                        <Badge variant="outline">
                          {roomAppliances.length} device{roomAppliances.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roomAppliances.map((ap) => (
                          <div 
                            key={ap.id} 
                            className="group relative p-4 rounded-xl border-2 bg-white hover:border-[#0056B3] transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`text-3xl transition-transform group-hover:scale-110 ${ap.power === 'on' ? 'animate-pulse' : ''}`}>
                                  {getApplianceIcon(ap.applianceKind)}
                                </div>
                                <div>
                                  <div className="font-medium">{ap.name}</div>
                                  <Badge 
                                    className={`text-xs mt-1 ${
                                      ap.power === 'on' 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    {ap.power?.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              
                              <Button 
                                size="sm" 
                                variant={ap.power === 'on' ? 'default' : 'outline'}
                                onClick={() => updateDevice(ap.id, { power: ap.power === 'on' ? 'off' : 'on' })}
                                className={`${
                                  ap.power === 'on' 
                                    ? 'bg-[#00945E] hover:bg-[#007a4d]' 
                                    : 'hover:bg-gray-100'
                                } transition-colors`}
                              >
                                <Zap className={`h-4 w-4 ${ap.power === 'on' ? '' : 'opacity-50'}`} />
                              </Button>
                            </div>
                            
                            {ap.applianceKind !== 'door' && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Intensity</span>
                                  <span className="font-medium text-foreground">{ap.value ?? 0}%</span>
                                </div>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={ap.value ?? 0}
                                  onChange={(e) => updateDevice(ap.id, { value: Number(e.target.value) })}
                                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                                  style={{
                                    background: `linear-gradient(to right, #0056B3 0%, #0056B3 ${ap.value ?? 0}%, #e5e7eb ${ap.value ?? 0}%, #e5e7eb 100%)`
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem.type === 'wheelchair' ? '♿' : '📡'}
              <span className="english-text">
                {selectedItem.type === 'wheelchair' ? 'Wheelchair' : 'Node'} Details
              </span>
            </DialogTitle>
          </DialogHeader>
          {getSelectedDetails()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
