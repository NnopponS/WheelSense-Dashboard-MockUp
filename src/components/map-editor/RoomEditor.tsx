import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { X, Save, Trash2 } from 'lucide-react';
import { Room, Corridor } from '../../lib/types';

interface RoomEditorProps {
  room: Room | null;
  editingRoom: Room | null;
  corridor: Corridor | null;
  onRoomChange: (room: Room) => void;
  onRoomSave: () => void;
  onRoomDelete?: () => void;
  onCorridorDelete: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export function RoomEditor({
  room,
  editingRoom,
  corridor,
  onRoomChange,
  onRoomSave,
  onRoomDelete,
  onCorridorDelete,
  onClose,
  children,
}: RoomEditorProps) {
  if (corridor) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">🛤️ เส้นทาง</CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{corridor.name}</h4>
              <Badge variant="outline">{corridor.id}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">จำนวนจุด:</span>
                <span>{corridor.points.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ความกว้าง:</span>
                <span>{corridor.width}px</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">สี:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: corridor.color }}
                  />
                  <span>{corridor.color}</span>
                </div>
              </div>
            </div>
            <Button onClick={onCorridorDelete} variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              ลบเส้นทาง
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (room && editingRoom) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">🏠 แก้ไข Room</CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div>
              <Label>ชื่อห้อง</Label>
              <Input
                value={editingRoom.name}
                onChange={(e) => onRoomChange({ ...editingRoom, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>X</Label>
                <Input
                  type="number"
                  value={editingRoom.x}
                  onChange={(e) => onRoomChange({ ...editingRoom, x: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Y</Label>
                <Input
                  type="number"
                  value={editingRoom.y}
                  onChange={(e) => onRoomChange({ ...editingRoom, y: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Width</Label>
                <Input
                  type="number"
                  value={editingRoom.width}
                  onChange={(e) => onRoomChange({ ...editingRoom, width: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  value={editingRoom.height}
                  onChange={(e) => onRoomChange({ ...editingRoom, height: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>สี</Label>
              <Input
                type="color"
                value={editingRoom.color || '#f5f5f5'}
                onChange={(e) => onRoomChange({ ...editingRoom, color: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Button onClick={onRoomSave} className="w-full bg-[#0056B3] hover:bg-[#004494]">
                <Save className="mr-2 h-4 w-4" />
                บันทึก
              </Button>
              {onRoomDelete && (
                <Button onClick={onRoomDelete} variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  ลบห้อง
                </Button>
              )}
            </div>
          </div>
          {children}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">เลือก Room</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>คลิกที่ห้องในแผนที่เพื่อแก้ไข</p>
        </div>
      </CardContent>
    </Card>
  );
}


