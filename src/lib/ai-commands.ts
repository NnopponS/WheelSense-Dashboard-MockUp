/**
 * AI Assistant Command Handlers
 * Centralized logic for processing voice/text commands
 */

import { Device, ApplianceKind } from './types';
import { DataService } from './data-service';

export interface CommandResult {
  success: boolean;
  message: string;
  actions?: Array<{
    deviceId: string;
    updates: Partial<Device>;
  }>;
}

/**
 * Control devices by appliance kind and action
 */
export function controlDevices(
  devices: Device[],
  kind: ApplianceKind,
  action: 'on' | 'off',
  targetRoom?: string
): CommandResult {
  const targetDevices = devices.filter((d) => {
    const matchesKind = d.applianceKind === kind;
    const matchesRoom = !targetRoom || d.room === targetRoom;
    const matchesCurrentState = d.power !== action;
    return matchesKind && matchesRoom && matchesCurrentState;
  });

  if (targetDevices.length === 0) {
    const statusText = action === 'on' ? 'เปิดอยู่' : 'ปิดอยู่';
    const kindText = getKindText(kind);
    return {
      success: false,
      message: `${kindText}ทั้งหมด${statusText}แล้วค่ะ`,
    };
  }

  const kindText = getKindText(kind);
  const actionText = action === 'on' ? 'เปิด' : 'ปิด';
  const deviceList = targetDevices.map((d) => `• ${d.name} (${d.room})`).join('\n');

  return {
    success: true,
    message: `✅ ${actionText}${kindText}แล้ว ${targetDevices.length} ${kind === 'ac' ? 'เครื่อง' : 'ดวง'}:\n${deviceList}`,
    actions: targetDevices.map((d) => ({
      deviceId: d.id,
      updates: {
        power: action,
        ...(action === 'on' && kind === 'light' ? { value: 100 } : {}),
        ...(action === 'on' && kind === 'ac' ? { value: 24 } : {}),
      },
    })),
  };
}

/**
 * Get device kind text in Thai
 */
function getKindText(kind: ApplianceKind): string {
  switch (kind) {
    case 'light':
      return 'ไฟ';
    case 'ac':
      return 'แอร์';
    case 'fan':
      return 'พัดลม';
    case 'door':
      return 'ประตู';
    case 'curtain':
      return 'ม่าน';
    default:
      return 'อุปกรณ์';
  }
}

/**
 * Parse wheelchair location query
 */
export function parseWheelchairQuery(input: string): number | null {
  const match = input.match(/w-?(\d+)/i);
  return match ? parseInt(match[1]) : null;
}

/**
 * Check if input is a wheelchair location query
 */
export function isWheelchairQuery(input: string): boolean {
  return (
    input.includes('w-') &&
    (input.includes('ไหน') || input.includes('where') || input.includes('อยู่'))
  );
}

/**
 * Check if input is a device control command
 */
export function isDeviceControlCommand(input: string): {
  isCommand: boolean;
  kind?: ApplianceKind;
  action?: 'on' | 'off';
} {
  const lowerInput = input.toLowerCase();

  // Light controls
  if (lowerInput.includes('เปิดไฟ') || lowerInput.includes('เปิด ไฟ')) {
    return { isCommand: true, kind: 'light', action: 'on' };
  }
  if (lowerInput.includes('ปิดไฟ') || lowerInput.includes('ปิด ไฟ')) {
    return { isCommand: true, kind: 'light', action: 'off' };
  }

  // AC controls
  if (lowerInput.includes('เปิดแอร์') || lowerInput.includes('เปิด แอร์')) {
    return { isCommand: true, kind: 'ac', action: 'on' };
  }
  if (lowerInput.includes('ปิดแอร์') || lowerInput.includes('ปิด แอร์')) {
    return { isCommand: true, kind: 'ac', action: 'off' };
  }

  // Fan controls
  if (lowerInput.includes('เปิดพัดลม') || lowerInput.includes('เปิด พัดลม')) {
    return { isCommand: true, kind: 'fan', action: 'on' };
  }
  if (lowerInput.includes('ปิดพัดลม') || lowerInput.includes('ปิด พัดลม')) {
    return { isCommand: true, kind: 'fan', action: 'off' };
  }

  // Door controls
  if (lowerInput.includes('เปิดประตู')) {
    return { isCommand: true, kind: 'door', action: 'on' };
  }
  if (lowerInput.includes('ปิดประตู')) {
    return { isCommand: true, kind: 'door', action: 'off' };
  }

  return { isCommand: false };
}

/**
 * Generate system status report
 */
export function generateSystemStatusReport(devices: Device[]): string {
  const stats = DataService.getSystemStats(devices);
  return `📊 สถานะระบบ WheelSense\n\n♿ Wheelchairs: ${stats.activeWheelchairs}/${stats.totalWheelchairs} online\n📡 Nodes: ${stats.onlineNodes}/${stats.totalNodes} online\n🏠 Smart Devices: ${stats.onAppliances}/${stats.totalAppliances} เปิดอยู่\n💚 System Health: ${stats.systemHealth}%`;
}

/**
 * Get default help message
 */
export function getHelpMessage(): string {
  return 'ฉันเข้าใจคำถามของคุณแล้ว ลองถามเกี่ยวกับ:\n\n• "W-01 อยู่ไหน?" - หาตำแหน่ง wheelchair\n• "เปิดไฟ" / "ปิดไฟ" - ควบคุมไฟ\n• "เปิดแอร์" / "ปิดแอร์" - ควบคุมแอร์\n• "เปิดพัดลม" / "ปิดพัดลม" - ควบคุมพัดลม\n• "สถานะระบบ" - ดูภาพรวม';
}




