/**
 * User Profile Data Service
 */

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  condition: string;
  avatarUrl?: string;
  wheelchairId?: string;
  room: string;
  doctorNotes: string[];
  dailyGoals: string[];
  medications: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  admissionDate: string;
}

export const DEFAULT_USER_PROFILES: UserProfile[] = [
  {
    id: 'U001',
    name: 'สมชาย ใจดี',
    age: 45,
    gender: 'male',
    condition: 'ผู้ใช้วีลแชร์ จากอุบัติเหตุ',
    wheelchairId: 'W-01',
    room: 'Bedroom',
    doctorNotes: [
      '✓ ออกกำลังกายวันละ 30 นาที',
      '✓ หลีกเลี่ยงการนั่งนานเกิน 2 ชั่วโมงติดต่อกัน',
      '✓ ดื่มน้ำวันละ 2 ลิตร',
      '⚠️ ระวังการล้มหรือกระแทก',
    ],
    dailyGoals: [
      '📝 ทำงานโปรเจคให้เสร็จ',
      '💪 เล่นเกมกายภาพบำบัด 30 นาที',
      '📚 อ่านหนังสือ 1 บท',
      '☎️ โทรหาเพื่อน',
    ],
    medications: [
      '💊 ยาลดการอักเสบ 2 เม็ด หลังอาหาร',
      '💊 วิตามินบี 1 เม็ด เช้า',
    ],
    emergencyContact: {
      name: 'สมหญิง ใจดี',
      relation: 'ภรรยา',
      phone: '081-234-5678',
    },
    admissionDate: '2025-10-15',
  },
  {
    id: 'U002',
    name: 'สมหญิง รักษ์ดี',
    age: 62,
    gender: 'female',
    condition: 'โรคข้อเสื่อม',
    wheelchairId: 'W-02',
    room: 'Wards',
    doctorNotes: [
      '✓ ควรหลีกเลี่ยงการยืนนานเกินไป',
      '✓ ใช้ยาแก้ปวดตามแพทย์สั่ง',
      '✓ ฟื้นฟูกายภาพบำบัดสัปดาห์ละ 3 ครั้ง',
    ],
    dailyGoals: [
      '🧘 โยคะเบาๆ 15 นาที',
      '🎨 ทำงานฝีมือ',
      '📞 คุยกับลูก',
    ],
    medications: [
      '💊 ยาแก้ปวด 3 เม็ด หลังอาหาร',
      '💊 แคลเซียม 1 เม็ด ก่อนนอน',
    ],
    emergencyContact: {
      name: 'สมชาย รักษ์ดี',
      relation: 'ลูกชาย',
      phone: '082-345-6789',
    },
    admissionDate: '2025-11-01',
  },
];

export function getUserProfile(userId: string): UserProfile | null {
  return DEFAULT_USER_PROFILES.find((u) => u.id === userId) || null;
}

export function getAllUserProfiles(): UserProfile[] {
  return DEFAULT_USER_PROFILES;
}

