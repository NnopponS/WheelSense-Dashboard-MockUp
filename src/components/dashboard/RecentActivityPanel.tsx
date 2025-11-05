import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Activity, Clock } from 'lucide-react';
import { EventLog } from '../../lib/store';
import { COLORS } from '../../lib/constants';

interface RecentActivityPanelProps {
  eventLogs: EventLog[];
}

export function RecentActivityPanel({ eventLogs }: RecentActivityPanelProps) {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" style={{ color: COLORS.secondary }} />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </div>
          <Badge className="bg-green-500 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              Live
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {eventLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">No activity yet...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try using Demo Mode or AI Assistant
                </p>
              </div>
            ) : (
              eventLogs.slice(0, 20).map((log) => (
                <Card
                  key={log.id}
                  className={`border-l-4 ${
                    log.severity === 'success'
                      ? 'border-l-green-500 bg-green-50'
                      : log.severity === 'warning'
                      ? 'border-l-yellow-500 bg-yellow-50'
                      : log.severity === 'error'
                      ? 'border-l-red-500 bg-red-50'
                      : 'border-l-blue-500 bg-blue-50'
                  } shadow-sm hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-medium">
                          {log.type === 'device' && '🏠'}
                          {log.type === 'voice' && '🎤'}
                          {log.type === 'wheelchair' && '♿'}
                          {log.type === 'emergency' && '🚨'}
                          {log.type === 'system' && '⚙️'} {log.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.timestamp.toLocaleTimeString('th-TH')}
                        </span>
                      </div>

                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                      </div>

                      {(log.room || log.deviceId) && (
                        <div className="flex gap-2">
                          {log.room && (
                            <Badge variant="secondary" className="text-xs">
                              📍 {log.room}
                            </Badge>
                          )}
                          {log.deviceId && (
                            <Badge variant="secondary" className="text-xs">
                              🔌 {log.deviceId}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}







