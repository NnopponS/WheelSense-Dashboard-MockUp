/**
 * Application Constants
 * Central location for all configuration values and constants
 */

export const APP_CONFIG = {
  name: 'WheelSense',
  description: 'Smart Indoor Navigation',
  version: '1.0.0',
} as const;

export const COLORS = {
  primary: '#0056B3',
  primaryDark: '#004494',
  secondary: '#00945E',
  secondaryDark: '#007a4d',
  success: '#00945E',
  warning: '#fbbf24',
  error: '#dc2626',
  info: '#3b82f6',
  purple: '#8b5cf6',
  orange: '#f97316',
  gray: '#666666',
} as const;

export const MAP_STYLES = {
  strokeWidth: {
    default: 2,
    selected: 3,
    corridor: 24,
  },
  room: {
    borderRadius: 8,
    defaultColor: '#e6f2ff',
  },
  node: {
    radius: 15,
    selectedStrokeWidth: 3,
    defaultStrokeWidth: 2,
  },
  wheelchair: {
    radius: 20,
    selectedStrokeWidth: 3,
    defaultStrokeWidth: 2,
  },
  navigation: {
    pathStrokeWidth: 4,
    pathDashArray: '8,4',
    markerRadius: 12,
  },
} as const;

export const ZOOM_CONFIG = {
  min: 0.5,
  max: 3,
  step: 0.1,
  default: 0.7,
} as const;

export const RSSI_THRESHOLDS = {
  excellent: -60,
  good: -75,
} as const;

export const RSSI_COLORS = {
  excellent: COLORS.success,
  good: COLORS.warning,
  poor: COLORS.error,
} as const;

export const STATUS_COLORS = {
  ok: COLORS.success,
  imuNotFound: COLORS.error,
  accelUnreliable: COLORS.warning,
  dthetaClipped: COLORS.orange,
  unknown: COLORS.gray,
} as const;

export const TIMING = {
  wheelchairUpdateInterval: 5000, // ms
  eventLogRetention: 500, // max number of logs
  toastDuration: 3000, // ms
  debounceDelay: 300, // ms
} as const;

export const STORAGE_KEYS = {
  buildings: 'wheelsense-buildings',
  floors: 'wheelsense-floors',
  rooms: 'wheelsense-rooms',
  corridors: 'wheelsense-corridors',
  devices: 'wheelsense-devices',
  meshRoutes: 'wheelsense-mesh-routes',
  dataVersion: 'wheelsense-data-version',
} as const;

export const GAUGE_THRESHOLDS = {
  health: {
    excellent: 80,
    good: 50,
  },
  signal: {
    excellent: 70,
    good: 40,
  },
} as const;

export const APPLIANCE_ICONS = {
  light: '💡',
  door: '🚪',
  curtain: '🪟',
  ac: '❄️',
  fan: '🌀',
  default: '🔌',
} as const;

export const MOTION_ICONS = {
  forward: '⬆️',
  backward: '⬇️',
  stop: '⏸️',
} as const;

export const DIRECTION_ICONS = {
  left: '⬅️',
  right: '➡️',
  straight: '⬆️',
} as const;

export const API_CONFIG = {
  // For future API integration
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
} as const;

export const FEATURE_FLAGS = {
  enableVoiceControl: true,
  enableMQTT: false, // Not yet implemented
  enableNotifications: true,
  enableAnalytics: false,
} as const;





