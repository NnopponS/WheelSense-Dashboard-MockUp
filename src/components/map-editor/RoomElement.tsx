import React, { useState, useRef } from 'react';
import { Room, Device } from '../../lib/types';

interface RoomElementProps {
  room: Room;
  isSelected: boolean;
  appliances: Device[];
  onClick: (room: Room) => void;
  onDrag: (roomId: string, newX: number, newY: number) => void;
  onResize: (roomId: string, newWidth: number, newHeight: number) => void;
  disabled?: boolean;
  zoom: number;
  pan: { x: number; y: number };
}

export function RoomElement({
  room,
  isSelected,
  appliances,
  onClick,
  onDrag,
  onResize,
  disabled,
  zoom,
  pan,
}: RoomElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'br' | 'tr' | 'bl' | 'r' | 'b' | null>(null);
  
  // Local state for smooth resize (don't update store during drag)
  const [tempWidth, setTempWidth] = useState<number | null>(null);
  const [tempHeight, setTempHeight] = useState<number | null>(null);
  
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const resizeStartRef = useRef<{ 
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    mouseX: number; 
    mouseY: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent<SVGGElement>) => {
    if (disabled || !isSelected || isResizing) return;
    
    e.stopPropagation();
    setIsDragging(true);
    
    const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    dragStartRef.current = {
      x: svgP.x - room.x,
      y: svgP.y - room.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGGElement>) => {
    // Handle dragging
    if (isDragging && dragStartRef.current) {
      e.stopPropagation();
      
      const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
      if (!svg) return;
      
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      
      const newX = Math.round((svgP.x - dragStartRef.current.x) / 20) * 20;
      const newY = Math.round((svgP.y - dragStartRef.current.y) / 20) * 20;
      
      onDrag(room.id, newX, newY);
      return;
    }
    
    // Handle resizing - Update TEMP state only (ไม่เซฟระหว่างลาก)
    if (isResizing && resizeStartRef.current && resizeHandle) {
      e.stopPropagation();
      
      const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
      if (!svg) return;
      
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      
      const deltaX = svgP.x - resizeStartRef.current.mouseX;
      const deltaY = svgP.y - resizeStartRef.current.mouseY;
      
      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;
      
      // Calculate based on which handle is being dragged
      switch (resizeHandle) {
        case 'br': // Bottom-right
          newWidth = resizeStartRef.current.width + deltaX;
          newHeight = resizeStartRef.current.height + deltaY;
          break;
        case 'r': // Right only
          newWidth = resizeStartRef.current.width + deltaX;
          break;
        case 'b': // Bottom only
          newHeight = resizeStartRef.current.height + deltaY;
          break;
        case 'tr': // Top-right
          newWidth = resizeStartRef.current.width + deltaX;
          newHeight = resizeStartRef.current.height - deltaY;
          break;
        case 'bl': // Bottom-left
          newWidth = resizeStartRef.current.width - deltaX;
          newHeight = resizeStartRef.current.height + deltaY;
          break;
      }
      
      // Apply minimum size
      newWidth = Math.max(60, newWidth);
      newHeight = Math.max(40, newHeight);
      
      // Update LOCAL state only (NOT store) - SMOOTH!
      setTempWidth(newWidth);
      setTempHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    // Save to store ONLY when mouse up (ปิด auto-save ระหว่างลาก)
    if (isResizing && (tempWidth !== null || tempHeight !== null)) {
      const finalWidth = tempWidth !== null ? tempWidth : room.width;
      const finalHeight = tempHeight !== null ? tempHeight : room.height;
      
      // Snap to grid for final position
      const snappedWidth = Math.max(60, Math.round(finalWidth / 20) * 20);
      const snappedHeight = Math.max(40, Math.round(finalHeight / 20) * 20);
      
      // NOW save to store (เซฟตอนปรับ size เสร็จ)
      onResize(room.id, snappedWidth, snappedHeight);
      
      // Clear temp state
      setTempWidth(null);
      setTempHeight(null);
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    dragStartRef.current = null;
    resizeStartRef.current = null;
  };

  const handleResizeStart = (e: React.MouseEvent<SVGCircleElement>, handle: 'br' | 'tr' | 'bl' | 'r' | 'b') => {
    if (disabled || !isSelected) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    
    const svg = (e.currentTarget as SVGCircleElement).ownerSVGElement;
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    resizeStartRef.current = {
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height,
      mouseX: svgP.x,
      mouseY: svgP.y,
    };
  };

  const handleResizeMove = (e: React.MouseEvent<SVGGElement>) => {
    if (!isResizing || !resizeStartRef.current || !resizeHandle) return;
    
    e.stopPropagation();
    
    const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    const deltaX = svgP.x - resizeStartRef.current.mouseX;
    const deltaY = svgP.y - resizeStartRef.current.mouseY;
    
    let newWidth = resizeStartRef.current.width;
    let newHeight = resizeStartRef.current.height;
    
    // Calculate based on which handle is being dragged
    switch (resizeHandle) {
      case 'br': // Bottom-right: both width and height
        newWidth = resizeStartRef.current.width + deltaX;
        newHeight = resizeStartRef.current.height + deltaY;
        break;
      case 'r': // Right: width only
        newWidth = resizeStartRef.current.width + deltaX;
        break;
      case 'b': // Bottom: height only
        newHeight = resizeStartRef.current.height + deltaY;
        break;
      case 'tr': // Top-right: width increase, height from top
        newWidth = resizeStartRef.current.width + deltaX;
        newHeight = resizeStartRef.current.height - deltaY;
        break;
      case 'bl': // Bottom-left: width from left, height increase
        newWidth = resizeStartRef.current.width - deltaX;
        newHeight = resizeStartRef.current.height + deltaY;
        break;
    }
    
    // Apply minimum size and snap to grid
    newWidth = Math.max(60, Math.round(newWidth / 20) * 20);
    newHeight = Math.max(40, Math.round(newHeight / 20) * 20);
    
    onResize(room.id, newWidth, newHeight);
  };

  return (
    <g
      onClick={(e) => {
        if (!disabled && !isDragging && !isResizing) {
          e.stopPropagation();
          onClick(room);
        }
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => {
        handleMouseMove(e);
        handleResizeMove(e);
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={disabled ? '' : isSelected ? (isResizing ? 'cursor-nwse-resize' : 'cursor-move') : 'cursor-pointer'}
    >
      <rect
        x={room.x}
        y={room.y}
        width={tempWidth !== null ? tempWidth : room.width}
        height={tempHeight !== null ? tempHeight : room.height}
        fill={isSelected ? '#e8f4ff' : room.color || '#f5f5f5'}
        stroke={isSelected ? '#0056B3' : '#d0d0d0'}
        strokeWidth={isSelected ? 3 : 1}
        rx="4"
      />
      <text
        x={room.x + (tempWidth !== null ? tempWidth : room.width) / 2}
        y={room.y + (tempHeight !== null ? tempHeight : room.height) / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="600"
        fill="#333"
        pointerEvents="none"
      >
        {room.name}
      </text>

      {/* Appliances in room */}
      {appliances.map((app, idx) => (
        <g key={app.id} pointerEvents="none">
          <circle
            cx={room.x + 20}
            cy={room.y + 20 + idx * 25}
            r="8"
            fill={app.status === 'online' ? '#00945E' : '#6b7280'}
          />
          <text x={room.x + 35} y={room.y + 23 + idx * 25} fontSize="11" fill="#666">
            {app.name}
          </text>
        </g>
      ))}

      {/* Resize Handles - Show only when selected - Use temp size for smooth rendering */}
      {isSelected && !disabled && (
        <>
          {/* Bottom-right resize handle - MAIN */}
          <circle
            cx={room.x + (tempWidth !== null ? tempWidth : room.width)}
            cy={room.y + (tempHeight !== null ? tempHeight : room.height)}
            r="8"
            fill="#0056B3"
            stroke="white"
            strokeWidth="2"
            className="cursor-nwse-resize"
            onMouseDown={(e) => handleResizeStart(e, 'br')}
            style={{ cursor: 'nwse-resize' }}
          />
          {/* Top-right resize handle */}
          <circle
            cx={room.x + (tempWidth !== null ? tempWidth : room.width)}
            cy={room.y}
            r="6"
            fill="#00945E"
            stroke="white"
            strokeWidth="2"
            className="cursor-nesw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'tr')}
            style={{ cursor: 'nesw-resize' }}
          />
          {/* Bottom-left resize handle */}
          <circle
            cx={room.x}
            cy={room.y + (tempHeight !== null ? tempHeight : room.height)}
            r="6"
            fill="#00945E"
            stroke="white"
            strokeWidth="2"
            className="cursor-nesw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'bl')}
            style={{ cursor: 'nesw-resize' }}
          />
          {/* Center-right resize handle (width only) */}
          <circle
            cx={room.x + (tempWidth !== null ? tempWidth : room.width)}
            cy={room.y + (tempHeight !== null ? tempHeight : room.height) / 2}
            r="5"
            fill="#f59e0b"
            stroke="white"
            strokeWidth="2"
            className="cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, 'r')}
            style={{ cursor: 'ew-resize' }}
          />
          {/* Center-bottom resize handle (height only) */}
          <circle
            cx={room.x + (tempWidth !== null ? tempWidth : room.width) / 2}
            cy={room.y + (tempHeight !== null ? tempHeight : room.height)}
            r="5"
            fill="#f59e0b"
            stroke="white"
            strokeWidth="2"
            className="cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, 'b')}
            style={{ cursor: 'ns-resize' }}
          />
        </>
      )}
    </g>
  );
}


