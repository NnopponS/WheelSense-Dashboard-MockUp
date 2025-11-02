// Wheelchair Status Codes
export enum WheelStatusCode {
  OK = 0,
  IMU_NOT_FOUND = 1,
  ACCEL_UNRELIABLE = 2,
  DTHETA_CLIPPED = 3,
  UNKNOWN = 255,
}

// Wheelchair Motion Codes
export enum WheelMotionCode {
  STOP = 0,
  FORWARD = 1,
  BACKWARD = 2,
}

// Wheelchair Direction Codes
export enum WheelDirectionCode {
  STRAIGHT = 0,
  LEFT = 1,
  RIGHT = 2,
}

// Interpretation functions
export const statusText = (code: number): string => {
  switch (code) {
    case WheelStatusCode.OK:
      return 'OK';
    case WheelStatusCode.IMU_NOT_FOUND:
      return 'IMU_NOT_FOUND';
    case WheelStatusCode.ACCEL_UNRELIABLE:
      return 'ACCEL_UNRELIABLE';
    case WheelStatusCode.DTHETA_CLIPPED:
      return 'DTHETA_CLIPPED';
    default:
      return 'UNKNOWN';
  }
};

export const motionText = (code: number): string => {
  switch (code) {
    case WheelMotionCode.FORWARD:
      return 'FORWARD';
    case WheelMotionCode.BACKWARD:
      return 'BACKWARD';
    default:
      return 'STOP';
  }
};

export const directionText = (code: number): string => {
  switch (code) {
    case WheelDirectionCode.LEFT:
      return 'LEFT';
    case WheelDirectionCode.RIGHT:
      return 'RIGHT';
    default:
      return 'STRAIGHT';
  }
};

export const getStatusColor = (code: number): string => {
  switch (code) {
    case WheelStatusCode.OK:
      return '#00945E'; // Green
    case WheelStatusCode.IMU_NOT_FOUND:
      return '#dc2626'; // Red
    case WheelStatusCode.ACCEL_UNRELIABLE:
      return '#fbbf24'; // Yellow
    case WheelStatusCode.DTHETA_CLIPPED:
      return '#f97316'; // Orange
    default:
      return '#666666'; // Gray
  }
};

export const getMotionIcon = (code: number): string => {
  switch (code) {
    case WheelMotionCode.FORWARD:
      return '⬆️';
    case WheelMotionCode.BACKWARD:
      return '⬇️';
    default:
      return '⏸️';
  }
};

export const getDirectionIcon = (code: number): string => {
  switch (code) {
    case WheelDirectionCode.LEFT:
      return '⬅️';
    case WheelDirectionCode.RIGHT:
      return '➡️';
    default:
      return '⬆️';
  }
};

// Room interface
export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  floorId: string;
  nodeId?: string; // Link to node
}

// Corridor/Pathway interface
export interface Corridor {
  id: string;
  name: string;
  points: { x: number; y: number }[]; // Array of points for the corridor path
  width: number; // Width of the corridor
  floorId: string;
  color?: string;
}

// Floor interface
export interface Floor {
  id: string;
  name: string;
  level: number;
  buildingId: string;
}

// Building interface
export interface Building {
  id: string;
  name: string;
}

// Device interface
export type ApplianceKind = 'light' | 'door' | 'curtain' | 'ac' | 'fan';

export interface Device {
  id: string;
  name: string;
  mac: string;
  rssi: number;
  type: 'wheelchair' | 'node' | 'gateway' | 'appliance';
  status: 'online' | 'offline';
  room?: string;
  // Appliance-only fields
  applianceKind?: ApplianceKind;
  power?: 'on' | 'off';
  value?: number; // e.g., brightness %, curtain %, temp setpoint
  x?: number; // absolute map X for appliance icon (optional)
  y?: number; // absolute map Y for appliance icon (optional)
}

// Mesh Route interface
export interface MeshRoute {
  nodeId: string;
  path: string[];
  hopCount: number;
  latency: number;
}

// Wheelchair data from MQTT
export interface WheelchairData {
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
  // Position for map
  x?: number;
  y?: number;
  room?: string;
}

// Node telemetry data
export interface NodeTelemetry {
  node: number;
  wheels: WheelchairData[];
}

// MQTT Telemetry payload
export interface MQTTTelemetry {
  timestamp: string;
  nodes: NodeTelemetry[];
}
