import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Plus, Edit, Trash2, Activity, MapPin, Search, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';

interface Patient {
  id: string;
  name: string;
  nameEn?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  wheelchairId?: string;
  destination?: string;
  currentLocation?: string;
  status: 'active' | 'inactive' | 'on_route' | 'arrived';
  notes?: string;
}

export function PatientManagement() {
  const { devices, rooms, floors, buildings } = useStore();
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'P-001',
      name: 'คุณสมชาย จิตรดี',
      nameEn: 'Somchai Jitdee',
      age: 65,
      gender: 'male',
      wheelchairId: 'W-01',
      destination: 'คลินิกเวชกรรม',
      currentLocation: 'ล็อบบี้',
      status: 'on_route',
      notes: 'ต้องการการดูแลพิเศษ'
    },
    {
      id: 'P-002',
      name: 'คุณสุดา มีชัย',
      nameEn: 'Suda Meechai',
      age: 58,
      gender: 'female',
      wheelchairId: 'W-02',
      destination: 'กายภาพบำบัด',
      currentLocation: 'ห้องพักรอ',
      status: 'active',
    },
  ]);

  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    nameEn: '',
    age: undefined,
    gender: 'male',
    wheelchairId: '',
    status: 'active',
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const wheelchairs = devices.filter(d => d.type === 'wheelchair');
  const availableWheelchairs = wheelchairs.filter(w => !patients.some(p => p.wheelchairId === w.id));

  const handleAddPatient = () => {
    if (!newPatient.name) {
      toast.error('กรุณากรอกชื่อผู้ป่วย');
      return;
    }

    const patient: Patient = {
      id: `P-${String(patients.length + 1).padStart(3, '0')}`,
      name: newPatient.name || '',
      nameEn: newPatient.nameEn,
      age: newPatient.age,
      gender: newPatient.gender || 'male',
      wheelchairId: newPatient.wheelchairId,
      destination: newPatient.destination,
      currentLocation: newPatient.currentLocation,
      status: newPatient.status || 'active',
      notes: newPatient.notes,
    };

    setPatients([...patients, patient]);
    setNewPatient({
      name: '',
      nameEn: '',
      age: undefined,
      gender: 'male',
      wheelchairId: '',
      status: 'active',
    });
    setShowAddDialog(false);
    toast.success(`เพิ่มผู้ป่วย ${patient.name} สำเร็จ`);
  };

  const handleUpdatePatient = () => {
    if (!editingPatient) return;

    setPatients(patients.map(p => p.id === editingPatient.id ? editingPatient : p));
    setEditingPatient(null);
    toast.success(`อัพเดตข้อมูลผู้ป่วยสำเร็จ`);
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter(p => p.id !== patientId));
    toast.success('ลบข้อมูลผู้ป่วยสำเร็จ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[#00945E]';
      case 'on_route': return 'bg-[#0056B3]';
      case 'arrived': return 'bg-[#10b981]';
      case 'inactive': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'พร้อมใช้งาน';
      case 'on_route': return 'กำลังเดินทาง';
      case 'arrived': return 'ถึงจุดหมายแล้ว';
      case 'inactive': return 'ไม่ใช้งาน';
      default: return 'Unknown';
    }
  };

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Export patients data
  const handleExportPatients = () => {
    const dataStr = JSON.stringify(patients, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patients-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('ส่งออกข้อมูลผู้ป่วยสำเร็จ!');
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-gray-50 to-blue-50/20">
      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="english-text font-bold text-[#0056B3] text-xl md:text-2xl flex items-center gap-2">
              <User className="h-7 w-7" />
              Patient Management
            </h2>
            <p className="thai-text text-muted-foreground text-sm md:text-base">
              จัดการข้อมูลผู้ป่วยและมอบหมายรถเข็น
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportPatients}
              className="hover:bg-blue-50 hover:border-[#0056B3]"
            >
              <Download className="mr-2 h-4 w-4" />
              ส่งออกข้อมูล
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-[#0056B3] hover:bg-[#004494] text-white shadow-md hover:shadow-lg transition-all h-10 md:h-11"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่มผู้ป่วย
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle style={{fontSize: 'var(--font-size-xl)'}}>เพิ่มผู้ป่วยใหม่</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ชื่อ-นามสกุล (ไทย) *</Label>
                    <Input
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      placeholder="เช่น คุณสมชาย จิตรดี"
                    />
                  </div>
                  <div>
                    <Label>Name (English)</Label>
                    <Input
                      value={newPatient.nameEn}
                      onChange={(e) => setNewPatient({ ...newPatient, nameEn: e.target.value })}
                      placeholder="e.g., Somchai Jitdee"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>อายุ</Label>
                    <Input
                      type="number"
                      value={newPatient.age || ''}
                      onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
                      placeholder="เช่น 65"
                    />
                  </div>
                  <div>
                    <Label>เพศ</Label>
                    <Select value={newPatient.gender} onValueChange={(value: any) => setNewPatient({ ...newPatient, gender: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ชาย</SelectItem>
                        <SelectItem value="female">หญิง</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>เลือกรถเข็น</Label>
                  <Select value={newPatient.wheelchairId} onValueChange={(value) => setNewPatient({ ...newPatient, wheelchairId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกรถเข็นที่ว่าง..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWheelchairs.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          ♿ {w.name} ({w.id}) - {w.room || 'No location'}
                        </SelectItem>
                      ))}
                      {availableWheelchairs.length === 0 && (
                        <SelectItem value="none" disabled>ไม่มีรถเข็นว่าง</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ปลายทาง</Label>
                    <Input
                      value={newPatient.destination}
                      onChange={(e) => setNewPatient({ ...newPatient, destination: e.target.value })}
                      placeholder="เช่น คลินิกเวชกรรม"
                    />
                  </div>
                  <div>
                    <Label>ตำแหน่งปัจจุบัน</Label>
                    <Input
                      value={newPatient.currentLocation}
                      onChange={(e) => setNewPatient({ ...newPatient, currentLocation: e.target.value })}
                      placeholder="เช่น ล็อบบี้"
                    />
                  </div>
                </div>

                <div>
                  <Label>หมายเหตุ</Label>
                  <Input
                    value={newPatient.notes}
                    onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                    placeholder="หมายเหตุเพิ่มเติม"
                  />
                </div>

                <Button onClick={handleAddPatient} className="w-full bg-[#00945E] hover:bg-[#007a4d]">
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่มผู้ป่วย
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6 border-2 border-blue-100 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาผู้ป่วย (ชื่อ, ID)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 h-10">
                    <SelectValue placeholder="กรองตามสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="active">พร้อมใช้งาน</SelectItem>
                    <SelectItem value="on_route">กำลังเดินทาง</SelectItem>
                    <SelectItem value="arrived">ถึงจุดหมาย</SelectItem>
                    <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(searchQuery || statusFilter !== 'all') && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <span>ผลการค้นหา: <strong className="text-[#0056B3]">{filteredPatients.length}</strong> รายการ</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="h-7 text-xs"
                >
                  ล้างการค้นหา
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid-responsive-sm mb-[var(--spacing-lg)]">
          <Card className="border-l-4 border-l-[#00945E] shadow-md hover:shadow-lg transition-shadow">
            <CardContent style={{padding: 'var(--spacing-md)'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground" style={{fontSize: 'var(--font-size-sm)'}}>จำนวนผู้ป่วยทั้งหมด</p>
                  <p className="font-bold text-[#0056B3]" style={{fontSize: 'var(--font-size-2xl)'}}>{patients.length}</p>
                </div>
                <User className="text-[#00945E]" style={{width: 'clamp(2rem, 3vw, 3rem)', height: 'clamp(2rem, 3vw, 3rem)'}} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#0056B3] shadow-md hover:shadow-lg transition-shadow">
            <CardContent style={{padding: 'var(--spacing-md)'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground" style={{fontSize: 'var(--font-size-sm)'}}>กำลังใช้รถเข็น</p>
                  <p className="font-bold text-[#0056B3]" style={{fontSize: 'var(--font-size-2xl)'}}>
                    {patients.filter(p => p.wheelchairId).length}
                  </p>
                </div>
                <Activity className="text-[#0056B3]" style={{width: 'clamp(2rem, 3vw, 3rem)', height: 'clamp(2rem, 3vw, 3rem)'}} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#10b981] shadow-md hover:shadow-lg transition-shadow">
            <CardContent style={{padding: 'var(--spacing-md)'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground" style={{fontSize: 'var(--font-size-sm)'}}>รถเข็นว่าง</p>
                  <p className="font-bold text-[#10b981]" style={{fontSize: 'var(--font-size-2xl)'}}>
                    {availableWheelchairs.length}
                  </p>
                </div>
                <span style={{fontSize: 'clamp(2rem, 3vw, 3rem)'}}>♿</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <Card className="shadow-xl border-2 border-blue-200">
          <CardHeader style={{padding: 'var(--spacing-lg)'}}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <User style={{width: 'var(--font-size-xl)', height: 'var(--font-size-xl)'}} />
                <span style={{fontSize: 'var(--font-size-xl)'}}>รายชื่อผู้ป่วย</span>
              </CardTitle>
              <Badge variant="outline" className="text-base px-3 py-1">
                {filteredPatients.length} / {patients.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent style={{padding: 'var(--spacing-md)'}}>
            <ScrollArea className="h-[calc(100vh-550px)] min-h-[400px]">
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <Card 
                    key={patient.id} 
                    className="border-l-4 border-l-[#0056B3] hover:shadow-lg transition-all duration-200 hover:scale-[1.01] bg-gradient-to-r from-white to-blue-50/30"
                  >
                    <CardContent style={{padding: 'var(--spacing-md)'}}>
                      {editingPatient?.id === patient.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>ชื่อ-นามสกุล (ไทย)</Label>
                              <Input
                                value={editingPatient.name}
                                onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Name (English)</Label>
                              <Input
                                value={editingPatient.nameEn}
                                onChange={(e) => setEditingPatient({ ...editingPatient, nameEn: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>อายุ</Label>
                              <Input
                                type="number"
                                value={editingPatient.age || ''}
                                onChange={(e) => setEditingPatient({ ...editingPatient, age: Number(e.target.value) })}
                              />
                            </div>
                            <div>
                              <Label>เพศ</Label>
                              <Select value={editingPatient.gender} onValueChange={(value: any) => setEditingPatient({ ...editingPatient, gender: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">ชาย</SelectItem>
                                  <SelectItem value="female">หญิง</SelectItem>
                                  <SelectItem value="other">อื่นๆ</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>รถเข็น</Label>
                            <Select 
                              value={editingPatient.wheelchairId} 
                              onValueChange={(value) => setEditingPatient({ ...editingPatient, wheelchairId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกรถเข็น..." />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Current wheelchair */}
                                {patient.wheelchairId && (
                                  <SelectItem value={patient.wheelchairId}>
                                    ♿ {wheelchairs.find(w => w.id === patient.wheelchairId)?.name} (Current)
                                  </SelectItem>
                                )}
                                {/* Available wheelchairs */}
                                {availableWheelchairs.map((w) => (
                                  <SelectItem key={w.id} value={w.id}>
                                    ♿ {w.name} ({w.id})
                                  </SelectItem>
                                ))}
                                <SelectItem value="unassigned">ไม่ระบุ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>ปลายทาง</Label>
                              <Input
                                value={editingPatient.destination}
                                onChange={(e) => setEditingPatient({ ...editingPatient, destination: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>ตำแหน่งปัจจุบัน</Label>
                              <Input
                                value={editingPatient.currentLocation}
                                onChange={(e) => setEditingPatient({ ...editingPatient, currentLocation: e.target.value })}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>หมายเหตุ</Label>
                            <Input
                              value={editingPatient.notes}
                              onChange={(e) => setEditingPatient({ ...editingPatient, notes: e.target.value })}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleUpdatePatient} className="flex-1 bg-[#00945E]">
                              บันทึก
                            </Button>
                            <Button onClick={() => setEditingPatient(null)} variant="outline" className="flex-1">
                              ยกเลิก
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0056B3] flex items-center justify-center shadow-md">
                                <span className="text-white text-xl md:text-2xl font-bold">
                                  {patient.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-bold" style={{fontSize: 'var(--font-size-lg)'}}>
                                  {patient.name}
                                </h3>
                                {patient.nameEn && (
                                  <p className="english-text text-muted-foreground" style={{fontSize: 'var(--font-size-sm)'}}>
                                    {patient.nameEn}
                                  </p>
                                )}
                                <Badge className={getStatusColor(patient.status) + ' text-white mt-1'}>
                                  {getStatusText(patient.status)}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground font-medium">ID:</span>
                                <Badge variant="outline">{patient.id}</Badge>
                              </div>
                              {patient.age && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground font-medium">อายุ:</span>
                                  <span>{patient.age} ปี</span>
                                </div>
                              )}
                              {patient.gender && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground font-medium">เพศ:</span>
                                  <span>{patient.gender === 'male' ? 'ชาย' : patient.gender === 'female' ? 'หญิง' : 'อื่นๆ'}</span>
                                </div>
                              )}
                              {patient.wheelchairId && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground font-medium">รถเข็น:</span>
                                  <Badge className="bg-[#00945E] text-white">
                                    ♿ {patient.wheelchairId}
                                  </Badge>
                                </div>
                              )}
                              {patient.destination && (
                                <div className="flex items-center gap-2 col-span-2">
                                  <MapPin className="h-4 w-4 text-[#0056B3]" />
                                  <span className="text-muted-foreground font-medium">ปลายทาง:</span>
                                  <span className="font-semibold text-[#0056B3]">{patient.destination}</span>
                                </div>
                              )}
                              {patient.currentLocation && (
                                <div className="flex items-center gap-2 col-span-2">
                                  <Activity className="h-4 w-4 text-[#00945E]" />
                                  <span className="text-muted-foreground font-medium">ตำแหน่ง:</span>
                                  <span>{patient.currentLocation}</span>
                                </div>
                              )}
                              {patient.notes && (
                                <div className="col-span-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                  <p className="text-xs text-yellow-800">📝 {patient.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setEditingPatient(patient)}
                              className="hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {filteredPatients.length === 0 && patients.length > 0 && (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="py-12 text-center">
                      <Search className="mx-auto mb-4 text-gray-400" style={{width: '3rem', height: '3rem'}} />
                      <p className="text-muted-foreground" style={{fontSize: 'var(--font-size-lg)'}}>
                        ไม่พบผู้ป่วยที่ตรงกับเงื่อนไขการค้นหา
                      </p>
                      <p className="text-muted-foreground text-sm mt-2">
                        ลองเปลี่ยนคำค้นหาหรือกรองใหม่
                      </p>
                    </CardContent>
                  </Card>
                )}

                {patients.length === 0 && (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="py-12 text-center">
                      <User className="mx-auto mb-4 text-gray-400" style={{width: '4rem', height: '4rem'}} />
                      <p className="text-muted-foreground" style={{fontSize: 'var(--font-size-lg)'}}>
                        ยังไม่มีข้อมูลผู้ป่วย
                      </p>
                      <p className="text-muted-foreground text-sm mt-2">
                        กดปุ่ม "Add Patient" เพื่อเพิ่มผู้ป่วยใหม่
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

