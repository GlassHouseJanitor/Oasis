import { useState, useEffect } from "react";
import { useBeds } from "@/hooks/use-beds";
import { useResidents } from "@/hooks/use-residents";
import { useHouses } from "@/hooks/use-houses";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { House, Room, BedWithRoom } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Filter } from "lucide-react";

interface HouseVisualizationProps {
  onBedSelect?: (bed: BedWithRoom) => void;
}

export default function HouseVisualization({ onBedSelect }: HouseVisualizationProps) {
  const { houses } = useHouses();
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const { bedsWithRooms, isLoading } = useBeds(selectedHouseId);
  const { toast } = useToast();
  
  // Set default house when houses load
  useEffect(() => {
    if (houses && houses.length > 0 && !selectedHouseId) {
      setSelectedHouseId(houses[0].id);
    }
  }, [houses, selectedHouseId]);
  
  const handleBedClick = (bed: BedWithRoom) => {
    if (onBedSelect) {
      onBedSelect(bed);
    }
  };
  
  // Group beds by room
  const bedsByRoom: Record<number, { room: Room; beds: BedWithRoom[] }> = {};
  if (bedsWithRooms) {
    bedsWithRooms.forEach(bed => {
      if (!bedsByRoom[bed.room.id]) {
        bedsByRoom[bed.room.id] = { room: bed.room, beds: [] };
      }
      bedsByRoom[bed.room.id].beds.push(bed);
    });
  }
  
  const statusColorClasses = {
    available: "fill-[#2A9D8F] fill-opacity-30 hover:fill-opacity-50",
    occupied: "fill-[#F4A261] fill-opacity-60 hover:fill-opacity-80",
    maintenance: "fill-[#E9C46A] fill-opacity-50 hover:fill-opacity-70"
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-montserrat text-[#264653]">
          {houses?.find(h => h.id === selectedHouseId)?.name || "House Layout"}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Select 
            value={selectedHouseId?.toString() || ""} 
            onValueChange={(value) => setSelectedHouseId(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select House" />
            </SelectTrigger>
            <SelectContent>
              {houses?.map(house => (
                <SelectItem key={house.id} value={house.id.toString()}>
                  {house.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* House Map */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* House Visualization */}
            <div className="col-span-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-md font-montserrat font-semibold mb-3 text-gray-700">House Layout</h3>
              
              {/* House SVG Representation */}
              <div className="relative h-96 border border-gray-200 rounded bg-white p-2" id="house-layout">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading house layout...</p>
                  </div>
                ) : (
                  <svg viewBox="0 0 600 400" className="h-full w-full">
                    {/* House Walls */}
                    <rect x="50" y="50" width="500" height="300" fill="none" stroke="#264653" strokeWidth="3"/>
                    
                    {/* Room Dividers */}
                    <line x1="200" y1="50" x2="200" y2="350" stroke="#264653" strokeWidth="2"/>
                    <line x1="400" y1="50" x2="400" y2="350" stroke="#264653" strokeWidth="2"/>
                    <line x1="50" y1="200" x2="550" y2="200" stroke="#264653" strokeWidth="2"/>
                    
                    {/* Render Room labels */}
                    {Object.values(bedsByRoom).map((roomData, index) => {
                      const positions = [
                        { x: 125, y: 125 }, // Room 1
                        { x: 300, y: 125 }, // Room 2
                        { x: 475, y: 125 }, // Room 3
                        { x: 125, y: 275 }, // Room 4
                        { x: 300, y: 275 }, // Room 5
                        { x: 475, y: 275 }, // Room 6
                      ];
                      
                      return (
                        <text 
                          key={roomData.room.id} 
                          x={positions[index % 6].x} 
                          y={positions[index % 6].y - 30} 
                          fontFamily="Montserrat" 
                          fontSize="14" 
                          fill="#264653" 
                          textAnchor="middle"
                        >
                          {roomData.room.name}
                        </text>
                      );
                    })}
                    
                    {/* Render Beds */}
                    {Object.values(bedsByRoom).map((roomData, roomIndex) => {
                      const bedPositionsMap = {
                        0: [ // Room 1 beds
                          { x: 70, y: 80 },
                          { x: 130, y: 80 }
                        ],
                        1: [ // Room 2 beds
                          { x: 220, y: 80 },
                          { x: 280, y: 80 },
                          { x: 340, y: 80 }
                        ],
                        2: [ // Room 3 beds
                          { x: 420, y: 80 },
                          { x: 480, y: 80 }
                        ],
                        3: [ // Room 4 beds
                          { x: 70, y: 230 },
                          { x: 130, y: 230 }
                        ],
                        4: [ // Room 5 beds
                          { x: 220, y: 230 },
                          { x: 280, y: 230 },
                          { x: 340, y: 230 }
                        ],
                        5: [ // Room 6 beds
                          { x: 420, y: 230 },
                          { x: 480, y: 230 }
                        ]
                      };
                      
                      const roomPositions = bedPositionsMap[roomIndex % 6] || [];
                      
                      return roomData.beds.map((bed, bedIndex) => {
                        const position = roomPositions[bedIndex % roomPositions.length] || { x: 0, y: 0 };
                        
                        return (
                          <g key={bed.id} onClick={() => handleBedClick(bed)} style={{ cursor: 'pointer' }}>
                            <rect
                              className={`bed ${statusColorClasses[bed.status]}`}
                              x={position.x}
                              y={position.y}
                              width="50"
                              height="80"
                              rx="5"
                              stroke="#264653"
                              strokeWidth="1"
                              data-id={`bed-${bed.id}`}
                              data-room={roomData.room.id}
                            />
                            <text
                              x={position.x + 25}
                              y={position.y + 50}
                              fontFamily="Montserrat"
                              fontSize="12"
                              fill="#264653"
                              textAnchor="middle"
                            >
                              {bed.name}
                            </text>
                          </g>
                        );
                      });
                    })}
                  </svg>
                )}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-3 justify-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#2A9D8F] bg-opacity-30 border border-gray-300 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#F4A261] bg-opacity-60 border border-gray-300 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Occupied</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#E9C46A] bg-opacity-50 border border-gray-300 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Maintenance</span>
                </div>
              </div>
            </div>
            
            {/* Slot for bed assignment component */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-md font-montserrat font-semibold mb-4 text-gray-700">
                Bed Information
              </h3>
              
              <p className="text-sm text-gray-500">
                Click on a bed in the house layout to view details or assign a resident.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
