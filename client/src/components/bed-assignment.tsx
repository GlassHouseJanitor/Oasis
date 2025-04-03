import { useState, useEffect } from "react";
import { useResidents } from "@/hooks/use-residents";
import { BedWithRoom, Resident } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface BedAssignmentProps {
  selectedBed: BedWithRoom | null;
}

const formSchema = z.object({
  residentId: z.string().optional(),
  assignmentDate: z.string().optional(),
  expectedDuration: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BedAssignment({ selectedBed }: BedAssignmentProps) {
  const { residents, isLoading: isLoadingResidents } = useResidents();
  const [currentResident, setCurrentResident] = useState<Resident | null>(null);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      residentId: "",
      assignmentDate: format(new Date(), "yyyy-MM-dd"),
      expectedDuration: "3 months",
      notes: "",
    },
  });
  
  // Reset form when selected bed changes
  useEffect(() => {
    if (selectedBed) {
      // Get current resident for this bed if it's occupied
      if (selectedBed.status === "occupied") {
        fetchResidentForBed(selectedBed.id);
      } else {
        setCurrentResident(null);
        form.reset({
          residentId: "",
          assignmentDate: format(new Date(), "yyyy-MM-dd"),
          expectedDuration: "3 months",
          notes: "",
        });
      }
    }
  }, [selectedBed]);
  
  const fetchResidentForBed = async (bedId: number) => {
    try {
      const response = await fetch(`/api/beds/${bedId}/resident`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const resident = await response.json();
        setCurrentResident(resident);
        form.reset({
          residentId: resident.id.toString(),
          assignmentDate: resident.moveInDate ? format(new Date(resident.moveInDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          expectedDuration: resident.expectedDuration || "3 months",
          notes: resident.notes || "",
        });
      } else {
        setCurrentResident(null);
      }
    } catch (error) {
      console.error("Error fetching resident for bed:", error);
      setCurrentResident(null);
    }
  };
  
  // Filter out residents who are already assigned to a bed
  const availableResidents = residents?.filter(resident => 
    !resident.bedId || (currentResident && resident.id === currentResident.id)
  );
  
  const onSubmit = async (data: FormValues) => {
    if (!selectedBed) return;
    
    try {
      if (data.residentId) {
        // Assign resident to bed
        const residentId = parseInt(data.residentId);
        const moveInDate = data.assignmentDate ? new Date(data.assignmentDate) : new Date();
        
        // Update resident with bed assignment
        await apiRequest("PATCH", `/api/residents/${residentId}`, {
          bedId: selectedBed.id,
          moveInDate,
          expectedDuration: data.expectedDuration,
          notes: data.notes,
        });
        
        // Update bed status
        await apiRequest("PATCH", `/api/beds/${selectedBed.id}`, {
          status: "occupied",
        });
        
        toast({
          title: "Success",
          description: "Resident successfully assigned to bed",
        });
      } else {
        // Unassign bed if no resident selected
        if (currentResident) {
          await apiRequest("PATCH", `/api/residents/${currentResident.id}`, {
            bedId: null,
          });
        }
        
        // Update bed status
        await apiRequest("PATCH", `/api/beds/${selectedBed.id}`, {
          status: "available",
        });
        
        toast({
          title: "Success",
          description: "Bed is now available",
        });
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/beds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/residents"] });
      
    } catch (error) {
      console.error("Error assigning resident to bed:", error);
      toast({
        title: "Error",
        description: "Failed to assign resident to bed",
        variant: "destructive",
      });
    }
  };
  
  if (!selectedBed) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a bed from the house layout
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-md font-montserrat font-semibold mb-4 text-gray-700">
        {selectedBed.status === "occupied" 
          ? "Bed Assignment Details" 
          : selectedBed.status === "maintenance"
          ? "Bed Under Maintenance"
          : "Assign Resident to Bed"}
      </h3>
      
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Room:</span>
          <span className="text-sm">{selectedBed.room.name}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-sm font-medium">Bed:</span>
          <span className="text-sm">{selectedBed.name}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-sm font-medium">Status:</span>
          <span className={`text-sm ${
            selectedBed.status === "available" 
              ? "text-green-600" 
              : selectedBed.status === "occupied" 
              ? "text-orange-500" 
              : "text-yellow-600"
          }`}>
            {selectedBed.status.charAt(0).toUpperCase() + selectedBed.status.slice(1)}
          </span>
        </div>
      </div>
      
      {selectedBed.status === "maintenance" ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-3">
            This bed is currently under maintenance and cannot be assigned.
          </p>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                await apiRequest("PATCH", `/api/beds/${selectedBed.id}`, {
                  status: "available",
                });
                queryClient.invalidateQueries({ queryKey: ["/api/beds"] });
                toast({
                  title: "Success",
                  description: "Bed is now available",
                });
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to update bed status",
                  variant: "destructive",
                });
              }
            }}
          >
            Mark as Available
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="residentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Resident</FormLabel>
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resident" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedBed.status === "occupied" && (
                        <SelectItem value="">-- Unassign Bed --</SelectItem>
                      )}
                      {isLoadingResidents ? (
                        <SelectItem value="" disabled>
                          Loading residents...
                        </SelectItem>
                      ) : availableResidents && availableResidents.length > 0 ? (
                        availableResidents.map((resident) => (
                          <SelectItem 
                            key={resident.id} 
                            value={resident.id.toString()}
                          >
                            {resident.firstName} {resident.lastName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No available residents
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expectedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Duration</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="3 months">3 months</SelectItem>
                      <SelectItem value="6 months">6 months</SelectItem>
                      <SelectItem value="9 months">9 months</SelectItem>
                      <SelectItem value="Indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this assignment"
                      className="h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full bg-[#2A9D8F] text-white">
              {selectedBed.status === "occupied" && currentResident
                ? "Update Assignment"
                : "Assign to Selected Bed"}
            </Button>
            
            {selectedBed.status === "occupied" && currentResident && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={async () => {
                  try {
                    await apiRequest("PATCH", `/api/beds/${selectedBed.id}`, {
                      status: "maintenance",
                    });
                    
                    // Update resident to remove bed assignment
                    await apiRequest("PATCH", `/api/residents/${currentResident.id}`, {
                      bedId: null,
                    });
                    
                    queryClient.invalidateQueries({ queryKey: ["/api/beds"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/residents"] });
                    
                    toast({
                      title: "Success",
                      description: "Bed marked for maintenance",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update bed status",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Mark for Maintenance
              </Button>
            )}
          </form>
        </Form>
      )}
    </div>
  );
}
