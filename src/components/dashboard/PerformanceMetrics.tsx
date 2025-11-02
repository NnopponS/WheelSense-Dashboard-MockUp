import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { CircularGauge } from '../ui/gauge';
import { TrendingUp } from 'lucide-react';
import { COLORS } from '../../lib/constants';

interface PerformanceMetricsProps {
  systemHealth: number;
  wheelchairUtilization: number;
  signalStrength: number;
  networkUptime: number;
}

export function PerformanceMetrics({
  systemHealth,
  wheelchairUtilization,
  signalStrength,
  networkUptime,
}: PerformanceMetricsProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-[#0056B3]" />
          Performance Metrics
        </CardTitle>
        <CardDescription>Real-time system performance indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-3 md:p-4 bg-gray-50 rounded-lg border">
            <CircularGauge
              value={systemHealth}
              label="System Health"
              unit="%"
              size="md"
              color={COLORS.primary}
            />
          </div>

          <div className="flex flex-col items-center p-3 md:p-4 bg-gray-50 rounded-lg border">
            <CircularGauge
              value={wheelchairUtilization}
              label="Wheelchair Usage"
              unit="%"
              size="md"
              color={COLORS.secondary}
            />
          </div>

          <div className="flex flex-col items-center p-3 md:p-4 bg-gray-50 rounded-lg border">
            <CircularGauge
              value={signalStrength}
              max={100}
              label="Signal Strength"
              size="md"
              color={COLORS.purple}
            />
          </div>

          <div className="flex flex-col items-center p-3 md:p-4 bg-gray-50 rounded-lg border">
            <CircularGauge
              value={networkUptime}
              label="Network Uptime"
              unit="%"
              size="md"
              color={COLORS.warning}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



