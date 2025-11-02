import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Room } from '../../lib/types';
import { Plus, Home } from 'lucide-react';
import { toast } from 'sonner';

interface RoomCreatorProps {
  floorId: string;
  onRoomCreate: (room: Room) => void;
}

export function RoomCreator({ floorId, onRoomCreate }: RoomCreatorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    color: '#f5f5f5',
  });

  const handleCreateRoom = () => {
    if (!newRoom.name) {
      toast.error('กรุณากรอกชื่อห้อง');
      return;
    }

    const room: Room = {
      id: `room-${Date.now()}`,
      name: newRoom.name,
      x: newRoom.x,
      y: newRoom.y,
      width: newRoom.width,
      height: newRoom.height,
      color: newRoom.color,
      floorId: floorId,
    };

    onRoomCreate(room);
    setNewRoom({
      name: '',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      color: '#f5f5f5',
    });
    setShowDialog(false);
    toast.success(`สร้างห้อง ${room.name} สำเร็จ`);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="w-full bg-[#0056B3] hover:bg-[#004494]">
          <Plus className="mr-2 h-4 w-4" />
          สร้างห้องใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            สร้างห้องใหม่
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>ชื่อห้อง *</Label>
            <Input
              value={newRoom.name}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              placeholder="เช่น Living Room"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>ตำแหน่ง X</Label>
              <Input
                type="number"
                value={newRoom.x}
                onChange={(e) => setNewRoom({ ...newRoom, x: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>ตำแหน่ง Y</Label>
              <Input
                type="number"
                value={newRoom.y}
                onChange={(e) => setNewRoom({ ...newRoom, y: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>ความกว้าง</Label>
              <Input
                type="number"
                value={newRoom.width}
                onChange={(e) => setNewRoom({ ...newRoom, width: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>ความสูง</Label>
              <Input
                type="number"
                value={newRoom.height}
                onChange={(e) => setNewRoom({ ...newRoom, height: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label>สีพื้นหลัง</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={newRoom.color}
                onChange={(e) => setNewRoom({ ...newRoom, color: e.target.value })}
                className="h-10 w-20"
              />
              <Input
                type="text"
                value={newRoom.color}
                onChange={(e) => setNewRoom({ ...newRoom, color: e.target.value })}
                placeholder="#f5f5f5"
                className="flex-1"
              />
            </div>
          </div>

          <Button onClick={handleCreateRoom} className="w-full bg-[#00945E] hover:bg-[#007a4d]">
            <Plus className="mr-2 h-4 w-4" />
            สร้างห้อง
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

