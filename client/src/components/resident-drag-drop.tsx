import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BedWithRoom, ResidentWithBed } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ResidentDragDropProps {
  residents: ResidentWithBed[];
  beds: BedWithRoom[];
  onAssignmentComplete?: () => void;
}

interface DragData {
  type: 'resident';
  id: number;
}

export default function ResidentDragDrop({ residents, beds, onAssignmentComplete }: ResidentDragDropProps) {
  const [draggedResident, setDraggedResident] = useState<ResidentWithBed | null>(null);
  const [dropTargetBed, setDropTargetBed] = useState<BedWithRoom | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragImageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // This useEffect creates a ghost image for dragging
  useEffect(() => {
    if (!dragImageRef.current) return;
    
    const img = dragImageRef.current;
    img.style.position = 'absolute';
    img.style.top = '-1000px';
    img.style.left = '-1000px';
    
    document.body.appendChild(img);
    
    return () => {
      document.body.removeChild(img);
    };
  }, []);
  
  const handleDragStart = (e: React.DragEvent, resident: ResidentWithBed) => {
    // Create a styled drag image
    if (dragImageRef.current) {
      const img = dragImageRef.current;
      e.dataTransfer.setDragImage(img, 20, 20);
    }
    
    // Set the drag data
    const dragData: DragData = {
      type: 'resident',
      id: resident.id
    };
    
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    setDraggedResident(resident);
    setIsDragging(true);
    
    // For accessibility: Set the screen reader text
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnd = () => {
    setDraggedResident(null);
    setDropTargetBed(null);
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent, bed: BedWithRoom) => {
    e.preventDefault();
    
    // Only set the drop target if the bed is available or we're moving a resident from their current bed
    if (bed.status === 'available' || (draggedResident?.bed?.id === bed.id)) {
      setDropTargetBed(bed);
      e.dataTransfer.dropEffect = 'move';
    } else if (bed.status === 'occupied') {
      // Check if this bed is occupied by someone other than the dragged resident
      const occupant = residents.find(r => r.bed?.id === bed.id && r.id !== draggedResident?.id);
      if (occupant) {
        // Not allowed to move to an occupied bed
        e.dataTransfer.dropEffect = 'none';
      } else {
        setDropTargetBed(bed);
        e.dataTransfer.dropEffect = 'move';
      }
    } else {
      // Not allowed to drop on maintenance beds
      e.dataTransfer.dropEffect = 'none';
    }
  };
  
  const handleDragLeave = () => {
    setDropTargetBed(null);
  };
  
  const handleDrop = async (e: React.DragEvent, targetBed: BedWithRoom) => {
    e.preventDefault();
    
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (!data) return;
      
      const dragData: DragData = JSON.parse(data);
      
      if (dragData.type !== 'resident') return;
      
      const residentId = dragData.id;
      const resident = residents.find(r => r.id === residentId);
      
      if (!resident) return;
      
      // If the bed is in maintenance, prevent drop
      if (targetBed.status === 'maintenance') {
        toast({
          title: "Cannot Assign Bed",
          description: "This bed is under maintenance and cannot be assigned.",
          variant: "destructive"
        });
        return;
      }
      
      // Get the current occupant (if any)
      const currentOccupant = residents.find(r => 
        r.bed?.id === targetBed.id && r.id !== residentId
      );
      
      // If the bed is occupied by someone else, prevent drop
      if (currentOccupant) {
        toast({
          title: "Bed Already Occupied",
          description: `This bed is already assigned to ${currentOccupant.firstName} ${currentOccupant.lastName}.`,
          variant: "destructive"
        });
        return;
      }
      
      // Check if the resident is already assigned to this bed
      if (resident.bed?.id === targetBed.id) {
        toast({
          title: "No Change",
          description: `${resident.firstName} is already assigned to this bed.`,
        });
        return;
      }
      
      // Make API call to update the resident's bed assignment
      await apiRequest(`/api/residents/${resident.id}`, 'PATCH', {
        bedId: targetBed.id
      });
      
      // Also update the bed status to occupied
      await apiRequest(`/api/beds/${targetBed.id}`, 'PATCH', {
        status: 'occupied'
      });
      
      // If the resident was previously assigned to a bed, update that bed to available
      if (resident.bed?.id && resident.bed.id !== targetBed.id) {
        await apiRequest(`/api/beds/${resident.bed.id}`, 'PATCH', {
          status: 'available'
        });
      }
      
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ['/api/residents'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/beds'] });
      
      // Show success toast
      toast({
        title: "Bed Assigned",
        description: `${resident.firstName} ${resident.lastName} has been assigned to ${targetBed.room.name} / ${targetBed.name}.`,
      });
      
      // Call the completion callback if provided
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }
    } catch (error) {
      console.error('Error assigning resident to bed:', error);
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the resident to the bed.",
        variant: "destructive"
      });
    } finally {
      setDraggedResident(null);
      setDropTargetBed(null);
      setIsDragging(false);
    }
  };
  
  // Helper to get the avatar initials
  const getInitials = (resident: ResidentWithBed) => {
    return `${resident.firstName.charAt(0)}${resident.lastName.charAt(0)}`;
  };
  
  // Helper to get the status color for a badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-[#a3b68a] hover:bg-[#8a9c70]';
      case 'partial':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'unpaid':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'overdue':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Ghost element for drag image */}
      <div 
        ref={dragImageRef}
        className="w-12 h-12 rounded-full bg-[#a3b68a] flex items-center justify-center text-white font-bold"
      >
        {draggedResident ? getInitials(draggedResident) : 'RS'}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Residents List */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[#333232]">Residents</h3>
          <p className="text-sm text-gray-500 mb-4">Drag residents to assign beds</p>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {residents.map(resident => (
              <Card 
                key={resident.id}
                className={`cursor-move ${draggedResident?.id === resident.id ? 'opacity-50' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, resident)}
                onDragEnd={handleDragEnd}
              >
                <CardContent className="p-3 flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-[#a3b68a] text-white">
                      {getInitials(resident)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{resident.firstName} {resident.lastName}</div>
                    <div className="flex mt-1">
                      <Badge className={`text-xs ${getStatusColor(resident.paymentStatus)}`}>
                        {resident.paymentStatus}
                      </Badge>
                      {resident.bed && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          {resident.bed.room.name} / {resident.bed.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Bed Layout */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-[#333232] mb-2">Bed Assignment</h3>
          
          <Card className="h-[500px] overflow-auto">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {beds.map(bed => {
                  // Find the resident assigned to this bed, if any
                  const assignedResident = residents.find(r => r.bed?.id === bed.id);
                  
                  // Determine the bed color based on its status
                  let bgColor = '';
                  
                  if (dropTargetBed?.id === bed.id) {
                    bgColor = 'bg-[#a3b68a] bg-opacity-30 border-[#a3b68a]';
                  } else if (bed.status === 'available') {
                    bgColor = 'bg-[#a3b68a] bg-opacity-10 hover:bg-opacity-20';
                  } else if (bed.status === 'occupied') {
                    bgColor = 'bg-[#F4A261] bg-opacity-10 hover:bg-opacity-20';
                  } else if (bed.status === 'maintenance') {
                    bgColor = 'bg-[#E9C46A] bg-opacity-10 hover:bg-opacity-20';
                  }
                  
                  return (
                    <div
                      key={bed.id}
                      className={`border rounded-md p-3 ${bgColor} transition-colors`}
                      onDragOver={(e) => handleDragOver(e, bed)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, bed)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{bed.room.name} / {bed.name}</div>
                          <Badge 
                            variant={bed.status === 'maintenance' ? 'destructive' : 'outline'} 
                            className="mt-1"
                          >
                            {bed.status}
                          </Badge>
                        </div>
                        
                        {assignedResident && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#a3b68a] text-white text-xs">
                              {getInitials(assignedResident)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      
                      {assignedResident && (
                        <div className="mt-2 text-sm">
                          Assigned to: <span className="font-medium">{assignedResident.firstName} {assignedResident.lastName}</span>
                        </div>
                      )}
                      
                      {bed.notes && (
                        <div className="mt-2 text-xs text-gray-500">
                          Notes: {bed.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}