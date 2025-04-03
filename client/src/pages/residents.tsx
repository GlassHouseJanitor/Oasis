import { useState } from "react";
import ResidentsTable from "@/components/residents-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResidentWithBed } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const residentFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
});

type ResidentFormValues = z.infer<typeof residentFormSchema>;

export default function Residents() {
  const [isAddResidentOpen, setIsAddResidentOpen] = useState(false);
  const [isViewResidentOpen, setIsViewResidentOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ResidentWithBed | null>(null);
  const { toast } = useToast();
  
  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      emergencyContact: "",
      notes: "",
    },
  });
  
  const handleAddResident = () => {
    form.reset();
    setIsAddResidentOpen(true);
  };
  
  const handleViewResident = (resident: ResidentWithBed) => {
    setSelectedResident(resident);
    setIsViewResidentOpen(true);
  };
  
  const handleEditResident = (resident: ResidentWithBed) => {
    setSelectedResident(resident);
    form.reset({
      firstName: resident.firstName,
      lastName: resident.lastName,
      email: resident.email || "",
      phone: resident.phone || "",
      emergencyContact: resident.emergencyContact || "",
      notes: resident.notes || "",
    });
    setIsAddResidentOpen(true);
  };
  
  const onSubmit = async (values: ResidentFormValues) => {
    try {
      if (selectedResident) {
        // Update existing resident
        await apiRequest("PATCH", `/api/residents/${selectedResident.id}`, values);
        toast({
          title: "Success",
          description: "Resident has been updated successfully",
        });
      } else {
        // Create new resident
        await apiRequest("POST", "/api/residents", {
          ...values,
          paymentStatus: "unpaid",
        });
        toast({
          title: "Success",
          description: "New resident has been added successfully",
        });
      }
      
      // Invalidate residents queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/residents"] });
      setIsAddResidentOpen(false);
      setSelectedResident(null);
      
    } catch (error) {
      console.error("Error saving resident:", error);
      toast({
        title: "Error",
        description: "Failed to save resident information",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-montserrat text-[#264653]">Residents</h1>
        <Button 
          className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white"
          onClick={handleAddResident}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Resident
        </Button>
      </div>
      
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <ResidentsTable 
            onViewResident={handleViewResident}
            onEditResident={handleEditResident}
            onAddResident={handleAddResident}
          />
        </CardContent>
      </Card>
      
      {/* Add/Edit Resident Dialog */}
      <Dialog open={isAddResidentOpen} onOpenChange={setIsAddResidentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedResident ? "Edit Resident" : "Add New Resident"}</DialogTitle>
            <DialogDescription>
              {selectedResident 
                ? "Update resident information in the system."
                : "Enter the details of the new resident."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe, (555) 987-6543" {...field} />
                    </FormControl>
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
                        placeholder="Additional information about the resident"
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddResidentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white">
                  {selectedResident ? "Update Resident" : "Add Resident"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Resident Dialog */}
      <Dialog open={isViewResidentOpen} onOpenChange={setIsViewResidentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resident Details</DialogTitle>
          </DialogHeader>
          
          {selectedResident && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-[#2A9D8F]/10 flex items-center justify-center text-[#2A9D8F]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-montserrat">{selectedResident.firstName} {selectedResident.lastName}</h3>
                  <p className="text-gray-500">ID: R-{selectedResident.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedResident.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{selectedResident.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                  <p>{selectedResident.emergencyContact || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className={`
                    ${selectedResident.paymentStatus === 'paid' ? 'text-green-600' : ''}
                    ${selectedResident.paymentStatus === 'partial' ? 'text-yellow-600' : ''}
                    ${selectedResident.paymentStatus === 'overdue' ? 'text-red-600' : ''}
                    ${selectedResident.paymentStatus === 'unpaid' ? 'text-gray-600' : ''}
                  `}>
                    {selectedResident.paymentStatus.charAt(0).toUpperCase() + selectedResident.paymentStatus.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Move-In Date</p>
                  <p>{selectedResident.moveInDate ? new Date(selectedResident.moveInDate).toLocaleDateString() : "Not moved in"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Expected Duration</p>
                  <p>{selectedResident.expectedDuration || "Not specified"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Housing Assignment</p>
                  <p>
                    {selectedResident.bed 
                      ? `${selectedResident.bed.room.name} / ${selectedResident.bed.name}` 
                      : "Not currently assigned"
                    }
                  </p>
                </div>
                {selectedResident.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="whitespace-pre-wrap">{selectedResident.notes}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewResidentOpen(false);
                    handleEditResident(selectedResident);
                  }}
                >
                  Edit Resident
                </Button>
                <Button
                  variant="default"
                  className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white"
                  onClick={() => {
                    window.location.href = "/housing";
                  }}
                >
                  Manage Housing
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
