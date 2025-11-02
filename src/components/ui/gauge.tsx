import { cn } from "../../lib/utils";

interface GaugeProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg" | "xl";
  showValue?: boolean;
  label?: string;
  color?: string;
  className?: string;
}

const sizeMap = {
  sm: { width: 80, height: 80, strokeWidth: 6, fontSize: "text-sm" },
  md: { width: 120, height: 120, strokeWidth: 8, fontSize: "text-base" },
  lg: { width: 160, height: 160, strokeWidth: 10, fontSize: "text-xl" },
  xl: { width: 200, height: 200, strokeWidth: 12, fontSize: "text-2xl" },
};

export function Gauge({
  value,
  max = 100,
  size = "md",
  showValue = true,
  label,
  color = "#0056B3",
  className,
}: GaugeProps) {
  const { width, height, strokeWidth, fontSize } = sizeMap[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * Math.PI * 1.5; // 270 degrees
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  // Dynamic color based on percentage
  const getColor = () => {
    if (color !== "#0056B3") return color;
    if (percentage >= 80) return "#00945E";
    if (percentage >= 50) return "#fbbf24";
    return "#dc2626";
  };

  const gaugeColor = getColor();

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="transform -rotate-[135deg]"
      >
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${height / 2}
             A ${radius} ${radius} 0 1 1 ${width - strokeWidth / 2} ${height / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value arc */}
        <path
          d={`M ${strokeWidth / 2} ${height / 2}
             A ${radius} ${radius} 0 1 1 ${width - strokeWidth / 2} ${height / 2}`}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        
        {/* Center text */}
        {showValue && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className={cn("font-bold transform rotate-[135deg]", fontSize)}
            fill="currentColor"
          >
            {Math.round(percentage)}%
          </text>
        )}
      </svg>
      {label && (
        <span className="text-sm font-medium text-muted-foreground text-center">
          {label}
        </span>
      )}
    </div>
  );
}

interface CircularGaugeProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  unit?: string;
  color?: string;
  className?: string;
}

const circularSizeMap = {
  sm: { size: 60, strokeWidth: 4, fontSize: "text-xs" },
  md: { size: 100, strokeWidth: 6, fontSize: "text-sm" },
  lg: { size: 140, strokeWidth: 8, fontSize: "text-base" },
};

export function CircularGauge({
  value,
  max = 100,
  size = "md",
  label,
  unit = "",
  color,
  className,
}: CircularGaugeProps) {
  const { size: circleSize, strokeWidth, fontSize } = circularSizeMap[size];
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const safePercentage = isNaN(percentage) || !isFinite(percentage) ? 0 : percentage;
  const offset = circumference - (safePercentage / 100) * circumference;

  // Auto color based on value
  const gaugeColor = color || (
    percentage >= 70 ? "#00945E" :
    percentage >= 40 ? "#fbbf24" :
    "#dc2626"
  );

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <svg width={circleSize} height={circleSize} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", fontSize)}>
            {Math.round(value)}
            {unit && <span className="text-muted-foreground">{unit}</span>}
          </span>
        </div>
      </div>
      
      {label && (
        <span className="text-xs font-medium text-muted-foreground text-center">
          {label}
        </span>
      )}
    </div>
  );
}

