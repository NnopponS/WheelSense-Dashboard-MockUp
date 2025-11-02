import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import {
  UserPlus,
  Edit,
  Trash2,
  Search,
  User,
  Calendar,
  MapPin,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
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

export function PatientManagementV2() {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'P001',
      name: 'สมชาย ใจดี',
      age: 45,
      gender: 'male',
      condition: 'อุบัติเหตุ - บาดเจ็บที่ขา',
      wheelchairId: 'W-01',
      room: 'Bedroom',
      admissionDate: '2025-10-15',
      status: 'active',
      doctorNotes: 'ฟื้นฟูสภาพดี ควรออกกำลังกายวันละ 30 นาที',
      medications: ['ยาแก้ปวด 2 เม็ด/วัน', 'วิตามินบี 1 เม็ด/เช้า'],
      emergencyContact: 'สมหญิง ใจดี (ภรรยา)',
      phone: '081-234-5678',
    },
    {
      id: 'P002',
      name: 'สมหญิง รักษ์ดี',
      age: 62,
      gender: 'female',
      condition: 'โรคข้อเสื่อม',
      wheelchairId: 'W-02',
      room: 'Wards',
      admissionDate: '2025-11-01',
      status: 'active',
      doctorNotes: 'ควรหลีกเลี่ยงการยืนนานเกินไป',
      medications: ['ยาลดการอักเสบ 3 เม็ด/วัน'],
      emergencyContact: 'สมชาย รักษ์ดี (ลูกชาย)',
      phone: '082-345-6789',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    gender: 'male',
    condition: '',
    room: 'Bedroom',
    status: 'active',
    doctorNotes: '',
    medications: [],
    emergencyContact: '',
    phone: '',
  });

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.age) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const patient: Patient = {
      id: `P${String(patients.length + 1).padStart(3, '0')}`,
      name: newPatient.name || '',
      age: newPatient.age || 0,
      gender: newPatient.gender || 'male',
      condition: newPatient.condition || '',
      room: newPatient.room || 'Bedroom',
      admissionDate: new Date().toISOString().split('T')[0],
      status: newPatient.status || 'active',
      doctorNotes: newPatient.doctorNotes || '',
      medications: newPatient.medications || [],
      emergencyContact: newPatient.emergencyContact || '',
      phone: newPatient.phone || '',
    };

    setPatients([...patients, patient]);
    setNewPatient({
      name: '',
      age: 0,
      gender: 'male',
      condition: '',
      room: 'Bedroom',
      status: 'active',
      doctorNotes: '',
      medications: [],
      emergencyContact: '',
      phone: '',
    });
    setShowAddDialog(false);
    toast.success(`เพิ่มผู้ป่วย ${patient.name} สำเร็จ`);
  };

  const handleUpdatePatient = () => {
    if (!editingPatient) return;

    setPatients(patients.map((p) => (p.id === editingPatient.id ? editingPatient : p)));
    setSelectedPatient(editingPatient);
    setEditingPatient(null);
    toast.success('อัพเดทข้อมูลสำเร็จ');
  };

  const handleDeletePatient = (patientId: string) => {
    if (window.confirm('ต้องการลบผู้ป่วยนี้?')) {
      setPatients(patients.filter((p) => p.id !== patientId));
      if (selectedPatient?.id === patientId) {
        setSelectedPatient(null);
      }
      toast.success('ลบผู้ป่วยสำเร็จ');
    }
  };

  const getStatusBadge = (status: Patient['status']) => {
    const config = {
      active: { label: 'กำลังรักษา', variant: 'default' as const, icon: Activity },
      discharged: { label: 'จำหน่ายแล้ว', variant: 'secondary' as const, icon: CheckCircle2 },
      emergency: { label: 'ฉุกเฉิน', variant: 'destructive' as const, icon: AlertCircle },
    };

    const { label, variant, icon: Icon } = config[status];

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const activePatients = patients.filter((p) => p.status === 'active').length;
  const emergencyPatients = patients.filter((p) => p.status === 'emergency').length;
  const dischargedPatients = patients.filter((p) => p.status === 'discharged').length;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg border-l-4 border-l-[#0056B3]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ผู้ป่วยทั้งหมด</p>
                <p className="text-3xl font-bold text-[#0056B3]">{patients.length}</p>
              </div>
              <User className="h-10 w-10 text-[#0056B3] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">กำลังรักษา</p>
                <p className="text-3xl font-bold text-green-600">{activePatients}</p>
              </div>
              <Activity className="h-10 w-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ฉุกเฉิน</p>
                <p className="text-3xl font-bold text-red-600">{emergencyPatients}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">จำหน่ายแล้ว</p>
                <p className="text-3xl font-bold text-gray-600">{dischargedPatients}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-gray-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Patient List */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>รายชื่อผู้ป่วย</CardTitle>
                <CardDescription>จัดการข้อมูลผู้ป่วยในระบบ</CardDescription>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#0056B3] hover:bg-[#004494]">
                    <UserPlus className="mr-2 h-4 w-4" />
                    เพิ่มผู้ป่วย
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>เพิ่มผู้ป่วยใหม่</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>ชื่อ-นามสกุล *</Label>
                        <Input
                          value={newPatient.name}
                          onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                          placeholder="เช่น สมชาย ใจดี"
                        />
                      </div>
                      <div>
                        <Label>อายุ *</Label>
                        <Input
                          type="number"
                          value={newPatient.age}
                          onChange={(e) =>
                            setNewPatient({ ...newPatient, age: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>เพศ</Label>
                        <select
                          className="w-full p-2 border rounded"
                          value={newPatient.gender}
                          onChange={(e) =>
                            setNewPatient({
                              ...newPatient,
                              gender: e.target.value as Patient['gender'],
                            })
                          }
                        >
                          <option value="male">ชาย</option>
                          <option value="female">หญิง</option>
                          <option value="other">อื่นๆ</option>
                        </select>
                      </div>
                      <div>
                        <Label>ห้อง</Label>
                        <Input
                          value={newPatient.room}
                          onChange={(e) => setNewPatient({ ...newPatient, room: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>อาการ/สภาพ</Label>
                      <Input
                        value={newPatient.condition}
                        onChange={(e) =>
                          setNewPatient({ ...newPatient, condition: e.target.value })
                        }
                        placeholder="เช่น อุบัติเหตุ - บาดเจ็บที่ขา"
                      />
                    </div>

                    <div>
                      <Label>บันทึกจากแพทย์</Label>
                      <Textarea
                        value={newPatient.doctorNotes}
                        onChange={(e) =>
                          setNewPatient({ ...newPatient, doctorNotes: e.target.value })
                        }
                        placeholder="บันทึกข้อมูลการรักษา..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>ผู้ติดต่อฉุกเฉิน</Label>
                        <Input
                          value={newPatient.emergencyContact}
                          onChange={(e) =>
                            setNewPatient({ ...newPatient, emergencyContact: e.target.value })
                          }
                          placeholder="ชื่อ-ความสัมพันธ์"
                        />
                      </div>
                      <div>
                        <Label>เบอร์โทร</Label>
                        <Input
                          value={newPatient.phone}
                          onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                          placeholder="081-234-5678"
                        />
                      </div>
                    </div>

                    <Button onClick={handleAddPatient} className="w-full bg-[#00945E] hover:bg-[#007a4d]">
                      <UserPlus className="mr-2 h-4 w-4" />
                      เพิ่มผู้ป่วย
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ค้นหาผู้ป่วย (ชื่อ, รหัส, อาการ)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <Card
                    key={patient.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPatient?.id === patient.id
                        ? 'border-2 border-[#0056B3] bg-blue-50'
                        : 'border'
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-[#0056B3]">
                          <AvatarFallback className="bg-[#0056B3] text-white font-bold">
                            {patient.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{patient.name}</h3>
                            <Badge variant="outline">{patient.id}</Badge>
                            {getStatusBadge(patient.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {patient.age} ปี • {patient.gender === 'male' ? 'ชาย' : 'หญิง'}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {patient.room}
                            </div>
                          </div>
                          <p className="text-sm mt-1">{patient.condition}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPatient(patient);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePatient(patient.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredPatients.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>ไม่พบผู้ป่วยที่ค้นหา</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Patient Details */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>รายละเอียดผู้ป่วย</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">ข้อมูล</TabsTrigger>
                  <TabsTrigger value="medical">การรักษา</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="flex flex-col items-center gap-4 pb-4 border-b">
                    <Avatar className="h-24 w-24 border-4 border-[#0056B3]">
                      <AvatarFallback className="bg-[#0056B3] text-white text-3xl font-bold">
                        {selectedPatient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedPatient.id}</p>
                      {getStatusBadge(selectedPatient.status)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">อายุ</span>
                      <span>{selectedPatient.age} ปี</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">เพศ</span>
                      <span>
                        {selectedPatient.gender === 'male'
                          ? 'ชาย'
                          : selectedPatient.gender === 'female'
                          ? 'หญิง'
                          : 'อื่นๆ'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">ห้อง</span>
                      <span>{selectedPatient.room}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">วันที่รับเข้า</span>
                      <span>{new Date(selectedPatient.admissionDate).toLocaleDateString('th-TH')}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Wheelchair</span>
                      <span>{selectedPatient.wheelchairId || 'ไม่มี'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-semibold">ผู้ติดต่อฉุกเฉิน</h4>
                    <p className="text-sm">{selectedPatient.emergencyContact}</p>
                    <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      อาการ/สภาพ
                    </h4>
                    <p className="text-sm p-3 bg-gray-50 rounded">{selectedPatient.condition}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      บันทึกจากแพทย์
                    </h4>
                    <p className="text-sm p-3 bg-blue-50 rounded border border-blue-200">
                      {selectedPatient.doctorNotes || 'ไม่มีบันทึก'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">รายการยา</h4>
                    <div className="space-y-2">
                      {selectedPatient.medications.length > 0 ? (
                        selectedPatient.medications.map((med, index) => (
                          <div
                            key={index}
                            className="p-3 bg-green-50 rounded border border-green-200 text-sm"
                          >
                            💊 {med}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">ไม่มีรายการยา</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>เลือกผู้ป่วยเพื่อดูรายละเอียด</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      {editingPatient && (
        <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>แก้ไขข้อมูลผู้ป่วย</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ชื่อ-นามสกุล</Label>
                  <Input
                    value={editingPatient.name}
                    onChange={(e) =>
                      setEditingPatient({ ...editingPatient, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>อายุ</Label>
                  <Input
                    type="number"
                    value={editingPatient.age}
                    onChange={(e) =>
                      setEditingPatient({ ...editingPatient, age: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>สถานะ</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={editingPatient.status}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        status: e.target.value as Patient['status'],
                      })
                    }
                  >
                    <option value="active">กำลังรักษา</option>
                    <option value="emergency">ฉุกเฉิน</option>
                    <option value="discharged">จำหน่ายแล้ว</option>
                  </select>
                </div>
                <div>
                  <Label>ห้อง</Label>
                  <Input
                    value={editingPatient.room}
                    onChange={(e) =>
                      setEditingPatient({ ...editingPatient, room: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>อาการ/สภาพ</Label>
                <Input
                  value={editingPatient.condition}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, condition: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>บันทึกจากแพทย์</Label>
                <Textarea
                  value={editingPatient.doctorNotes}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, doctorNotes: e.target.value })
                  }
                />
              </div>

              <Button onClick={handleUpdatePatient} className="w-full bg-[#0056B3] hover:bg-[#004494]">
                บันทึกการแก้ไข
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

