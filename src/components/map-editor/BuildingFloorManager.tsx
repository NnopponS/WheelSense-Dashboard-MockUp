import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Building, Floor } from '../../lib/types';
import { Plus, Edit, Trash2, Building2, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface BuildingFloorManagerProps {
  buildings: Building[];
  floors: Floor[];
  onBuildingAdd: (building: Building) => void;
  onBuildingUpdate: (buildingId: string, updates: Partial<Building>) => void;
  onBuildingDelete: (buildingId: string) => void;
  onFloorAdd: (floor: Floor) => void;
  onFloorUpdate: (floorId: string, updates: Partial<Floor>) => void;
  onFloorDelete: (floorId: string) => void;
}

export function BuildingFloorManager({
  buildings,
  floors,
  onBuildingAdd,
  onBuildingUpdate,
  onBuildingDelete,
  onFloorAdd,
  onFloorUpdate,
  onFloorDelete,
}: BuildingFloorManagerProps) {
  const [showBuildingDialog, setShowBuildingDialog] = useState(false);
  const [showFloorDialog, setShowFloorDialog] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [newBuilding, setNewBuilding] = useState({ name: '' });
  const [newFloor, setNewFloor] = useState({ name: '', level: 1, buildingId: '' });

  const handleAddBuilding = () => {
    if (!newBuilding.name) {
      toast.error('กรุณากรอกชื่ออาคาร');
      return;
    }

    const building: Building = {
      id: `B${buildings.length + 1}`,
      name: newBuilding.name,
    };

    onBuildingAdd(building);
    setNewBuilding({ name: '' });
    setShowBuildingDialog(false);
    toast.success(`เพิ่มอาคาร ${building.name} สำเร็จ`);
  };

  const handleUpdateBuilding = () => {
    if (!editingBuilding) return;
    onBuildingUpdate(editingBuilding.id, { name: editingBuilding.name });
    setEditingBuilding(null);
    toast.success('แก้ไขอาคารสำเร็จ');
  };

  const handleDeleteBuilding = (buildingId: string) => {
    const buildingFloors = floors.filter((f) => f.buildingId === buildingId);
    if (buildingFloors.length > 0) {
      toast.error('ไม่สามารถลบอาคารที่มีชั้นอยู่ได้ กรุณาลบชั้นก่อน');
      return;
    }

    if (window.confirm('ต้องการลบอาคารนี้?')) {
      onBuildingDelete(buildingId);
      toast.success('ลบอาคารสำเร็จ');
    }
  };

  const handleAddFloor = () => {
    if (!newFloor.name || !newFloor.buildingId) {
      toast.error('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    const floor: Floor = {
      id: `F${floors.length + 1}`,
      name: newFloor.name,
      level: newFloor.level,
      buildingId: newFloor.buildingId,
    };

    onFloorAdd(floor);
    setNewFloor({ name: '', level: 1, buildingId: '' });
    setShowFloorDialog(false);
    toast.success(`เพิ่มชั้น ${floor.name} สำเร็จ`);
  };

  const handleUpdateFloor = () => {
    if (!editingFloor) return;
    onFloorUpdate(editingFloor.id, {
      name: editingFloor.name,
      level: editingFloor.level,
      buildingId: editingFloor.buildingId,
    });
    setEditingFloor(null);
    toast.success('แก้ไขชั้นสำเร็จ');
  };

  const handleDeleteFloor = (floorId: string) => {
    if (window.confirm('ต้องการลบชั้นนี้? ห้องทั้งหมดในชั้นนี้จะถูกลบด้วย')) {
      onFloorDelete(floorId);
      toast.success('ลบชั้นสำเร็จ');
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Buildings Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              อาคาร
            </CardTitle>
            <Dialog open={showBuildingDialog} onOpenChange={setShowBuildingDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#0056B3] h-7 px-2">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มอาคารใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>ชื่ออาคาร</Label>
                    <Input
                      value={newBuilding.name}
                      onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                      placeholder="เช่น Main Building"
                    />
                  </div>
                  <Button onClick={handleAddBuilding} className="w-full">
                    เพิ่มอาคาร
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <ScrollArea className="h-[120px]">
            <div className="space-y-1">
              {buildings.map((building) => (
                <div
                  key={building.id}
                  className="flex items-center justify-between p-1.5 rounded text-xs border hover:bg-gray-50"
                >
                  {editingBuilding?.id === building.id ? (
                    <>
                      <Input
                        value={editingBuilding.name}
                        onChange={(e) =>
                          setEditingBuilding({ ...editingBuilding, name: e.target.value })
                        }
                        className="flex-1 mr-2"
                      />
                      <Button size="sm" onClick={handleUpdateBuilding}>
                        บันทึก
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingBuilding(null)}
                      >
                        ยกเลิก
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-medium text-xs">{building.name}</span>
                      </div>
                      <div className="flex gap-0.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingBuilding(building)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-2.5 w-2.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBuilding(building.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-2.5 w-2.5 text-red-500" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Floors Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs flex items-center gap-1">
              <Layers className="h-3 w-3" />
              ชั้น
            </CardTitle>
            <Dialog open={showFloorDialog} onOpenChange={setShowFloorDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#00945E] h-7 px-2">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มชั้นใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>ชื่อชั้น</Label>
                    <Input
                      value={newFloor.name}
                      onChange={(e) => setNewFloor({ ...newFloor, name: e.target.value })}
                      placeholder="เช่น Ground Floor"
                    />
                  </div>
                  <div>
                    <Label>เลขชั้น</Label>
                    <Input
                      type="number"
                      value={newFloor.level}
                      onChange={(e) =>
                        setNewFloor({ ...newFloor, level: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>อาคาร</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newFloor.buildingId}
                      onChange={(e) => setNewFloor({ ...newFloor, buildingId: e.target.value })}
                    >
                      <option value="">เลือกอาคาร</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleAddFloor} className="w-full">
                    เพิ่มชั้น
                  </Button>
                </div>
          </DialogContent>
        </Dialog>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <ScrollArea className="h-[120px]">
            <div className="space-y-1">
              {floors.map((floor) => {
                const building = buildings.find((b) => b.id === floor.buildingId);
                return (
                  <div
                    key={floor.id}
                    className="flex items-center justify-between p-1.5 rounded text-xs border hover:bg-gray-50"
                  >
                    {editingFloor?.id === floor.id ? (
                      <>
                        <div className="flex-1 space-y-2">
                          <Input
                            value={editingFloor.name}
                            onChange={(e) =>
                              setEditingFloor({ ...editingFloor, name: e.target.value })
                            }
                            placeholder="ชื่อชั้น"
                          />
                          <Input
                            type="number"
                            value={editingFloor.level}
                            onChange={(e) =>
                              setEditingFloor({ ...editingFloor, level: Number(e.target.value) })
                            }
                            placeholder="เลขชั้น"
                          />
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button size="sm" onClick={handleUpdateFloor}>
                            บันทึก
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingFloor(null)}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="font-medium text-xs">{floor.name}</div>
                          <div className="text-[10px] text-gray-500">
                            Lv.{floor.level} • {building?.name || 'N/A'}
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingFloor(floor)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFloor(floor.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-2.5 w-2.5 text-red-500" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

