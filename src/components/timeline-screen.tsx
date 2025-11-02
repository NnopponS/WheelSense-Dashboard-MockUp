import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, Bell, CheckCircle, AlertCircle, Activity, Trash2, Download } from 'lucide-react';
import { useStore } from '../lib/store';
import { toast } from 'sonner';

const getEventIcon = (type: string) => {
  switch (type) {
    case 'device': return '🏠';
    case 'voice': return '🎤';
    case 'wheelchair': return '♿';
    case 'emergency': return '🚨';
    case 'system': return '⚙️';
    default: return '📝';
  }
};

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case 'success': return 'border-l-green-500 bg-green-50';
    case 'warning': return 'border-l-yellow-500 bg-yellow-50';
    case 'error': return 'border-l-red-500 bg-red-50';
    default: return 'border-l-blue-500 bg-blue-50';
  }
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    default: return <Bell className="h-5 w-5 text-blue-500" />;
  }
};

export function TimelineScreen() {
  const { 
    eventLogs, 
    notifications, 
    markNotificationAsRead, 
    clearNotifications, 
    clearEventLogs 
  } = useStore();
  
  const [filterType, setFilterType] = useState<'all' | 'device' | 'voice' | 'system' | 'emergency'>('all');
  const [activeTab, setActiveTab] = useState<'events' | 'notifications'>('notifications');

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (filterType === 'all') return eventLogs;
    return eventLogs.filter(log => log.type === filterType);
  }, [eventLogs, filterType]);

  // Group logs by date
  const logsByDate = useMemo(() => {
    const groups: Record<string, typeof eventLogs> = {};
    filteredLogs.forEach(log => {
      const date = log.timestamp.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  }, [filteredLogs]);

  const exportLogs = () => {
    const data = {
      exported: new Date().toISOString(),
      total: eventLogs.length,
      logs: eventLogs.map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString(),
      })),
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wheelsense-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Event logs exported successfully');
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-[#0056B3] to-[#00945E] text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Activity className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Activity Timeline</CardTitle>
                  <CardDescription className="text-white/90 text-lg mt-1">
                    ติดตามกิจกรรมและการแจ้งเตือนทั้งหมด
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                  {notifications.filter(n => !n.read).length} การแจ้งเตือนใหม่
                </Badge>
                <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                  {eventLogs.length} กิจกรรม
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="notifications" className="relative">
              <Bell className="mr-2 h-4 w-4" />
              การแจ้งเตือน
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="events">
              <Activity className="mr-2 h-4 w-4" />
              Event Logs ({eventLogs.length})
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[#0056B3]" />
                    Notifications Center
                  </CardTitle>
                  <CardDescription>ศูนย์รวมการแจ้งเตือนทั้งหมด</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearNotifications();
                    toast.success('ล้างการแจ้งเตือนทั้งหมดแล้ว');
                  }}
                  disabled={notifications.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  ล้างทั้งหมด
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
                      <p className="text-muted-foreground text-lg">ไม่มีการแจ้งเตือน</p>
                      <p className="text-sm text-muted-foreground mt-2">การแจ้งเตือนจะปรากฏที่นี่เมื่อมีเหตุการณ์สำคัญ</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <Card
                          key={notif.id}
                          className={`transition-all cursor-pointer hover:shadow-md ${
                            notif.read ? 'bg-gray-50 opacity-70' : 'bg-white shadow-sm'
                          }`}
                          onClick={() => markNotificationAsRead(notif.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-base">{notif.title}</h4>
                                  {!notif.read && (
                                    <Badge className="bg-blue-500 h-2 w-2 p-0 rounded-full" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{notif.message}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {notif.timestamp.toLocaleString('th-TH', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Logs Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#00945E]" />
                    Event Logs
                  </CardTitle>
                  <CardDescription>บันทึกกิจกรรมทั้งหมดของระบบ</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportLogs}
                    disabled={eventLogs.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearEventLogs();
                      toast.success('ล้าง Event Logs แล้ว');
                    }}
                    disabled={eventLogs.length === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    ล้างทั้งหมด
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className={filterType === 'all' ? 'bg-[#0056B3]' : ''}
                  >
                    ทั้งหมด ({eventLogs.length})
                  </Button>
                  <Button
                    variant={filterType === 'device' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('device')}
                    className={filterType === 'device' ? 'bg-[#00945E]' : ''}
                  >
                    🏠 อุปกรณ์ ({eventLogs.filter(l => l.type === 'device').length})
                  </Button>
                  <Button
                    variant={filterType === 'voice' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('voice')}
                    className={filterType === 'voice' ? 'bg-purple-600' : ''}
                  >
                    🎤 คำสั่งเสียง ({eventLogs.filter(l => l.type === 'voice').length})
                  </Button>
                  <Button
                    variant={filterType === 'wheelchair' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('wheelchair')}
                    className={filterType === 'wheelchair' ? 'bg-blue-600' : ''}
                  >
                    ♿ Wheelchair ({eventLogs.filter(l => l.type === 'wheelchair').length})
                  </Button>
                  <Button
                    variant={filterType === 'emergency' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('emergency')}
                    className={filterType === 'emergency' ? 'bg-red-600' : ''}
                  >
                    🚨 ฉุกเฉิน ({eventLogs.filter(l => l.type === 'emergency').length})
                  </Button>
                </div>

                <ScrollArea className="h-[600px] pr-4">
                  {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Activity className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
                      <p className="text-muted-foreground text-lg">ไม่มี Event Logs</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {filterType === 'all' 
                          ? 'กิจกรรมทั้งหมดจะปรากฏที่นี่' 
                          : `ไม่มีกิจกรรมประเภท ${filterType}`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(logsByDate).map(([date, logs]) => (
                        <div key={date} className="space-y-3">
                          <div className="flex items-center gap-3 sticky top-0 bg-gradient-to-br from-gray-50 to-blue-50/30 py-2 px-4 rounded-lg border-b-2 border-[#0056B3] z-10">
                            <Clock className="h-5 w-5 text-[#0056B3]" />
                            <h3 className="font-semibold text-[#0056B3]">{date}</h3>
                            <Badge variant="outline">{logs.length} กิจกรรม</Badge>
                          </div>
                          <div className="space-y-2">
                            {logs.map((log) => (
                              <Card
                                key={log.id}
                                className={`border-l-4 ${getSeverityColor(log.severity)} transition-all hover:shadow-md`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="text-2xl">{getEventIcon(log.type)}</div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {log.type}
                                          </Badge>
                                          <span className="text-sm text-muted-foreground">
                                            {log.timestamp.toLocaleTimeString('th-TH')}
                                          </span>
                                        </div>
                                        {log.severity && (
                                          <Badge
                                            className={
                                              log.severity === 'success' ? 'bg-green-500' :
                                              log.severity === 'warning' ? 'bg-yellow-500' :
                                              log.severity === 'error' ? 'bg-red-500' :
                                              'bg-blue-500'
                                            }
                                          >
                                            {log.severity}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="font-medium text-sm mb-1">{log.action}</p>
                                      <p className="text-sm text-muted-foreground">{log.details}</p>
                                      {log.room && (
                                        <div className="flex items-center gap-2 mt-2">
                                          <Badge variant="secondary" className="text-xs">
                                            📍 {log.room}
                                          </Badge>
                                          {log.deviceId && (
                                            <Badge variant="secondary" className="text-xs">
                                              🔌 {log.deviceId}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
