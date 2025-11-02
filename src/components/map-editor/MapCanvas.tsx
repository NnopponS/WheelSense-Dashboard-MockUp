import React, { useRef, useState } from 'react';
import { Room, Corridor, Device } from '../../lib/types';
import { RoomElement } from './RoomElement';
import { CorridorElement } from './CorridorElement';

interface MapCanvasProps {
  rooms: Room[];
  corridors: Corridor[];
  devices: Device[];
  selectedRoom: Room | null;
  selectedCorridor: Corridor | null;
  showGrid: boolean;
  showAppliances: boolean;
  showCorridors: boolean;
  corridorMode: 'none' | 'drawing';
  corridorPoints: { x: number; y: number }[];
  zoom: number;
  pan: { x: number; y: number };
  onRoomClick: (room: Room) => void;
  onRoomDrag: (roomId: string, newX: number, newY: number) => void;
  onRoomResize: (roomId: string, newWidth: number, newHeight: number) => void;
  onCorridorClick: (corridor: Corridor) => void;
  onCanvasClick: (point: { x: number; y: number }) => void;
  onPanStart: (e: React.MouseEvent) => void;
  onPanMove: (e: React.MouseEvent) => void;
  onPanEnd: () => void;
}

export function MapCanvas({
  rooms,
  corridors,
  devices,
  selectedRoom,
  selectedCorridor,
  showGrid,
  showAppliances,
  showCorridors,
  corridorMode,
  corridorPoints,
  zoom,
  pan,
  onRoomClick,
  onRoomDrag,
  onRoomResize,
  onCorridorClick,
  onCanvasClick,
  onPanStart,
  onPanMove,
  onPanEnd,
}: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const appliances = devices.filter((d) => d.type === 'appliance');
  const corridorGridSize = 40;

  const handleSvgClick = (e: React.MouseEvent) => {
    if (corridorMode === 'drawing' && svgRef.current) {
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const adjustedX = (svgP.x - pan.x) / zoom;
      const adjustedY = (svgP.y - pan.y) / zoom;

      const snappedX = Math.round(adjustedX / corridorGridSize) * corridorGridSize;
      const snappedY = Math.round(adjustedY / corridorGridSize) * corridorGridSize;

      onCanvasClick({ x: snappedX, y: snappedY });
    }
  };

  return (
    <div
      className="w-full bg-gray-50 overflow-hidden rounded-lg"
      style={{ height: 'clamp(500px, 60vh, 700px)' }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1000 600"
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          if (corridorMode !== 'drawing') {
            onPanStart(e);
          }
        }}
        onMouseMove={onPanMove}
        onMouseUp={onPanEnd}
        onMouseLeave={onPanEnd}
        onClick={handleSvgClick}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Grid */}
          {showGrid && (
            <g>
              {Array.from({ length: 50 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 20}
                  y1={0}
                  x2={i * 20}
                  y2={600}
                  stroke="#e0e0e0"
                  strokeWidth="0.5"
                />
              ))}
              {Array.from({ length: 30 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={i * 20}
                  x2={1000}
                  y2={i * 20}
                  stroke="#e0e0e0"
                  strokeWidth="0.5"
                />
              ))}
            </g>
          )}

          {/* Corridors */}
          {showCorridors &&
            corridors.map((corridor) => (
              <CorridorElement
                key={corridor.id}
                corridor={corridor}
                isSelected={selectedCorridor?.id === corridor.id}
                onClick={onCorridorClick}
              />
            ))}

          {/* Temporary corridor being drawn */}
          {corridorMode === 'drawing' && corridorPoints.length > 0 && (
            <>
              <polyline
                points={corridorPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                stroke="#0056B3"
                strokeWidth="24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="10,5"
                opacity="0.6"
              />
              {corridorPoints.map((point, idx) => (
                <circle key={idx} cx={point.x} cy={point.y} r="8" fill="#0056B3" />
              ))}
            </>
          )}

          {/* Rooms */}
          {rooms.map((room) => (
            <RoomElement
              key={room.id}
              room={room}
              isSelected={selectedRoom?.id === room.id}
              appliances={showAppliances ? appliances.filter((a) => a.room === room.name) : []}
              onClick={onRoomClick}
              onDrag={onRoomDrag}
              onResize={onRoomResize}
              disabled={corridorMode === 'drawing'}
              zoom={zoom}
              pan={pan}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}


