import React from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Building2, Layers, ZoomIn, ZoomOut, Grid3x3, Eye, EyeOff } from 'lucide-react';
import { Building, Floor } from '../../lib/types';

interface MapControlsProps {
  buildings: Building[];
  floors: Floor[];
  selectedBuilding: string;
  selectedFloor: string;
  zoom: number;
  showGrid: boolean;
  showAppliances: boolean;
  corridorMode: 'none' | 'drawing';
  corridorPointsCount: number;
  onBuildingChange: (buildingId: string) => void;
  onFloorChange: (floorId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleGrid: () => void;
  onToggleAppliances: () => void;
  onToggleCorridor: () => void;
}

export function MapControls({
  buildings,
  floors,
  selectedBuilding,
  selectedFloor,
  zoom,
  showGrid,
  showAppliances,
  corridorMode,
  corridorPointsCount,
  onBuildingChange,
  onFloorChange,
  onZoomIn,
  onZoomOut,
  onToggleGrid,
  onToggleAppliances,
  onToggleCorridor,
}: MapControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Building Selector */}
      <div className="flex items-center gap-2 flex-1 min-w-[180px]">
        <Building2 className="h-4 w-4 text-[#0056B3]" />
        <Select value={selectedBuilding} onValueChange={onBuildingChange}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Floor Selector */}
      <div className="flex items-center gap-2 flex-1 min-w-[150px]">
        <Layers className="h-4 w-4 text-[#00945E]" />
        <Select value={selectedFloor} onValueChange={onFloorChange}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {floors.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                Floor {f.level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Controls */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onZoomOut} className="h-9 w-9 p-0">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
        <Button size="sm" variant="outline" onClick={onZoomIn} className="h-9 w-9 p-0">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={showGrid ? 'default' : 'outline'}
          onClick={onToggleGrid}
          className="h-9"
        >
          <Grid3x3 className="h-4 w-4 mr-1" />
          Grid
        </Button>
        <Button
          size="sm"
          variant={showAppliances ? 'default' : 'outline'}
          onClick={onToggleAppliances}
          className="h-9"
        >
          {showAppliances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant={corridorMode === 'drawing' ? 'default' : 'outline'}
          onClick={onToggleCorridor}
          className={corridorMode === 'drawing' ? 'h-9 bg-[#0056B3]' : 'h-9'}
        >
          {corridorMode === 'drawing' ? `✓ บันทึก (${corridorPointsCount})` : '🛤️ เส้นทาง'}
        </Button>
      </div>
    </div>
  );
}


