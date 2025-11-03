/**
 * Firebase Realtime Database Service
 * Central service for all Firebase data operations
 */

import { database } from './firebase';
import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  push,
  DataSnapshot,
} from 'firebase/database';
import {
  Building,
  Floor,
  Room,
  Corridor,
  Device,
  MeshRoute,
} from './types';
import { DemoState } from './store';

// ============================================
// FIREBASE PATHS
// ============================================
const PATHS = {
  buildings: 'buildings',
  floors: 'floors',
  rooms: 'rooms',
  corridors: 'corridors',
  devices: 'devices',
  meshRoutes: 'meshRoutes',
  patients: 'patients',
  demoState: 'demoState',
  wheelchairPositions: 'wheelchairPositions',
};

// ============================================
// TYPES
// ============================================
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  condition: string;
  wheelchairId?: string;
  room: string;
  admissionDate: string;
  status: 'active' | 'discharged' | 'emergency';
  doctorNotes: string;
  medications: string[];
  emergencyContact: string;
  phone: string;
}

export interface WheelchairPosition {
  wheel: number;
  distance: number;
  status: number;
  motion: number;
  direction: number;
  rssi: number;
  stale: boolean;
  ts: string;
  route_recovered: boolean;
  route_latency_ms: number;
  route_path: string[];
  x?: number;
  y?: number;
  room?: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert Firebase snapshot to typed data
 */
function snapshotToData<T>(snapshot: DataSnapshot): T | null {
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.val() as T;
}

/**
 * Convert Firebase snapshot to array of typed data
 */
function snapshotToArray<T>(snapshot: DataSnapshot): T[] {
  if (!snapshot.exists()) {
    return [];
  }
  const data = snapshot.val();
  if (Array.isArray(data)) {
    return data;
  }
  // Convert object to array
  return Object.values(data) as T[];
}

// ============================================
// BUILDINGS
// ============================================

export async function saveBuildings(buildings: Building[]): Promise<void> {
  try {
    await set(ref(database, PATHS.buildings), buildings);
    console.log('✅ Buildings saved to Firebase');
  } catch (error) {
    console.error('❌ Error saving buildings:', error);
    throw error;
  }
}

export async function getBuildings(): Promise<Building[]> {
  try {
    const snapshot = await get(ref(database, PATHS.buildings));
    return snapshotToArray<Building>(snapshot);
  } catch (error) {
    console.error('❌ Error getting buildings:', error);
    return [];
  }
}

export function subscribeToBuildings(callback: (buildings: Building[]) => void): () => void {
  const buildingsRef = ref(database, PATHS.buildings);
  const unsubscribe = onValue(buildingsRef, (snapshot) => {
    const buildings = snapshotToArray<Building>(snapshot);
    callback(buildings);
  });
  return () => off(buildingsRef, 'value', unsubscribe);
}

// ============================================
// FLOORS
// ============================================

export async function saveFloors(floors: Floor[]): Promise<void> {
  try {
    await set(ref(database, PATHS.floors), floors);
    console.log('✅ Floors saved to Firebase');
  } catch (error) {
    console.error('❌ Error saving floors:', error);
    throw error;
  }
}

export async function getFloors(): Promise<Floor[]> {
  try {
    const snapshot = await get(ref(database, PATHS.floors));
    return snapshotToArray<Floor>(snapshot);
  } catch (error) {
    console.error('❌ Error getting floors:', error);
    return [];
  }
}

export function subscribeToFloors(callback: (floors: Floor[]) => void): () => void {
  const floorsRef = ref(database, PATHS.floors);
  const unsubscribe = onValue(floorsRef, (snapshot) => {
    const floors = snapshotToArray<Floor>(snapshot);
    callback(floors);
  });
  return () => off(floorsRef, 'value', unsubscribe);
}

// ============================================
// ROOMS
// ============================================

export async function saveRooms(rooms: Room[]): Promise<void> {
  try {
    await set(ref(database, PATHS.rooms), rooms);
    console.log('✅ Rooms saved to Firebase');
  } catch (error) {
    console.error('❌ Error saving rooms:', error);
    throw error;
  }
}

export async function getRooms(): Promise<Room[]> {
  try {
    const snapshot = await get(ref(database, PATHS.rooms));
    return snapshotToArray<Room>(snapshot);
  } catch (error) {
    console.error('❌ Error getting rooms:', error);
    return [];
  }
}

export function subscribeToRooms(callback: (rooms: Room[]) => void): () => void {
  const roomsRef = ref(database, PATHS.rooms);
  const unsubscribe = onValue(roomsRef, (snapshot) => {
    const rooms = snapshotToArray<Room>(snapshot);
    callback(rooms);
  });
  return () => off(roomsRef, 'value', unsubscribe);
}

export async function updateRoom(roomId: string, updates: Partial<Room>): Promise<void> {
  try {
    const snapshot = await get(ref(database, PATHS.rooms));
    const rooms = snapshotToArray<Room>(snapshot);
    const updatedRooms = rooms.map((room) =>
      room.id === roomId ? { ...room, ...updates } : room
    );
    await saveRooms(updatedRooms);
    console.log('✅ Room updated in Firebase');
  } catch (error) {
    console.error('❌ Error updating room:', error);
    throw error;
  }
}

// ============================================
// CORRIDORS
// ============================================

export async function saveCorridors(corridors: Corridor[]): Promise<void> {
  try {
    await set(ref(database, PATHS.corridors), corridors);
    console.log('✅ Corridors saved to Firebase');
  } catch (error) {
    console.error('❌ Error saving corridors:', error);
    throw error;
  }
}

export async function getCorridors(): Promise<Corridor[]> {
  try {
    const snapshot = await get(ref(database, PATHS.corridors));
    return snapshotToArray<Corridor>(snapshot);
  } catch (error) {
    console.error('❌ Error getting corridors:', error);
    return [];
  }
}

export function subscribeToCorridors(callback: (corridors: Corridor[]) => void): () => void {
  const corridorsRef = ref(database, PATHS.corridors);
  const unsubscribe = onValue(corridorsRef, (snapshot) => {
    const corridors = snapshotToArray<Corridor>(snapshot);
    callback(corridors);
  });
  return () => off(corridorsRef, 'value', unsubscribe);
}

export async function updateCorridor(corridorId: string, updates: Partial<Corridor>): Promise<void> {
  try {
    const snapshot = await get(ref(database, PATHS.corridors));
    const corridors = snapshotToArray<Corridor>(snapshot);
    const updatedCorridors = corridors.map((corridor) =>
      corridor.id === corridorId ? { ...corridor, ...updates } : corridor
    );
    await saveCorridors(updatedCorridors);
    console.log('✅ Corridor updated in Firebase');
  } catch (error) {
    console.error('❌ Error updating corridor:', error);
    throw error;
  }
}

export async function deleteCorridor(corridorId: string): Promise<void> {
  try {
    const snapshot = await get(ref(database, PATHS.corridors));
    const corridors = snapshotToArray<Corridor>(snapshot);
    const updatedCorridors = corridors.filter((corridor) => corridor.id !== corridorId);
    await saveCorridors(updatedCorridors);
    console.log('✅ Corridor deleted from Firebase');
  } catch (error) {
    console.error('❌ Error deleting corridor:', error);
    throw error;
  }
}

// ============================================
// DEVICES
// ============================================

export async function saveDevices(devices: Device[]): Promise<void> {
  try {
    await set(ref(database, PATHS.devices), devices);
    console.log('✅ Devices saved to Firebase');
  } catch (error) {
    console.error('❌ Error saving devices:', error);
    throw error;
  }
}

export async function getDevices(): Promise<Device[]> {
  try {
    const snapshot = await get(ref(database, PATHS.devices));
    return snapshotToArray<Device>(snapshot);
  } catch (error) {
    console.error('❌ Error getting devices:', error);
    return [];
  }
}

export function subscribeToDevices(callback: (devices: Device[]) => void): () => void {
  const devicesRef = ref(database, PATHS.devices);
  const unsubscribe = onValue(devicesRef, (snapshot) => {
    const devices = snapshotToArray<Device>(snapshot);
    callback(devices);
  });
  return () => off(devicesRef, 'value', unsubscribe);
}

export async function updateDevice(deviceId: string, updates: Partial<Device>): Promise<void> {
  try {
    const snapshot = await get(ref(database, PATHS.devices));
    const devices = snapshotToArray<Device>(snapshot);
    const updatedDevices = devices.map((device) =>
      device.id === deviceId ? { ...device, ...updates } : device
    );
    await saveDevices(updatedDevices);
    console.log('✅ Device updated in Firebase');
  } catch (error) {
    console.error('❌ Error updating device:', error);
    throw error;
  }
}

// ============================================
// MESH ROUTES
// ============================================

export async function saveMeshRoutes(routes: MeshRoute[]): Promise<void> {
  try {
    await set(ref(database, PATHS.meshRoutes), routes);
    console.log('✅ Mesh routes saved to Firebase');
  } catch (error) {
    console.error('❌ Error saving mesh routes:', error);
    throw error;
  }
}

export async function getMeshRoutes(): Promise<MeshRoute[]> {
  try {
    const snapshot = await get(ref(database, PATHS.meshRoutes));
    return snapshotToArray<MeshRoute>(snapshot);
  } catch (error) {
    console.error('❌ Error getting mesh routes:', error);
    return [];
  }
}

export function subscribeToMeshRoutes(callback: (routes: MeshRoute[]) => void): () => void {
  const routesRef = ref(database, PATHS.meshRoutes);
  const unsubscribe = onValue(routesRef, (snapshot) => {
    const routes = snapshotToArray<MeshRoute>(snapshot);
    callback(routes);
  });
  return () => off(routesRef, 'value', unsubscribe);
}

export async function updateMeshRoute(nodeId: string, newPath: string[]): Promise<void> {
  try {
    const snapshot = await get(ref(database, PATHS.meshRoutes));
    const routes = snapshotToArray<MeshRoute>(snapshot);
    const updatedRoutes = routes.map((route) =>
      route.nodeId === nodeId
        ? { ...route, path: newPath, hopCount: newPath.length - 1 }
        : route
    );
    await saveMeshRoutes(updatedRoutes);
    console.log('✅ Mesh route updated in Firebase');
  } catch (error) {
    console.error('❌ Error updating mesh route:', error);
    throw error;
  }
}

// ============================================
// PATIENTS
// ============================================

export async function savePatients(patients: Patient[]): Promise<void> {
  try {
    await set(ref(database, PATHS.patients), patients);
    console.log('✅ Patients saved to Firebase');
  } catch (error) {
    console.error('❌ Error saving patients:', error);
    throw error;
  }
}

export async function getPatients(): Promise<Patient[]> {
  try {
    const snapshot = await get(ref(database, PATHS.patients));
    return snapshotToArray<Patient>(snapshot);
  } catch (error) {
    console.error('❌ Error getting patients:', error);
    return [];
  }
}

export function subscribeToPatients(callback: (patients: Patient[]) => void): () => void {
  const patientsRef = ref(database, PATHS.patients);
  const unsubscribe = onValue(patientsRef, (snapshot) => {
    const patients = snapshotToArray<Patient>(snapshot);
    callback(patients);
  });
  return () => off(patientsRef, 'value', unsubscribe);
}

export async function addPatient(patient: Patient): Promise<void> {
  try {
    const snapshot = await get(ref(database, PATHS.patients));
    const patients = snapshotToArray<Patient>(snapshot);
    patients.push(patient);
    await savePatients(patients);
    console.log('✅ Patient added to Firebase');
  } catch (error) {
    console.error('❌ Error adding patient:', error);
    throw error;
  }
}

export async function updatePatient(patientId: string, updates: Partial<Patient>): Promise<void> {
  try {
    const snapshot = await get(ref(database, PATHS.patients));
    const patients = snapshotToArray<Patient>(snapshot);
    const updatedPatients = patients.map((patient) =>
      patient.id === patientId ? { ...patient, ...updates } : patient
    );
    await savePatients(updatedPatients);
    console.log('✅ Patient updated in Firebase');
  } catch (error) {
    console.error('❌ Error updating patient:', error);
    throw error;
  }
}

export async function deletePatient(patientId: string): Promise<void> {
  try {
    const snapshot = await get(ref(database, PATHS.patients));
    const patients = snapshotToArray<Patient>(snapshot);
    const updatedPatients = patients.filter((patient) => patient.id !== patientId);
    await savePatients(updatedPatients);
    console.log('✅ Patient deleted from Firebase');
  } catch (error) {
    console.error('❌ Error deleting patient:', error);
    throw error;
  }
}

// ============================================
// DEMO STATE (for cross-device synchronization)
// ============================================

export async function saveDemoState(demoState: DemoState): Promise<void> {
  try {
    await set(ref(database, PATHS.demoState), demoState);
    console.log('🎬 Demo state saved to Firebase');
  } catch (error) {
    console.error('❌ Error saving demo state:', error);
    throw error;
  }
}

export async function getDemoState(): Promise<DemoState | null> {
  try {
    const snapshot = await get(ref(database, PATHS.demoState));
    return snapshotToData<DemoState>(snapshot);
  } catch (error) {
    console.error('❌ Error getting demo state:', error);
    return null;
  }
}

export function subscribeToDemoState(callback: (demoState: DemoState | null) => void): () => void {
  const demoStateRef = ref(database, PATHS.demoState);
  const unsubscribe = onValue(demoStateRef, (snapshot) => {
    const demoState = snapshotToData<DemoState>(snapshot);
    callback(demoState);
  });
  return () => off(demoStateRef, 'value', unsubscribe);
}

// ============================================
// WHEELCHAIR POSITIONS (Real-time)
// ============================================

export async function saveWheelchairPosition(
  wheelId: number,
  position: WheelchairPosition
): Promise<void> {
  try {
    await set(ref(database, `${PATHS.wheelchairPositions}/${wheelId}`), position);
  } catch (error) {
    console.error('❌ Error saving wheelchair position:', error);
    throw error;
  }
}

export async function getWheelchairPositions(): Promise<Map<number, WheelchairPosition>> {
  try {
    const snapshot = await get(ref(database, PATHS.wheelchairPositions));
    const positions = new Map<number, WheelchairPosition>();
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.entries(data).forEach(([wheelId, position]) => {
        positions.set(Number(wheelId), position as WheelchairPosition);
      });
    }
    return positions;
  } catch (error) {
    console.error('❌ Error getting wheelchair positions:', error);
    return new Map();
  }
}

export function subscribeToWheelchairPositions(
  callback: (positions: Map<number, WheelchairPosition>) => void
): () => void {
  const positionsRef = ref(database, PATHS.wheelchairPositions);
  const unsubscribe = onValue(positionsRef, (snapshot) => {
    const positions = new Map<number, WheelchairPosition>();
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.entries(data).forEach(([wheelId, position]) => {
        positions.set(Number(wheelId), position as WheelchairPosition);
      });
    }
    callback(positions);
  });
  return () => off(positionsRef, 'value', unsubscribe);
}

// ============================================
// INITIALIZE DEFAULT DATA
// ============================================

export async function initializeDefaultData(
  buildings: Building[],
  floors: Floor[],
  rooms: Room[],
  corridors: Corridor[],
  devices: Device[],
  meshRoutes: MeshRoute[]
): Promise<void> {
  try {
    console.log('🔄 Checking if Firebase data needs initialization...');
    
    // Check if data already exists
    const [existingBuildings, existingFloors, existingRooms] = await Promise.all([
      getBuildings(),
      getFloors(),
      getRooms(),
    ]);

    // Only initialize if data doesn't exist
    if (existingBuildings.length === 0) {
      console.log('📦 Initializing Firebase with default data...');
      await Promise.all([
        saveBuildings(buildings),
        saveFloors(floors),
        saveRooms(rooms),
        saveCorridors(corridors),
        saveDevices(devices),
        saveMeshRoutes(meshRoutes),
      ]);
      console.log('✅ Firebase initialized with default data');
    } else {
      console.log('✅ Firebase data already exists, skipping initialization');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase data:', error);
    throw error;
  }
}

// Export all functions
export const FirebaseService = {
  // Buildings
  saveBuildings,
  getBuildings,
  subscribeToBuildings,
  
  // Floors
  saveFloors,
  getFloors,
  subscribeToFloors,
  
  // Rooms
  saveRooms,
  getRooms,
  subscribeToRooms,
  updateRoom,
  
  // Corridors
  saveCorridors,
  getCorridors,
  subscribeToCorridors,
  updateCorridor,
  deleteCorridor,
  
  // Devices
  saveDevices,
  getDevices,
  subscribeToDevices,
  updateDevice,
  
  // Mesh Routes
  saveMeshRoutes,
  getMeshRoutes,
  subscribeToMeshRoutes,
  updateMeshRoute,
  
  // Patients
  savePatients,
  getPatients,
  subscribeToPatients,
  addPatient,
  updatePatient,
  deletePatient,
  
  // Demo State
  saveDemoState,
  getDemoState,
  subscribeToDemoState,
  
  // Wheelchair Positions
  saveWheelchairPosition,
  getWheelchairPositions,
  subscribeToWheelchairPositions,
  
  // Initialize
  initializeDefaultData,
};

export default FirebaseService;

