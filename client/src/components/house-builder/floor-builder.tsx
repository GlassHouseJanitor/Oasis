import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger, 
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import { gsap } from "gsap";

export interface Room {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
  beds: Bed[];
}

export interface Bed {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface Floor {
  id: string;
  name: string;
  width: number;
  height: number;
  rooms: Room[];
}

interface FloorBuilderProps {
  onSaveFloor: (floor: Floor) => void;
  existingFloor?: Floor;
}

const defaultColors = [
  "#a3b68a", // Oasis green
  "#e0e0c5", // Light beige
  "#d9d2c5", // Warm beige
  "#c6ccc8", // Light gray
  "#e4e1db", // Off white
];

export default function FloorBuilder({ onSaveFloor, existingFloor }: FloorBuilderProps) {
  const [floor, setFloor] = useState<Floor>(existingFloor || {
    id: crypto.randomUUID(),
    name: "New Floor",
    width: 800,
    height: 600,
    rooms: []
  });
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isAddingBed, setIsAddingBed] = useState(false);
  const [dragItem, setDragItem] = useState<{ type: 'room' | 'bed', id: string } | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Room position handling
  const handleRoomDragStart = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    setDragItem({ type: 'room', id: room.id });
    setDragStart({ x: startX, y: startY });
    setSelectedRoom(room);
    setSelectedBed(null);
  };

  const handleBedDragStart = (e: React.MouseEvent, room: Room, bed: Bed) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    setDragItem({ type: 'bed', id: bed.id });
    setDragStart({ x: startX, y: startY });
    setSelectedRoom(room);
    setSelectedBed(bed);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragItem || !canvasRef.current) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    if (dragItem.type === 'room') {
      setFloor(prevFloor => {
        const roomIndex = prevFloor.rooms.findIndex(r => r.id === dragItem.id);
        if (roomIndex === -1) return prevFloor;
        
        const newRooms = [...prevFloor.rooms];
        const room = { ...newRooms[roomIndex] };
        room.x += dx;
        room.y += dy;
        
        // Ensure room stays within floor bounds
        room.x = Math.max(0, Math.min(room.x, prevFloor.width - room.width));
        room.y = Math.max(0, Math.min(room.y, prevFloor.height - room.height));
        
        newRooms[roomIndex] = room;
        return { ...prevFloor, rooms: newRooms };
      });
    } else if (dragItem.type === 'bed') {
      setFloor(prevFloor => {
        // Find the room containing this bed
        const roomIndex = prevFloor.rooms.findIndex(
          r => r.beds.some(b => b.id === dragItem.id)
        );
        if (roomIndex === -1) return prevFloor;
        
        const newRooms = [...prevFloor.rooms];
        const room = { ...newRooms[roomIndex] };
        const bedIndex = room.beds.findIndex(b => b.id === dragItem.id);
        
        if (bedIndex === -1) return prevFloor;
        
        const beds = [...room.beds];
        const bed = { ...beds[bedIndex] };
        bed.x += dx;
        bed.y += dy;
        
        // Ensure bed stays within room bounds
        bed.x = Math.max(0, Math.min(bed.x, room.width - bed.width));
        bed.y = Math.max(0, Math.min(bed.y, room.height - bed.height));
        
        beds[bedIndex] = bed;
        room.beds = beds;
        newRooms[roomIndex] = room;
        
        return { ...prevFloor, rooms: newRooms };
      });
    }
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDragItem(null);
  };

  // Set up mouse move and mouse up listeners
  useEffect(() => {
    if (dragItem) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragItem, dragStart]);

  // Add a new room
  const addRoom = () => {
    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: `Room ${floor.rooms.length + 1}`,
      width: 200,
      height: 150,
      x: Math.random() * (floor.width - 200),
      y: Math.random() * (floor.height - 150),
      color: defaultColors[floor.rooms.length % defaultColors.length],
      beds: []
    };
    
    setFloor(prevFloor => ({
      ...prevFloor,
      rooms: [...prevFloor.rooms, newRoom]
    }));
    
    setSelectedRoom(newRoom);
    setIsAddingRoom(false);
    
    // Animation for new room appearing
    if (canvasRef.current) {
      const roomElement = document.getElementById(`room-${newRoom.id}`);
      if (roomElement) {
        gsap.from(roomElement, {
          duration: 0.5, 
          scale: 0,
          opacity: 0,
          ease: "back.out(1.7)"
        });
      }
    }
    
    toast({
      title: "Room Added",
      description: `${newRoom.name} has been added to the floor plan`
    });
  };

  // Add a new bed to selected room
  const addBed = () => {
    if (!selectedRoom) return;
    
    const newBed: Bed = {
      id: crypto.randomUUID(),
      name: `Bed ${selectedRoom.beds.length + 1}`,
      width: 60,
      height: 100,
      x: 20,
      y: 20,
      rotation: 0,
      status: 'available'
    };
    
    setFloor(prevFloor => {
      const roomIndex = prevFloor.rooms.findIndex(r => r.id === selectedRoom.id);
      if (roomIndex === -1) return prevFloor;
      
      const newRooms = [...prevFloor.rooms];
      const room = { ...newRooms[roomIndex] };
      room.beds = [...room.beds, newBed];
      newRooms[roomIndex] = room;
      
      return { ...prevFloor, rooms: newRooms };
    });
    
    setSelectedBed(newBed);
    setIsAddingBed(false);
    
    // Animation for new bed appearing
    if (canvasRef.current) {
      setTimeout(() => {
        const bedElement = document.getElementById(`bed-${newBed.id}`);
        if (bedElement) {
          gsap.from(bedElement, {
            duration: 0.5, 
            scale: 0,
            opacity: 0,
            ease: "elastic.out(1, 0.5)"
          });
        }
      }, 50);
    }
    
    toast({
      title: "Bed Added",
      description: `${newBed.name} has been added to ${selectedRoom.name}`
    });
  };

  // Handle room property updates
  const updateRoomProperty = (id: string, property: keyof Room, value: any) => {
    setFloor(prevFloor => {
      const roomIndex = prevFloor.rooms.findIndex(r => r.id === id);
      if (roomIndex === -1) return prevFloor;
      
      const newRooms = [...prevFloor.rooms];
      const room = { ...newRooms[roomIndex], [property]: value };
      newRooms[roomIndex] = room;
      
      if (selectedRoom?.id === id) {
        setSelectedRoom(room);
      }
      
      return { ...prevFloor, rooms: newRooms };
    });
  };

  // Handle bed property updates
  const updateBedProperty = (roomId: string, bedId: string, property: keyof Bed, value: any) => {
    setFloor(prevFloor => {
      const roomIndex = prevFloor.rooms.findIndex(r => r.id === roomId);
      if (roomIndex === -1) return prevFloor;
      
      const newRooms = [...prevFloor.rooms];
      const room = { ...newRooms[roomIndex] };
      const bedIndex = room.beds.findIndex(b => b.id === bedId);
      
      if (bedIndex === -1) return prevFloor;
      
      const beds = [...room.beds];
      const bed = { ...beds[bedIndex], [property]: value };
      beds[bedIndex] = bed;
      room.beds = beds;
      newRooms[roomIndex] = room;
      
      if (selectedBed?.id === bedId) {
        setSelectedBed(bed);
      }
      
      return { ...prevFloor, rooms: newRooms };
    });
  };

  // Delete a room
  const deleteRoom = (id: string) => {
    setFloor(prevFloor => ({
      ...prevFloor,
      rooms: prevFloor.rooms.filter(r => r.id !== id)
    }));
    
    if (selectedRoom?.id === id) {
      setSelectedRoom(null);
      setSelectedBed(null);
    }
    
    toast({
      title: "Room Deleted",
      description: "The room has been removed from the floor plan"
    });
  };

  // Delete a bed
  const deleteBed = (roomId: string, bedId: string) => {
    setFloor(prevFloor => {
      const roomIndex = prevFloor.rooms.findIndex(r => r.id === roomId);
      if (roomIndex === -1) return prevFloor;
      
      const newRooms = [...prevFloor.rooms];
      const room = { ...newRooms[roomIndex] };
      room.beds = room.beds.filter(b => b.id !== bedId);
      newRooms[roomIndex] = room;
      
      return { ...prevFloor, rooms: newRooms };
    });
    
    if (selectedBed?.id === bedId) {
      setSelectedBed(null);
    }
    
    toast({
      title: "Bed Deleted",
      description: "The bed has been removed from the room"
    });
  };

  // Save the floor
  const saveFloor = () => {
    onSaveFloor(floor);
    
    toast({
      title: "Floor Saved",
      description: `${floor.name} has been saved successfully`
    });
  };

  // Update floor properties
  const updateFloorProperty = (property: keyof Floor, value: any) => {
    setFloor(prevFloor => ({
      ...prevFloor,
      [property]: value
    }));
  };

  // Rotate a bed
  const rotateBed = (roomId: string, bedId: string) => {
    setFloor(prevFloor => {
      const roomIndex = prevFloor.rooms.findIndex(r => r.id === roomId);
      if (roomIndex === -1) return prevFloor;
      
      const newRooms = [...prevFloor.rooms];
      const room = { ...newRooms[roomIndex] };
      const bedIndex = room.beds.findIndex(b => b.id === bedId);
      
      if (bedIndex === -1) return prevFloor;
      
      const beds = [...room.beds];
      const bed = { ...beds[bedIndex] };
      bed.rotation = (bed.rotation + 90) % 360;
      
      // Swap width and height when rotating 90 or 270 degrees
      if (bed.rotation === 90 || bed.rotation === 270) {
        const temp = bed.width;
        bed.width = bed.height;
        bed.height = temp;
      }
      
      beds[bedIndex] = bed;
      room.beds = beds;
      newRooms[roomIndex] = room;
      
      if (selectedBed?.id === bedId) {
        setSelectedBed(bed);
      }
      
      // Animate rotation
      const bedElement = document.getElementById(`bed-${bedId}`);
      if (bedElement) {
        gsap.to(bedElement, {
          duration: 0.5,
          rotation: bed.rotation,
          ease: "power2.out"
        });
      }
      
      return { ...prevFloor, rooms: newRooms };
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="floor-name">Floor Name:</Label>
            <Input
              id="floor-name"
              value={floor.name}
              onChange={(e) => updateFloorProperty('name', e.target.value)}
              className="w-48"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsAddingRoom(true)} 
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Room
          </Button>
          <Button 
            variant="default" 
            onClick={saveFloor}
            className="bg-[#a3b68a] hover:bg-[#8a9c70] text-white"
          >
            <Save className="h-4 w-4 mr-1" /> Save Floor
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Floor Canvas */}
        <div 
          ref={canvasRef}
          className="relative border border-gray-300 rounded-md flex-1 overflow-auto bg-white"
          style={{ height: '500px' }}
        >
          <div 
            className="relative"
            style={{ width: `${floor.width}px`, height: `${floor.height}px` }}
          >
            {floor.rooms.map((room) => (
              <div
                id={`room-${room.id}`}
                key={room.id}
                className={`absolute rounded-md cursor-move border-2 ${selectedRoom?.id === room.id ? 'border-[#333232]' : 'border-gray-300'}`}
                style={{
                  left: `${room.x}px`,
                  top: `${room.y}px`,
                  width: `${room.width}px`,
                  height: `${room.height}px`,
                  backgroundColor: room.color,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRoom(room);
                  setSelectedBed(null);
                }}
                onMouseDown={(e) => handleRoomDragStart(e, room)}
              >
                <div className="absolute top-2 left-2 font-medium text-[#333232]">
                  {room.name}
                </div>
                
                {/* Render beds in the room */}
                {room.beds.map((bed) => (
                  <div
                    id={`bed-${bed.id}`}
                    key={bed.id}
                    className={`absolute rounded-sm border ${selectedBed?.id === bed.id ? 'border-[#333232] shadow-md' : 'border-gray-500'} cursor-move`}
                    style={{
                      left: `${bed.x}px`,
                      top: `${bed.y}px`,
                      width: `${bed.width}px`,
                      height: `${bed.height}px`,
                      backgroundColor: 
                        bed.status === 'available' ? 'rgba(163, 182, 138, 0.5)' : 
                        bed.status === 'occupied' ? 'rgba(244, 162, 97, 0.6)' : 
                        'rgba(233, 196, 106, 0.5)',
                      transform: `rotate(${bed.rotation}deg)`,
                      transformOrigin: 'center',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBed(bed);
                      setSelectedRoom(room);
                    }}
                    onMouseDown={(e) => handleBedDragStart(e, room, bed)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-[#333232]">
                      {bed.name}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Property Panel */}
        <div className="w-64 ml-4 border border-gray-200 rounded-md p-3 space-y-4">
          <h3 className="font-semibold text-[#333232]">Properties</h3>
          
          {selectedRoom ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm border-b pb-1">{selectedRoom.name}</h4>
              
              <div className="space-y-2">
                <Label htmlFor="room-name">Name:</Label>
                <Input
                  id="room-name"
                  value={selectedRoom.name}
                  onChange={(e) => updateRoomProperty(selectedRoom.id, 'name', e.target.value)}
                  className="h-8"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="room-width">Width:</Label>
                  <Input
                    id="room-width"
                    type="number"
                    value={selectedRoom.width}
                    onChange={(e) => updateRoomProperty(selectedRoom.id, 'width', parseInt(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="room-height">Height:</Label>
                  <Input
                    id="room-height"
                    type="number"
                    value={selectedRoom.height}
                    onChange={(e) => updateRoomProperty(selectedRoom.id, 'height', parseInt(e.target.value))}
                    className="h-8"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="room-color">Color:</Label>
                <div className="flex space-x-1 mt-1">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full ${selectedRoom.color === color ? 'ring-2 ring-[#333232]' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateRoomProperty(selectedRoom.id, 'color', color)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="pt-2 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingBed(true)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Bed
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => deleteRoom(selectedRoom.id)}
                  className="text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Delete Room
                </Button>
              </div>
              
              {selectedBed && (
                <div className="space-y-2 mt-4 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">{selectedBed.name}</h4>
                  
                  <div>
                    <Label htmlFor="bed-name">Name:</Label>
                    <Input
                      id="bed-name"
                      value={selectedBed.name}
                      onChange={(e) => updateBedProperty(selectedRoom.id, selectedBed.id, 'name', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bed-status">Status:</Label>
                    <Select
                      value={selectedBed.status}
                      onValueChange={(value: 'available' | 'occupied' | 'maintenance') => 
                        updateBedProperty(selectedRoom.id, selectedBed.id, 'status', value)
                      }
                    >
                      <SelectTrigger id="bed-status" className="h-8">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="bed-width">Width:</Label>
                      <Input
                        id="bed-width"
                        type="number"
                        value={selectedBed.width}
                        onChange={(e) => updateBedProperty(selectedRoom.id, selectedBed.id, 'width', parseInt(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bed-height">Height:</Label>
                      <Input
                        id="bed-height"
                        type="number"
                        value={selectedBed.height}
                        onChange={(e) => updateBedProperty(selectedRoom.id, selectedBed.id, 'height', parseInt(e.target.value))}
                        className="h-8"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => rotateBed(selectedRoom.id, selectedBed.id)}
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Rotate
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteBed(selectedRoom.id, selectedBed.id)}
                      className="text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Select a room to edit its properties
            </div>
          )}
        </div>
      </div>

      {/* Add Room Dialog */}
      <Dialog open={isAddingRoom} onOpenChange={setIsAddingRoom}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">
              Add a new room to your floor plan. You can adjust its size and position later.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingRoom(false)}>Cancel</Button>
            <Button 
              onClick={addRoom}
              className="bg-[#a3b68a] hover:bg-[#8a9c70] text-white"
            >
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bed Dialog */}
      <Dialog open={isAddingBed} onOpenChange={setIsAddingBed}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">
              Add a new bed to {selectedRoom?.name}. You can adjust its position later.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingBed(false)}>Cancel</Button>
            <Button 
              onClick={addBed}
              className="bg-[#a3b68a] hover:bg-[#8a9c70] text-white"
            >
              Add Bed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}