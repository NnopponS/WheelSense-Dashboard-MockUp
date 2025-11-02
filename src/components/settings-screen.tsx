import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { 
  Settings, 
  Database, 
  Bell, 
  Palette, 
  Globe, 
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Save
} from 'lucide-react';
import { useStore } from '../lib/store';
import { DataService } from '../lib/data-service';
import { toast } from 'sonner';

export function SettingsScreen() {
  const { 
    devices, 
    rooms, 
    buildings, 
    resetDemoData,
    clearEventLogs,
    clearNotifications,
    eventLogs,
    notifications 
  } = useStore();

  const [language, setLanguage] = useState<'th' | 'en'>('th');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('5');

  const stats = DataService.getSystemStats(devices);

  const handleResetData = () => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถยกเลิกได้')) {
      resetDemoData();
      clearEventLogs();
      clearNotifications();
      toast.success('รีเซ็ตข้อมูลทั้งหมดเรียบร้อย');
    }
  };

  const handleExportData = () => {
    const data = {
      exported: new Date().toISOString(),
      version: '1.0',
      stats,
      devices: devices.length,
      rooms: rooms.length,
      buildings: buildings.length,
      eventLogs: eventLogs.length,
      notifications: notifications.length,
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wheelsense-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('ส่งออกข้อมูลเรียบร้อย');
  };

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-[#0056B3] flex items-center justify-center">
                <Settings className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold text-[#0056B3]">Settings</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  ตั้งค่าและจัดการระบบ WheelSense
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* System Overview */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="h-5 w-5 text-[#0056B3]" />
                System Overview
              </CardTitle>
              <CardDescription>สรุปข้อมูลระบบทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg border">
                  <div className="text-xs md:text-sm text-muted-foreground">Wheelchairs</div>
                  <div className="text-xl md:text-2xl font-bold text-[#0056B3] mt-1">
                    {stats.activeWheelchairs}/{stats.totalWheelchairs}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Active/Total</div>
                </div>
                
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg border">
                  <div className="text-xs md:text-sm text-muted-foreground">Network Nodes</div>
                  <div className="text-xl md:text-2xl font-bold text-[#00945E] mt-1">
                    {stats.onlineNodes}/{stats.totalNodes}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Online/Total</div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-muted-foreground">Smart Devices</div>
                  <div className="text-2xl font-bold text-purple-600 mt-1">
                    {stats.totalAppliances}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stats.onAppliances} เปิดอยู่</div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm text-muted-foreground">System Health</div>
                  <div className="text-2xl font-bold text-orange-600 mt-1">
                    {stats.systemHealth}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Overall</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Buildings</span>
                  <span className="font-medium">{buildings.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Rooms</span>
                  <span className="font-medium">{rooms.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Event Logs</span>
                  <span className="font-medium">{eventLogs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Notifications</span>
                  <span className="font-medium">{notifications.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#00945E]" />
                Preferences
              </CardTitle>
              <CardDescription>ปรับแต่งการใช้งานของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    รับการแจ้งเตือนจากระบบ
                  </div>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh">Auto Refresh</Label>
                  <div className="text-sm text-muted-foreground">
                    อัปเดตข้อมูลอัตโนมัติ
                  </div>
                </div>
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>

              {autoRefresh && (
                <div className="space-y-2">
                  <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                  <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                    <SelectTrigger id="refresh-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="language">Language / ภาษา</Label>
                <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="th">ไทย (Thai)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Management */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Data Management
            </CardTitle>
            <CardDescription>จัดการข้อมูลและการตั้งค่า</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={handleExportData}
              >
                <Download className="h-6 w-6" />
                <span>Export Data</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => toast.info('คุณสมบัตินี้จะเปิดให้ใช้งานเร็ว ๆ นี้')}
              >
                <Upload className="h-6 w-6" />
                <span>Import Data</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => {
                  clearEventLogs();
                  toast.success('ล้าง Event Logs แล้ว');
                }}
              >
                <Trash2 className="h-6 w-6" />
                <span>Clear Logs</span>
              </Button>
              
              <Button
                variant="destructive"
                className="h-24 flex-col gap-2"
                onClick={handleResetData}
              >
                <RefreshCw className="h-6 w-6" />
                <span>Reset All Data</span>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-yellow-900">คำเตือน</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    การรีเซ็ตข้อมูลจะทำให้ข้อมูลทั้งหมดกลับไปเป็นค่าเริ่มต้น 
                    รวมถึงอุปกรณ์, ห้อง, และประวัติการใช้งานทั้งหมด
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              System Information
            </CardTitle>
            <CardDescription>ข้อมูลระบบและเวอร์ชัน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">System Name</div>
                  <div className="font-medium">WheelSense Dashboard</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Version</div>
                  <div className="font-medium">1.0.0</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Build</div>
                  <div className="font-medium font-mono text-xs">Production</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                  <div className="font-medium">{new Date().toLocaleString('th-TH')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Database Version</div>
                  <div className="font-medium">v4</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className="bg-green-500">🟢 Online</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

