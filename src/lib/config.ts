// Legacy config - not used anymore (replaced by data-service.ts)
// Kept for backward compatibility

export const defaultConfig = {
  buildings: [
    { id: 'home', name: 'Home' },
    { id: 'hospital', name: 'Hospital' },
  ],
  floors: [
    { id: 'home-floor', name: 'Ground', level: 0, buildingId: 'home' },
    { id: 'hosp-f1', name: 'Floor 1', level: 1, buildingId: 'hospital' },
    { id: 'hosp-f2', name: 'Floor 2', level: 2, buildingId: 'hospital' },
  ],
  rooms: [
    // Home rooms (for storyboard: bedroom, living room)
    { id: 'home-bedroom', name: 'Bedroom', x: 60, y: 60, width: 240, height: 180, color: '#e0f2fe', floorId: 'home-floor', nodeId: 'N-H1' },
    { id: 'home-living', name: 'Living Room', x: 340, y: 60, width: 300, height: 220, color: '#dcfce7', floorId: 'home-floor', nodeId: 'N-H2' },
    { id: 'home-kitchen', name: 'Kitchen', x: 60, y: 270, width: 240, height: 170, color: '#fee2e2', floorId: 'home-floor', nodeId: 'N-H3' },
    // Hospital sample rooms
    { id: 'lob-1', name: 'Lobby', x: 60, y: 60, width: 220, height: 140, color: '#f3e8ff', floorId: 'hosp-f1', nodeId: 'N-01' },
    { id: 'cor-1', name: 'Corridor', x: 300, y: 60, width: 340, height: 80, color: '#e4e4e7', floorId: 'hosp-f1', nodeId: 'N-02' },
    { id: 'cli-1', name: 'Clinic', x: 300, y: 160, width: 340, height: 140, color: '#dbeafe', floorId: 'hosp-f1', nodeId: 'N-03' },
    { id: 'ward-2', name: 'Wards', x: 60, y: 260, width: 220, height: 140, color: '#fee2e2', floorId: 'hosp-f2', nodeId: 'N-04' },
    { id: 'thp-2', name: 'Therapy', x: 300, y: 260, width: 340, height: 140, color: '#dcfce7', floorId: 'hosp-f2', nodeId: 'N-05' },
  ],
  devices: [
    // Wheelchairs (sample)
    { id: 'W-02', name: 'Wheelchair 02', mac: 'AA:BB:CC:DD:EE:02', rssi: -58, type: 'wheelchair', status: 'online', room: 'Lobby' },
    { id: 'W-04', name: 'Wheelchair 04', mac: 'AA:BB:CC:DD:EE:04', rssi: -62, type: 'wheelchair', status: 'online', room: 'Clinic' },
    { id: 'W-07', name: 'Wheelchair 07', mac: 'AA:BB:CC:DD:EE:07', rssi: -71, type: 'wheelchair', status: 'offline', room: 'Corridor' },
    // Hospital nodes and gateway
    { id: 'N-01', name: 'Node 01', mac: '11:22:33:44:55:01', rssi: -50, type: 'node', status: 'online', room: 'Lobby' },
    { id: 'N-02', name: 'Node 02', mac: '11:22:33:44:55:02', rssi: -64, type: 'node', status: 'online', room: 'Corridor' },
    { id: 'N-03', name: 'Node 03', mac: '11:22:33:44:55:03', rssi: -70, type: 'node', status: 'online', room: 'Clinic' },
    { id: 'GW-1', name: 'Gateway 1', mac: '99:88:77:66:55:00', rssi: -45, type: 'gateway', status: 'online', room: 'Lobby' },
    // Home nodes
    { id: 'N-H1', name: 'Home Node Bedroom', mac: '22:33:44:55:66:01', rssi: -48, type: 'node', status: 'online', room: 'Bedroom' },
    { id: 'N-H2', name: 'Home Node Living', mac: '22:33:44:55:66:02', rssi: -53, type: 'node', status: 'online', room: 'Living Room' },
    { id: 'N-H3', name: 'Home Node Kitchen', mac: '22:33:44:55:66:03', rssi: -60, type: 'node', status: 'offline', room: 'Kitchen' },
  ],
  meshRoutes: [
    { nodeId: 'N-01', path: ['N-01', 'Gateway'], hopCount: 1, latency: 120 },
    { nodeId: 'N-02', path: ['N-02', 'N-03', 'Gateway'], hopCount: 2, latency: 240 },
    { nodeId: 'N-03', path: ['N-03', 'Gateway'], hopCount: 1, latency: 160 },
  ],
  homeDevices: [
    // Storyboard: Bedroom AC control (use fan with slider), bedroom light toggle
    { id: 'hd-light-bed', name: 'Bedroom Light', kind: 'light', mode: 'toggle', on: false, level: undefined, room: 'Bedroom' },
    { id: 'hd-ac-bed', name: 'Bedroom AC', kind: 'fan', mode: 'slide', on: false, level: 0, room: 'Bedroom' },
    // Living room light & curtain & door
    { id: 'hd-light-liv', name: 'Living Room Light', kind: 'light', mode: 'toggle', on: true, level: undefined, room: 'Living Room' },
    { id: 'hd-curtain-liv', name: 'Living Room Curtain', kind: 'curtain', mode: 'slide', on: true, level: 100, room: 'Living Room' },
    { id: 'hd-door-main', name: 'Sliding Door', kind: 'door', mode: 'toggle', on: false, level: undefined, room: 'Living Room' },
  ],
};

export function validateConfig(config: any): boolean {
  return !!(config && Array.isArray(config.buildings) && Array.isArray(config.floors) && Array.isArray(config.rooms));
}

