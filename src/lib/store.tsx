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
import { TIMING } from './constants';
import { DemoSequenceStep } from './demo-sequences';
import FirebaseService from './firebase-service';

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

export function StoreProvider({ children }: { children: ReactNode }) {
  // State using Firebase instead of localStorage
  const [buildings, setBuildingsState] = useState<Building[]>([]);
  const [floors, setFloorsState] = useState<Floor[]>([]);
  const [rooms, setRoomsState] = useState<Room[]>([]);
  const [corridors, setCorridorsState] = useState<Corridor[]>([]);
  const [devices, setDevicesState] = useState<Device[]>([]);
  const [meshRoutes, setMeshRoutesState] = useState<MeshRoute[]>([]);

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

  // Firebase Initialization - Load data on mount
  useEffect(() => {
    console.log('🔄 Initializing data from Firebase...');
    
    const initializeData = async () => {
      try {
        // Initialize default data if Firebase is empty
        await FirebaseService.initializeDefaultData(
          DEFAULT_BUILDINGS,
          DEFAULT_FLOORS,
          DEFAULT_ROOMS,
          DEFAULT_CORRIDORS,
          DEFAULT_DEVICES,
          DEFAULT_MESH_ROUTES
        );

        // Load data from Firebase
        const [
          fbBuildings,
          fbFloors,
          fbRooms,
          fbCorridors,
          fbDevices,
          fbMeshRoutes,
        ] = await Promise.all([
          FirebaseService.getBuildings(),
          FirebaseService.getFloors(),
          FirebaseService.getRooms(),
          FirebaseService.getCorridors(),
          FirebaseService.getDevices(),
          FirebaseService.getMeshRoutes(),
        ]);

        setBuildingsState(fbBuildings);
        setFloorsState(fbFloors);
        setRoomsState(fbRooms);
        setCorridorsState(fbCorridors);
        setDevicesState(fbDevices);
        setMeshRoutesState(fbMeshRoutes);

        console.log('✅ Data loaded from Firebase');
      } catch (error) {
        console.error('❌ Error initializing Firebase data:', error);
      }
    };

    initializeData();
  }, []);

  // Firebase Real-time Subscriptions
  useEffect(() => {
    console.log('🔔 Setting up Firebase subscriptions...');

    const unsubscribeBuildings = FirebaseService.subscribeToBuildings((data) => {
      console.log('📦 Buildings updated from Firebase');
      setBuildingsState(data);
    });

    const unsubscribeFloors = FirebaseService.subscribeToFloors((data) => {
      console.log('📦 Floors updated from Firebase');
      setFloorsState(data);
    });

    const unsubscribeRooms = FirebaseService.subscribeToRooms((data) => {
      console.log('📦 Rooms updated from Firebase');
      setRoomsState(data);
    });

    const unsubscribeCorridors = FirebaseService.subscribeToCorridors((data) => {
      console.log('📦 Corridors updated from Firebase');
      setCorridorsState(data);
    });

    const unsubscribeDevices = FirebaseService.subscribeToDevices((data) => {
      console.log('📦 Devices updated from Firebase');
      setDevicesState(data);
    });

    const unsubscribeMeshRoutes = FirebaseService.subscribeToMeshRoutes((data) => {
      console.log('📦 Mesh routes updated from Firebase');
      setMeshRoutesState(data);
    });

    const unsubscribeDemoState = FirebaseService.subscribeToDemoState((data) => {
      if (data) {
        console.log('🎬 Demo state updated from Firebase');
        setDemoState(data);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔕 Cleaning up Firebase subscriptions');
      unsubscribeBuildings();
      unsubscribeFloors();
      unsubscribeRooms();
      unsubscribeCorridors();
      unsubscribeDevices();
      unsubscribeMeshRoutes();
      unsubscribeDemoState();
    };
  }, []);

  const resetDemoData = useCallback(async () => {
    try {
      await Promise.all([
        FirebaseService.saveBuildings(DEFAULT_BUILDINGS),
        FirebaseService.saveFloors(DEFAULT_FLOORS),
        FirebaseService.saveRooms(DEFAULT_ROOMS),
        FirebaseService.saveCorridors(DEFAULT_CORRIDORS),
        FirebaseService.saveDevices(DEFAULT_DEVICES),
        FirebaseService.saveMeshRoutes(DEFAULT_MESH_ROUTES),
      ]);
      console.log('✅ Demo data reset in Firebase');
    } catch (error) {
      console.error('❌ Error resetting demo data:', error);
    }
  }, []);

  const setBuildings = useCallback(async (newBuildings: Building[]) => {
    setBuildingsState(newBuildings);
    await FirebaseService.saveBuildings(newBuildings);
  }, []);

  const setFloors = useCallback(async (newFloors: Floor[]) => {
    setFloorsState(newFloors);
    await FirebaseService.saveFloors(newFloors);
  }, []);

  const setRooms = useCallback(async (newRooms: Room[]) => {
    setRoomsState(newRooms);
    await FirebaseService.saveRooms(newRooms);
  }, []);

  const updateRoom = useCallback(async (roomId: string, updates: Partial<Room>) => {
    await FirebaseService.updateRoom(roomId, updates);
    // State will be updated by Firebase subscription
  }, []);

  const setCorridors = useCallback(async (newCorridors: Corridor[]) => {
    setCorridorsState(newCorridors);
    await FirebaseService.saveCorridors(newCorridors);
  }, []);

  const updateCorridor = useCallback(async (corridorId: string, updates: Partial<Corridor>) => {
    await FirebaseService.updateCorridor(corridorId, updates);
    // State will be updated by Firebase subscription
  }, []);

  const deleteCorridor = useCallback(async (corridorId: string) => {
    await FirebaseService.deleteCorridor(corridorId);
    // State will be updated by Firebase subscription
  }, []);

  const setDevices = useCallback(async (newDevices: Device[]) => {
    setDevicesState(newDevices);
    await FirebaseService.saveDevices(newDevices);
  }, []);

  const updateDevice = useCallback(async (deviceId: string, updates: Partial<Device>) => {
    await FirebaseService.updateDevice(deviceId, updates);
    // State will be updated by Firebase subscription
  }, []);

  const setMeshRoutes = useCallback(async (routes: MeshRoute[]) => {
    setMeshRoutesState(routes);
    await FirebaseService.saveMeshRoutes(routes);
  }, []);

  const updateMeshRoute = useCallback(async (nodeId: string, newPath: string[]) => {
    await FirebaseService.updateMeshRoute(nodeId, newPath);
    // State will be updated by Firebase subscription
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
  const updateDeviceWithLog = useCallback(async (deviceId: string, updates: Partial<Device>) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    await updateDevice(deviceId, updates);

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
    setDemoState: async (newDemoState: DemoState) => {
      setDemoState(newDemoState);
      await FirebaseService.saveDemoState(newDemoState);
    },
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
