import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Room, Floor, Building, Device, MeshRoute, WheelchairData, Corridor } from './types';
import { 
  DEFAULT_BUILDINGS, 
  DEFAULT_FLOORS, 
  DEFAULT_ROOMS, 
  DEFAULT_DEVICES, 
  DEFAULT_MESH_ROUTES, 
  DEFAULT_CORRIDORS,
  DataService 
} from './data-service';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEYS, TIMING } from './constants';
import { DemoSequenceStep } from './demo-sequences';

export interface EventLog {
  id: string;
  timestamp: Date;
  type: 'device' | 'wheelchair' | 'system' | 'voice' | 'emergency';
  action: string;
  details: string;
  room?: string;
  deviceId?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

export interface DemoState {
  isRunning: boolean;
  currentStep: DemoSequenceStep | null;
  currentStepIndex: number;
  progress: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface StoreContextType {
  // Map data
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  corridors: Corridor[];
  setBuildings: (buildings: Building[]) => void;
  setFloors: (floors: Floor[]) => void;
  setRooms: (rooms: Room[]) => void;
  setCorridors: (corridors: Corridor[]) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  updateCorridor: (corridorId: string, updates: Partial<Corridor>) => void;
  deleteCorridor: (corridorId: string) => void;

  // Map selection
  selectedRoomId: string | null;
  setSelectedRoomId: (roomId: string | null) => void;

  // Devices
  devices: Device[];
  setDevices: (devices: Device[]) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;

  // Mesh routes
  meshRoutes: MeshRoute[];
  setMeshRoutes: (routes: MeshRoute[]) => void;
  updateMeshRoute: (nodeId: string, newPath: string[]) => void;

  // Wheelchair positions (real-time from MQTT)
  wheelchairPositions: Map<number, WheelchairData>;
  updateWheelchairPosition: (wheelId: number, data: WheelchairData) => void;

  // Selected item for details
  selectedItem: { type: 'wheelchair' | 'node' | null; id: string | number | null };
  setSelectedItem: (item: { type: 'wheelchair' | 'node' | null; id: string | number | null }) => void;
  
  // Event Logging
  eventLogs: EventLog[];
  addEventLog: (log: Omit<EventLog, 'id' | 'timestamp'>) => void;
  clearEventLogs: () => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
  
  // Demo State
  demoState: DemoState;
  setDemoState: (state: DemoState) => void;
  
  // Utilities
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DATA_VERSION = '4'; // Incremented for clean refactor

export function StoreProvider({ children }: { children: ReactNode }) {
  // Use custom useLocalStorage hook with error handling
  const [buildings, setBuildingsState] = useLocalStorage<Building[]>(
    STORAGE_KEYS.buildings,
    DEFAULT_BUILDINGS
  );

  const [floors, setFloorsState] = useLocalStorage<Floor[]>(
    STORAGE_KEYS.floors,
    DEFAULT_FLOORS
  );

  const [rooms, setRoomsState] = useLocalStorage<Room[]>(
    STORAGE_KEYS.rooms,
    DEFAULT_ROOMS
  );

  const [corridors, setCorridorsState] = useLocalStorage<Corridor[]>(
    STORAGE_KEYS.corridors,
    DEFAULT_CORRIDORS
  );

  const [devices, setDevicesState] = useLocalStorage<Device[]>(
    STORAGE_KEYS.devices,
    DEFAULT_DEVICES
  );

  const [meshRoutes, setMeshRoutesState] = useLocalStorage<MeshRoute[]>(
    STORAGE_KEYS.meshRoutes,
    DEFAULT_MESH_ROUTES
  );

  const [wheelchairPositions, setWheelchairPositions] = useState<Map<number, WheelchairData>>(new Map());
  const [selectedItem, setSelectedItem] = useState<{ type: 'wheelchair' | 'node' | null; id: string | number | null }>({
    type: null,
    id: null,
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  // Event Logging & Notifications
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Demo State
  const [demoState, setDemoState] = useState<DemoState>({
    isRunning: false,
    currentStep: null,
    currentStepIndex: 0,
    progress: 0,
  });

  // Note: localStorage saving is now handled by useLocalStorage hook automatically

  // Seed new default maps into existing localStorage data if missing
  useEffect(() => {
    // Only run once after initial load
    const hasHospital = buildings.some((b) => b.id === 'B1');
    const hasSmartHome = buildings.some((b) => b.id === 'B2');

    let updated = false;

    if (!hasHospital || !hasSmartHome) {
      const existingIds = new Set(buildings.map((b) => b.id));
      const merged = [...buildings];
      DEFAULT_BUILDINGS.forEach((b) => {
        if (!existingIds.has(b.id)) {
          merged.push(b);
          existingIds.add(b.id);
          updated = true;
        }
      });
      // Normalize legacy names
      const idxB1 = merged.findIndex((b) => b.id === 'B1');
      if (idxB1 !== -1 && (merged[idxB1].name === 'Main Building' || merged[idxB1].name === 'Hospital')) {
        merged[idxB1] = { ...merged[idxB1], name: 'Hospital (Main Campus)' };
        updated = true;
      }
      const idxB2 = merged.findIndex((b) => b.id === 'B2');
      if (idxB2 !== -1 && merged[idxB2].name === 'Smart Home') {
        merged[idxB2] = { ...merged[idxB2], name: 'Smart Home Residence' };
        updated = true;
      }
      if (updated) setBuildingsState(merged);
    }

    // Floors
    {
      const existingFloorIds = new Set(floors.map((f) => f.id));
      const mergedFloors = [...floors];
      DEFAULT_FLOORS.forEach((f) => {
        if (!existingFloorIds.has(f.id)) {
          mergedFloors.push(f);
          existingFloorIds.add(f.id);
          updated = true;
        }
      });
      if (updated) setFloorsState(mergedFloors);
    }

    // Rooms
    {
      const existingRoomIds = new Set(rooms.map((r) => r.id));
      const mergedRooms = [...rooms];
      DEFAULT_ROOMS.forEach((r) => {
        if (!existingRoomIds.has(r.id)) {
          mergedRooms.push(r);
          existingRoomIds.add(r.id);
          updated = true;
        }
      });
      if (updated) setRoomsState(mergedRooms);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Versioned data bootstrap - Set version on first load but preserve user data
  useEffect(() => {
    try {
      const currentVersion = localStorage.getItem(STORAGE_KEYS.dataVersion);
      if (!currentVersion) {
        // Only set version on very first load, don't reset data
        localStorage.setItem(STORAGE_KEYS.dataVersion, DATA_VERSION);
      }
      // NOTE: We intentionally don't reset data when version changes
      // This preserves user edits across dev server restarts
      // Users can manually reset via Settings if needed
    } catch (error) {
      console.error('Error checking data version:', error);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.rooms, JSON.stringify(rooms));
    } catch (error) {
      console.error('Error saving rooms:', error);
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.buildings, JSON.stringify(buildings));
    } catch (error) {
      console.error('Error saving buildings:', error);
    }
  }, [buildings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.floors, JSON.stringify(floors));
    } catch (error) {
      console.error('Error saving floors:', error);
    }
  }, [floors]);

  const resetDemoData = useCallback(() => {
    try {
      setBuildingsState(DEFAULT_BUILDINGS);
      setFloorsState(DEFAULT_FLOORS);
      setRoomsState(DEFAULT_ROOMS);
      setCorridorsState(DEFAULT_CORRIDORS);
      setDevicesState(DEFAULT_DEVICES);
      setMeshRoutesState(DEFAULT_MESH_ROUTES);
      localStorage.setItem(STORAGE_KEYS.dataVersion, DATA_VERSION);
    } catch (error) {
      console.error('Error resetting demo data:', error);
    }
  }, [setBuildingsState, setFloorsState, setRoomsState, setCorridorsState, setDevicesState, setMeshRoutesState]);

  const setBuildings = useCallback((newBuildings: Building[]) => {
    setBuildingsState(newBuildings);
  }, []);

  const setFloors = useCallback((newFloors: Floor[]) => {
    setFloorsState(newFloors);
  }, []);

  const setRooms = useCallback((newRooms: Room[]) => {
    setRoomsState(newRooms);
  }, []);

  const updateRoom = useCallback((roomId: string, updates: Partial<Room>) => {
    setRoomsState((prev) => prev.map((room) => (room.id === roomId ? { ...room, ...updates } : room)));
  }, []);

  const setCorridors = useCallback((newCorridors: Corridor[]) => {
    setCorridorsState(newCorridors);
  }, []);

  const updateCorridor = useCallback((corridorId: string, updates: Partial<Corridor>) => {
    setCorridorsState((prev) => prev.map((corridor) => (corridor.id === corridorId ? { ...corridor, ...updates } : corridor)));
  }, []);

  const deleteCorridor = useCallback((corridorId: string) => {
    setCorridorsState((prev) => prev.filter((corridor) => corridor.id !== corridorId));
  }, []);

  const setDevices = useCallback((newDevices: Device[]) => {
    setDevicesState(newDevices);
  }, []);

  const updateDevice = useCallback((deviceId: string, updates: Partial<Device>) => {
    setDevicesState((prev) => prev.map((device) => (device.id === deviceId ? { ...device, ...updates } : device)));
  }, []);

  const setMeshRoutes = useCallback((routes: MeshRoute[]) => {
    setMeshRoutesState(routes);
  }, []);

  const updateMeshRoute = useCallback((nodeId: string, newPath: string[]) => {
    setMeshRoutesState((prev) =>
      prev.map((route) =>
        route.nodeId === nodeId
          ? { ...route, path: newPath, hopCount: newPath.length - 1 }
          : route
      )
    );
  }, []);

  const updateWheelchairPosition = useCallback((wheelId: number, data: WheelchairData) => {
    setWheelchairPositions((prev) => {
      const newMap = new Map(prev);
      newMap.set(wheelId, data);
      return newMap;
    });
  }, []);

  // Event Logging
  const addEventLog = useCallback((log: Omit<EventLog, 'id' | 'timestamp'>) => {
    const newLog: EventLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setEventLogs((prev) => [newLog, ...prev].slice(0, TIMING.eventLogRetention));
  }, []);

  const clearEventLogs = useCallback(() => {
    setEventLogs([]);
  }, []);

  // Notifications
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Enhanced updateDevice with logging
  const updateDeviceWithLog = useCallback((deviceId: string, updates: Partial<Device>) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    updateDevice(deviceId, updates);

    // Log the event
    if (updates.power !== undefined && updates.power !== device.power) {
      addEventLog({
        type: 'device',
        action: updates.power === 'on' ? 'turned_on' : 'turned_off',
        details: `${device.name} ถูก${updates.power === 'on' ? 'เปิด' : 'ปิด'}`,
        room: device.room,
        deviceId: device.id,
        severity: 'info',
      });

      // Add notification for important changes
      if (device.applianceKind === 'door' && updates.power === 'on') {
        addNotification({
          title: '🚪 ประตูเปิด',
          message: `${device.name} ใน ${device.room} ถูกเปิด`,
          type: 'info',
        });
      }
    }
  }, [devices, updateDevice, addEventLog, addNotification]);

  const value: StoreContextType = {
    buildings,
    floors,
    rooms,
    corridors,
    setBuildings,
    setFloors,
    setRooms,
    setCorridors,
    updateRoom,
    updateCorridor,
    deleteCorridor,
    selectedRoomId,
    setSelectedRoomId,
    devices,
    setDevices,
    updateDevice: updateDeviceWithLog,
    meshRoutes,
    setMeshRoutes,
    updateMeshRoute,
    wheelchairPositions,
    updateWheelchairPosition,
    selectedItem,
    setSelectedItem,
    eventLogs,
    addEventLog,
    clearEventLogs,
    notifications,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
    unreadCount,
    demoState,
    setDemoState,
    resetDemoData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
