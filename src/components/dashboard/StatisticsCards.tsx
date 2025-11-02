import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Activity, Radio, MapPin, Zap, TrendingUp, Signal, Battery } from 'lucide-react';
import { COLORS } from '../../lib/constants';

interface StatisticsCardsProps {
  activeWheelchairs: number;
  totalWheelchairs: number;
  onlineNodes: number;
  totalNodes: number;
  totalRooms: number;
  totalBuildings: number;
  systemHealth: number;
}

export function StatisticsCards({
  activeWheelchairs,
  totalWheelchairs,
  onlineNodes,
  totalNodes,
  totalRooms,
  totalBuildings,
  systemHealth,
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Wheelchairs Card */}
      <Card className="border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-[#0056B3]" />
            </div>
            <Badge className="bg-[#0056B3] text-white">
              {activeWheelchairs}/{totalWheelchairs}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl md:text-3xl font-bold text-[#0056B3]">
            {activeWheelchairs}
          </div>
          <div className="text-sm text-muted-foreground">Active Wheelchairs</div>
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-green-600 font-medium">100%</span> operational
          </div>
        </CardContent>
      </Card>

      {/* Network Nodes Card */}
      <Card className="border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-50 rounded-lg">
              <Radio className="h-5 w-5 text-[#00945E]" />
            </div>
            <Badge className="bg-[#00945E] text-white">
              {onlineNodes}/{totalNodes}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl md:text-3xl font-bold text-[#00945E]">
            {onlineNodes}
          </div>
          <div className="text-sm text-muted-foreground">Network Nodes</div>
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Signal className="h-3 w-3 text-green-500" />
            <span className="text-green-600 font-medium">Strong</span> signal
          </div>
        </CardContent>
      </Card>

      {/* Rooms & Locations Card */}
      <Card className="border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <Badge className="bg-[#3b82f6] text-white">
              {totalRooms}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl md:text-3xl font-bold text-[#3b82f6]">
            {totalRooms}
          </div>
          <div className="text-sm text-muted-foreground">Total Rooms</div>
          <div className="text-xs text-muted-foreground mt-2">
            Across {totalBuildings} building{totalBuildings !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* System Status Card */}
      <Card className="border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Zap className="h-5 w-5 text-[#8b5cf6]" />
            </div>
            <Badge className="bg-green-500 text-white">
              Online
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl md:text-3xl font-bold text-[#8b5cf6]">
            {systemHealth}%
          </div>
          <div className="text-sm text-muted-foreground">System Health</div>
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Battery className="h-3 w-3 text-green-500" />
            All systems operational
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



