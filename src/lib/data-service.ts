/**
 * Central Data Service
 * Single Source of Truth for all application data
 */

import { Building, Floor, Room, Device, MeshRoute, Corridor } from './types';

// ============================================
// DEFAULT DATA (for initialization only)
// ============================================

export const DEFAULT_BUILDINGS: Building[] = [
  { id: 'B2', name: 'Smart Home Residence' },
  { id: 'B1', name: 'Hospital (Main Campus)' },
];

export const DEFAULT_FLOORS: Floor[] = [
  { id: 'S-F1', name: 'Ground · Home', level: 1, buildingId: 'B2' },
  { id: 'H-F1', name: 'Level 1 · Ground', level: 1, buildingId: 'B1' },
  { id: 'H-F2', name: 'Level 2 · Clinical', level: 2, buildingId: 'B1' },
];

export const DEFAULT_ROOMS: Room[] = [
  // Smart Home - Square Rooms for better visual consistency
  { id: 's-garage1', name: 'Garage 1', x: 140, y: 60, width: 120, height: 120, color: '#e8e8ff', floorId: 'S-F1' },
  { id: 's-frontdoor', name: 'Front Door', x: 220, y: 200, width: 150, height: 150, color: '#ffe8e8', floorId: 'S-F1' },
  { id: 's-working', name: 'Working Room', x: 320, y: 60, width: 180, height: 180, color: '#e8ffe8', floorId: 'S-F1' },
  { id: 's-bedroom', name: 'Bedroom', x: 620, y: 60, width: 200, height: 200, color: '#ffe8f4', floorId: 'S-F1' },
  { id: 's-living', name: 'Living Room', x: 320, y: 260, width: 200, height: 200, color: '#e8f4ff', floorId: 'S-F1' },
  { id: 's-extdoor', name: 'Exterior Door', x: 80, y: 360, width: 120, height: 120, color: '#fff4e8', floorId: 'S-F1' },
  { id: 's-garage2', name: 'Garage 2', x: 220, y: 380, width: 180, height: 180, color: '#f4e8ff', floorId: 'S-F1' },
  { id: 's-catsroom', name: 'Cats Room', x: 540, y: 360, width: 100, height: 100, color: '#fffde8', floorId: 'S-F1' },
  { id: 's-2ndfloor', name: '2nd Floor', x: 660, y: 360, width: 120, height: 120, color: '#e8fff4', floorId: 'S-F1' },
  { id: 's-kitchen', name: 'Kitchen', x: 540, y: 480, width: 160, height: 160, color: '#fff8e8', floorId: 'S-F1' },
  { id: 's-bathroom', name: 'Bathroom', x: 420, y: 380, width: 100, height: 100, color: '#e8f4ff', floorId: 'S-F1' },
  
  // Hospital - Ground Floor - Square Rooms
  { id: 'h-lobby', name: 'Main Lobby', x: 60, y: 60, width: 280, height: 280, color: '#e6f2ff', floorId: 'H-F1', nodeId: 'N-01' },
  { id: 'h-reception', name: 'Registration', x: 60, y: 360, width: 160, height: 160, color: '#ecfeff', floorId: 'H-F1' },
  { id: 'h-triage', name: 'Triage', x: 240, y: 360, width: 160, height: 160, color: '#f0fdf4', floorId: 'H-F1', nodeId: 'N-02' },
  { id: 'h-exam-1', name: 'Exam Room 1', x: 360, y: 60, width: 160, height: 160, color: '#fff7ed', floorId: 'H-F1' },
  { id: 'h-pharmacy', name: 'Pharmacy', x: 540, y: 60, width: 200, height: 200, color: '#f0f9ff', floorId: 'H-F1' },
  { id: 'h-wards', name: 'Wards', x: 420, y: 360, width: 240, height: 240, color: '#fef3c7', floorId: 'H-F1', nodeId: 'N-04' },
  
  // Hospital - Floor 2 - Square Rooms
  { id: 'h-icu', name: 'ICU', x: 60, y: 60, width: 260, height: 260, color: '#fee2e2', floorId: 'H-F2' },
  { id: 'h-surgery', name: 'Surgery', x: 340, y: 60, width: 260, height: 260, color: '#fde68a', floorId: 'H-F2' },
];

export const DEFAULT_DEVICES: Device[] = [
  // Wheelchairs
  { id: 'W-01', name: 'WheelSense W-01', mac: 'AA:BB:CC:DD:EE:01', rssi: -64, type: 'wheelchair', status: 'online', room: 'Bedroom' },
  { id: 'W-02', name: 'WheelSense W-02', mac: 'AA:BB:CC:DD:EE:02', rssi: -58, type: 'wheelchair', status: 'online', room: 'Wards' },
  
  // Nodes
  { id: 'N-01', name: 'Node - Lobby', mac: 'AA:BB:CC:DD:EE:03', rssi: -62, type: 'node', status: 'online', room: 'Main Lobby' },
  { id: 'N-02', name: 'Node - Triage', mac: 'AA:BB:CC:DD:EE:04', rssi: -68, type: 'node', status: 'online', room: 'Triage' },
  { id: 'N-04', name: 'Node - Wards', mac: 'AA:BB:CC:DD:EE:06', rssi: -72, type: 'node', status: 'online', room: 'Wards' },
  { id: 'GW-1', name: 'Gateway - Main', mac: 'AA:BB:CC:DD:EE:FF', rssi: -55, type: 'gateway', status: 'online' },
  
  // Smart Home - Garage 1
  { id: 'A-garage1-door', name: 'Door', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Garage 1', applianceKind: 'door', power: 'off' },
  { id: 'A-garage1-light', name: 'Light', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Garage 1', applianceKind: 'light', power: 'off', value: 0 },
  
  // Smart Home - Front Door
  { id: 'A-frontdoor-light', name: 'Light', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Front Door', applianceKind: 'light', power: 'off', value: 0 },
  
  // Smart Home - Working Room
  { id: 'A-working-light', name: 'Light', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Working Room', applianceKind: 'light', power: 'off', value: 0 },
  { id: 'A-working-fan', name: 'Fan', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Working Room', applianceKind: 'fan', power: 'off', value: 50 },
  
  // Smart Home - Bedroom
  { id: 'A-bedroom-light1', name: 'Light 1', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Bedroom', applianceKind: 'light', power: 'off', value: 0 },
  { id: 'A-bedroom-light2', name: 'Light 2', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Bedroom', applianceKind: 'light', power: 'off', value: 0 },
  { id: 'A-bedroom-door', name: 'Door', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Bedroom', applianceKind: 'door', power: 'off' },
  { id: 'A-bedroom-ac', name: 'AC', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Bedroom', applianceKind: 'ac', power: 'off', value: 24 },
  { id: 'A-bedroom-fan', name: 'Fan', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Bedroom', applianceKind: 'fan', power: 'off', value: 50 },
  
  // Smart Home - Living Room  
  { id: 'A-living-light1', name: 'Light 1', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Living Room', applianceKind: 'light', power: 'off', value: 0 },
  { id: 'A-living-light2', name: 'Light 2', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Living Room', applianceKind: 'light', power: 'off', value: 0 },
  { id: 'A-living-door', name: 'Door', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Living Room', applianceKind: 'door', power: 'off' },
  { id: 'A-living-ac', name: 'AC', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Living Room', applianceKind: 'ac', power: 'off', value: 24 },
  
  // Smart Home - Garage 2
  { id: 'A-garage2-light1', name: 'Light 1', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Garage 2', applianceKind: 'light', power: 'off', value: 0 },
  { id: 'A-garage2-light2', name: 'Light 2', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Garage 2', applianceKind: 'light', power: 'off', value: 0 },
  
  // Smart Home - Cats Room
  { id: 'A-catsroom-fan', name: 'Fan', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Cats Room', applianceKind: 'fan', power: 'off', value: 50 },
  { id: 'A-catsroom-light', name: 'Light', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Cats Room', applianceKind: 'light', power: 'off', value: 0 },
  
  // Smart Home - 2nd Floor
  { id: 'A-2ndfloor-light', name: 'Light', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: '2nd Floor', applianceKind: 'light', power: 'off', value: 0 },
  
  // Smart Home - Kitchen
  { id: 'A-kitchen-light1', name: 'Light 1', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Kitchen', applianceKind: 'light', power: 'off', value: 0 },
  { id: 'A-kitchen-light2', name: 'Light 2', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Kitchen', applianceKind: 'light', power: 'off', value: 0 },
  { id: 'A-kitchen-fan', name: 'Fan', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Kitchen', applianceKind: 'fan', power: 'off', value: 50 },
  
  // Smart Home - Bathroom
  { id: 'A-bathroom-light1', name: 'Light 1', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Bathroom', applianceKind: 'light', power: 'off', value: 0 },
  { id: 'A-bathroom-fan', name: 'Exhaust Fan', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Bathroom', applianceKind: 'fan', power: 'off', value: 50 },
  
  // Exterior Door
  { id: 'A-extdoor-door', name: 'Exterior Door', mac: '-', rssi: -30, type: 'appliance', status: 'online', room: 'Exterior Door', applianceKind: 'door', power: 'off' },
];

export const DEFAULT_MESH_ROUTES: MeshRoute[] = [
  { nodeId: 'N-01', path: ['N-01', 'Gateway'], hopCount: 1, latency: 450 },
  { nodeId: 'N-02', path: ['N-02', 'N-01', 'Gateway'], hopCount: 2, latency: 820 },
  { nodeId: 'N-04', path: ['N-04', 'Gateway'], hopCount: 1, latency: 510 },
];

export const DEFAULT_CORRIDORS: Corridor[] = [
  { id: 'cor-h-1', name: 'Main Corridor', points: [{ x: 60, y: 452 }, { x: 1240, y: 452 }], width: 24, floorId: 'H-F1', color: '#e5e7eb' },
  { id: 'cor-h-2', name: 'Corridor B', points: [{ x: 60, y: 432 }, { x: 1240, y: 432 }], width: 24, floorId: 'H-F2', color: '#e5e7eb' },
];

// ============================================
// DATA SERVICE METHODS
// ============================================

export class DataService {
  // Device Management
  static generateWheelchairId(existingDevices: Device[]): string {
    const wheelchairs = existingDevices.filter(d => d.type === 'wheelchair');
    const count = wheelchairs.length + 1;
    return `W-${String(count).padStart(2, '0')}`;
  }

  static generateMacAddress(): string {
    return `AA:BB:CC:DD:EE:${String(Math.floor(Math.random() * 256)).padStart(2, '0')}`;
  }

  static generateNodeId(existingDevices: Device[]): string {
    const nodes = existingDevices.filter(d => d.type === 'node');
    const count = nodes.length + 1;
    return `N-${String(count).padStart(2, '0')}`;
  }

  // Filtering
  static getDevicesByType(devices: Device[], type: Device['type']): Device[] {
    return devices.filter(d => d.type === type);
  }

  static getDevicesByRoom(devices: Device[], room: string): Device[] {
    return devices.filter(d => d.room === room);
  }

  static getDevicesByFloor(devices: Device[], rooms: Room[], floorId: string): Device[] {
    const floorRooms = rooms.filter(r => r.floorId === floorId).map(r => r.name);
    return devices.filter(d => d.room && floorRooms.includes(d.room));
  }

  // Room Management
  static getRoomsByFloor(rooms: Room[], floorId: string): Room[] {
    return rooms.filter(r => r.floorId === floorId);
  }

  static getRoomsByBuilding(rooms: Room[], floors: Floor[], buildingId: string): Room[] {
    const buildingFloors = floors.filter(f => f.buildingId === buildingId).map(f => f.id);
    return rooms.filter(r => buildingFloors.includes(r.floorId));
  }

  // Statistics
  static getSystemStats(devices: Device[]) {
    const wheelchairs = this.getDevicesByType(devices, 'wheelchair');
    const nodes = this.getDevicesByType(devices, 'node');
    const appliances = this.getDevicesByType(devices, 'appliance');
    
    return {
      totalWheelchairs: wheelchairs.length,
      activeWheelchairs: wheelchairs.filter(d => d.status === 'online').length,
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(d => d.status === 'online').length,
      totalAppliances: appliances.length,
      onAppliances: appliances.filter(d => d.power === 'on').length,
      systemHealth: Math.round((nodes.filter(d => d.status === 'online').length / nodes.length) * 100) || 0,
    };
  }

  // Validation
  static validateDevice(device: Partial<Device>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!device.name) errors.push('Name is required');
    if (!device.type) errors.push('Type is required');
    if (!device.mac) errors.push('MAC address is required');
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateRoom(room: Partial<Room>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!room.name) errors.push('Name is required');
    if (!room.floorId) errors.push('Floor is required');
    if (room.x === undefined) errors.push('X position is required');
    if (room.y === undefined) errors.push('Y position is required');
    if (!room.width) errors.push('Width is required');
    if (!room.height) errors.push('Height is required');
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export default DataService;



