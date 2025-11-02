import React from 'react';
import { Corridor } from '../../lib/types';

interface CorridorElementProps {
  corridor: Corridor;
  isSelected: boolean;
  onClick: (corridor: Corridor) => void;
}

export function CorridorElement({ corridor, isSelected, onClick }: CorridorElementProps) {
  return (
    <g key={corridor.id}>
      <polyline
        points={corridor.points.map((p) => `${p.x},${p.y}`).join(' ')}
        stroke={corridor.color || '#93c5fd'}
        strokeWidth={corridor.width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="cursor-pointer hover:opacity-80"
        onClick={(e) => {
          e.stopPropagation();
          onClick(corridor);
        }}
      />
      {corridor.points.map((point, idx) => (
        <circle
          key={idx}
          cx={point.x}
          cy={point.y}
          r="6"
          fill={isSelected ? '#f59e0b' : '#9ca3af'}
          className="cursor-pointer"
        />
      ))}
    </g>
  );
}


