import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Home, ArrowUp, ArrowDown, Trash2, Edit, Eye, GripVertical } from "lucide-react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FloorBuilder, { Floor } from './floor-builder';
import House3DRenderer from './house-3d-renderer.tsx';

export interface House {
  id: string;
  name: string;
  address?: string;
  floors: Floor[];
}

// Define item types for drag and drop
const ItemTypes = {
  FLOOR: 'floor',
};

// Interface for drag item
interface DragItem {
  index: number;
  id: string;
  type: string;
}

// Draggable Floor Card Component
function DraggableFloorCard({ 
  floor, 
  index, 
  moveFloor, 
  onMoveUp, 
  onMoveDown, 
  onEdit, 
  onDelete, 
  totalFloors 
}: { 
  floor: Floor; 
  index: number; 
  moveFloor: (dragIndex: number, hoverIndex: number) => void; 
  onMoveUp: () => void; 
  onMoveDown: () => void; 
  onEdit: () => void; 
  onDelete: () => void; 
  totalFloors: number; 
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.FLOOR,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset ? clientOffset.y - hoverBoundingRect.top : 0;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveFloor(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FLOOR,
    item: () => {
      return { id: floor.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));
  
  return (
    <Card 
      ref={ref} 
      className="overflow-hidden cursor-move" 
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <GripVertical className="h-4 w-4 mr-3 text-gray-400" />
            <div>
              <h4 className="font-semibold">{floor.name}</h4>
              <p className="text-sm text-gray-500">
                {floor.rooms.length} rooms, {floor.rooms.reduce((acc, room) => acc + room.beds.length, 0)} beds
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onMoveUp}
              disabled={index === 0}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onMoveDown}
              disabled={index === totalFloors - 1}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HouseBuilder() {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [isAddingHouse, setIsAddingHouse] = useState(false);
  const [isAddingFloor, setIsAddingFloor] = useState(false);
  const [viewingHouse, setViewingHouse] = useState<House | null>(null);
  const [houseName, setHouseName] = useState('');
  const [houseAddress, setHouseAddress] = useState('');
  const { toast } = useToast();
  
  // Load saved houses from localStorage on mount
  useEffect(() => {
    const savedHouses = localStorage.getItem('oasis-houses');
    if (savedHouses) {
      try {
        const parsedHouses = JSON.parse(savedHouses);
        setHouses(parsedHouses);
        
        if (parsedHouses.length > 0) {
          setCurrentHouse(parsedHouses[0]);
        }
      } catch (error) {
        console.error('Error loading saved houses:', error);
      }
    }
  }, []);
  
  // Save houses to localStorage whenever they change
  useEffect(() => {
    if (houses.length > 0) {
      localStorage.setItem('oasis-houses', JSON.stringify(houses));
    }
  }, [houses]);
  
  // Create a new house
  const createHouse = () => {
    if (!houseName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your house.",
        variant: "destructive"
      });
      return;
    }
    
    const newHouse: House = {
      id: crypto.randomUUID(),
      name: houseName,
      address: houseAddress,
      floors: []
    };
    
    setHouses(prev => [...prev, newHouse]);
    setCurrentHouse(newHouse);
    setHouseName('');
    setHouseAddress('');
    setIsAddingHouse(false);
    
    toast({
      title: "House Created",
      description: `${newHouse.name} has been created successfully`
    });
  };
  
  // Save a floor to the current house
  const saveFloor = (floor: Floor) => {
    if (!currentHouse) return;
    
    setHouses(prevHouses => {
      return prevHouses.map(house => {
        if (house.id === currentHouse.id) {
          // If we're editing an existing floor, replace it
          if (editingFloor) {
            const updatedFloors = house.floors.map(f => 
              f.id === editingFloor.id ? floor : f
            );
            
            // Update current house
            const updatedHouse = { ...house, floors: updatedFloors };
            setCurrentHouse(updatedHouse);
            
            return updatedHouse;
          } 
          // Otherwise add a new floor
          else {
            const updatedHouse = { 
              ...house, 
              floors: [...house.floors, floor] 
            };
            setCurrentHouse(updatedHouse);
            
            return updatedHouse;
          }
        }
        return house;
      });
    });
    
    setEditingFloor(null);
    
    toast({
      title: "Floor Saved",
      description: `${floor.name} has been added to ${currentHouse.name}`
    });
  };
  
  // Delete a house
  const deleteHouse = (houseId: string) => {
    setHouses(prev => prev.filter(h => h.id !== houseId));
    
    if (currentHouse?.id === houseId) {
      setCurrentHouse(houses.length > 1 ? houses.find(h => h.id !== houseId) || null : null);
    }
    
    toast({
      title: "House Deleted",
      description: "The house has been deleted successfully"
    });
  };
  
  // Delete a floor
  const deleteFloor = (houseId: string, floorId: string) => {
    setHouses(prevHouses => {
      return prevHouses.map(house => {
        if (house.id === houseId) {
          const updatedFloors = house.floors.filter(f => f.id !== floorId);
          
          // Update current house if it's the one we're modifying
          if (currentHouse?.id === houseId) {
            setCurrentHouse({ ...house, floors: updatedFloors });
          }
          
          return { ...house, floors: updatedFloors };
        }
        return house;
      });
    });
    
    toast({
      title: "Floor Deleted",
      description: "The floor has been removed from the house"
    });
  };
  
  // Move a floor up in the stack
  const moveFloorUp = (houseId: string, floorId: string) => {
    setHouses(prevHouses => {
      return prevHouses.map(house => {
        if (house.id === houseId) {
          const floorIndex = house.floors.findIndex(f => f.id === floorId);
          if (floorIndex <= 0) return house; // Already at the top
          
          const updatedFloors = [...house.floors];
          const temp = updatedFloors[floorIndex];
          updatedFloors[floorIndex] = updatedFloors[floorIndex - 1];
          updatedFloors[floorIndex - 1] = temp;
          
          // Update current house if it's the one we're modifying
          if (currentHouse?.id === houseId) {
            setCurrentHouse({ ...house, floors: updatedFloors });
          }
          
          return { ...house, floors: updatedFloors };
        }
        return house;
      });
    });
    
    toast({
      title: "Floor Moved",
      description: "The floor has been moved up"
    });
  };
  
  // Move a floor down in the stack
  const moveFloorDown = (houseId: string, floorId: string) => {
    setHouses(prevHouses => {
      return prevHouses.map(house => {
        if (house.id === houseId) {
          const floorIndex = house.floors.findIndex(f => f.id === floorId);
          if (floorIndex === -1 || floorIndex === house.floors.length - 1) return house; // Already at the bottom
          
          const updatedFloors = [...house.floors];
          const temp = updatedFloors[floorIndex];
          updatedFloors[floorIndex] = updatedFloors[floorIndex + 1];
          updatedFloors[floorIndex + 1] = temp;
          
          // Update current house if it's the one we're modifying
          if (currentHouse?.id === houseId) {
            setCurrentHouse({ ...house, floors: updatedFloors });
          }
          
          return { ...house, floors: updatedFloors };
        }
        return house;
      });
    });
    
    toast({
      title: "Floor Moved",
      description: "The floor has been moved down"
    });
  };
  
  // Reorder floors via drag and drop
  const moveFloorPosition = (dragIndex: number, hoverIndex: number) => {
    if (!currentHouse) return;
    
    setHouses(prevHouses => {
      return prevHouses.map(house => {
        if (house.id === currentHouse.id) {
          const updatedFloors = [...house.floors];
          const draggedFloor = updatedFloors[dragIndex];
          
          // Remove the dragged floor
          updatedFloors.splice(dragIndex, 1);
          
          // Insert it at the new position
          updatedFloors.splice(hoverIndex, 0, draggedFloor);
          
          // Update current house
          const updatedHouse = { ...house, floors: updatedFloors };
          setCurrentHouse(updatedHouse);
          
          return updatedHouse;
        }
        return house;
      });
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-montserrat text-[#333232]">House Builder</h2>
        <Button 
          onClick={() => setIsAddingHouse(true)}
          className="bg-[#a3b68a] hover:bg-[#8a9c70] text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Create New House
        </Button>
      </div>
      
      {houses.length > 0 ? (
        <Tabs defaultValue="builder" className="w-full">
          <TabsList>
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="houses">My Houses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-[#333232]">
                      {currentHouse ? `Editing: ${currentHouse.name}` : 'Select a House'}
                    </h3>
                    {currentHouse?.address && (
                      <p className="text-sm text-gray-500">{currentHouse.address}</p>
                    )}
                  </div>
                  
                  {currentHouse && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddingFloor(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Floor
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setViewingHouse(currentHouse)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View 3D Model
                      </Button>
                    </div>
                  )}
                </div>
                
                {currentHouse ? (
                  <div>
                    {editingFloor ? (
                      <div>
                        <div className="mb-4 flex items-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditingFloor(null)}
                            className="mr-2"
                          >
                            &larr; Back to Floors
                          </Button>
                          <h3 className="text-lg font-semibold">Editing Floor: {editingFloor.name}</h3>
                        </div>
                        <FloorBuilder 
                          onSaveFloor={saveFloor} 
                          existingFloor={editingFloor} 
                        />
                      </div>
                    ) : currentHouse.floors.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Floors</h3>
                        <DndProvider backend={HTML5Backend}>
                          <div className="grid grid-cols-1 gap-4">
                            {currentHouse.floors.map((floor, index) => (
                              <DraggableFloorCard
                                key={floor.id}
                                floor={floor}
                                index={index}
                                moveFloor={moveFloorPosition}
                                onMoveUp={() => moveFloorUp(currentHouse.id, floor.id)}
                                onMoveDown={() => moveFloorDown(currentHouse.id, floor.id)}
                                onEdit={() => setEditingFloor(floor)}
                                onDelete={() => deleteFloor(currentHouse.id, floor.id)}
                                totalFloors={currentHouse.floors.length}
                              />
                            ))}
                          </div>
                        </DndProvider>
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-600 mb-2">No Floors Added Yet</h3>
                        <p className="text-gray-500 mb-6">
                          Start building your house by adding floors, then rooms and beds.
                        </p>
                        <Button 
                          onClick={() => setIsAddingFloor(true)}
                          className="bg-[#a3b68a] hover:bg-[#8a9c70] text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add First Floor
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No House Selected</h3>
                    <p className="text-gray-500 mb-6">
                      Please select a house from "My Houses" tab or create a new one.
                    </p>
                    <Button 
                      onClick={() => setIsAddingHouse(true)}
                      className="bg-[#a3b68a] hover:bg-[#8a9c70] text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create New House
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="houses">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {houses.map(house => (
                    <Card key={house.id} className={`overflow-hidden ${currentHouse?.id === house.id ? 'ring-2 ring-[#a3b68a]' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{house.name}</h4>
                            {house.address && (
                              <p className="text-sm text-gray-500">{house.address}</p>
                            )}
                            <p className="text-sm mt-2">
                              {house.floors.length} floor{house.floors.length !== 1 ? 's' : ''}, 
                              {house.floors.reduce((acc, floor) => acc + floor.rooms.length, 0)} room{house.floors.reduce((acc, floor) => acc + floor.rooms.length, 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setCurrentHouse(house)}
                              className="text-[#a3b68a] hover:text-[#8a9c70]"
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setViewingHouse(house)}
                              className="text-[#333232]"
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteHouse(house.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-medium text-gray-600 mb-2">No Houses Created Yet</h3>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Start by creating your first house. You'll be able to design floors, rooms, and bed arrangements.
          </p>
          <Button 
            onClick={() => setIsAddingHouse(true)}
            className="bg-[#a3b68a] hover:bg-[#8a9c70] text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Your First House
          </Button>
        </div>
      )}
      
      {/* Create House Dialog */}
      <Dialog open={isAddingHouse} onOpenChange={setIsAddingHouse}>
        <DialogContent className="bg-white border-gray-200 shadow-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Create New House</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add the details for your new house.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="house-name" className="text-gray-800">House Name</Label>
              <Input
                id="house-name"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                placeholder="White House"
                className="border-gray-300 text-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="house-address" className="text-gray-800">Address (Optional)</Label>
              <Input
                id="house-address"
                value={houseAddress}
                onChange={(e) => setHouseAddress(e.target.value)}
                placeholder="123 Recovery Road"
                className="border-gray-300 text-gray-800"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingHouse(false)} className="text-gray-800 border-gray-300">Cancel</Button>
            <Button 
              onClick={createHouse}
              className="bg-[#a3b68a] hover:bg-[#8a9c70] text-white"
            >
              Create House
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Floor Dialog */}
      <Dialog open={isAddingFloor} onOpenChange={(open) => {
        setIsAddingFloor(open);
        if (!open) setEditingFloor(null);
      }}>
        <DialogContent className="max-w-4xl bg-white border-gray-200 shadow-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Add New Floor</DialogTitle>
            <DialogDescription className="text-gray-600">
              Design your floor plan. Add rooms and beds as needed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <FloorBuilder onSaveFloor={saveFloor} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View House 3D Model Dialog */}
      <Dialog open={!!viewingHouse} onOpenChange={(open) => {
        if (!open) setViewingHouse(null);
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{viewingHouse?.name} - 3D Model</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {viewingHouse && (
              <House3DRenderer house={viewingHouse} height={600} />
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setViewingHouse(null)} className="bg-[#333232] hover:bg-[#444444] text-white">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}