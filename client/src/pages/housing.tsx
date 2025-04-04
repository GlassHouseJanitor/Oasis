import { useState } from "react";
import HouseVisualization from "@/components/house-visualization";
import BedAssignment from "@/components/bed-assignment";
import ResidentsTable from "@/components/residents-table";
import { Card, CardContent } from "@/components/ui/card";
import { BedWithRoom, ResidentWithBed } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Housing() {
  const [selectedBed, setSelectedBed] = useState<BedWithRoom | null>(null);
  const [viewResident, setViewResident] = useState<ResidentWithBed | null>(null);
  const { toast } = useToast();
  
  const handleBedSelect = (bed: BedWithRoom) => {
    setSelectedBed(bed);
  };
  
  const handleViewResident = (resident: ResidentWithBed) => {
    setViewResident(resident);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-montserrat text-[#264653]">Housing Management</h1>
      
      <Tabs defaultValue="beds" className="w-full">
        <TabsList>
          <TabsTrigger value="beds">Bed Management</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
        </TabsList>
        <TabsContent value="beds" className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* House Visualization */}
                <div className="col-span-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <HouseVisualization onBedSelect={handleBedSelect} />
                </div>
                
                {/* Bed Assignment */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <BedAssignment selectedBed={selectedBed} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="residents">
          <ResidentsTable 
            onViewResident={handleViewResident}
            onEditResident={(resident) => {
              toast({
                title: "Edit Resident",
                description: `Editing ${resident.firstName} ${resident.lastName}`
              });
            }}
            onAddResident={() => {
              toast({
                title: "Add Resident",
                description: "Opening resident form"
              });
            }}
          />
        </TabsContent>
      </Tabs>
      
      {/* Resident View Dialog */}
      <Dialog open={!!viewResident} onOpenChange={() => setViewResident(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resident Details</DialogTitle>
          </DialogHeader>
          
          {viewResident && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-[#a3b68a]/10 flex items-center justify-center text-[#a3b68a]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-montserrat">{viewResident.firstName} {viewResident.lastName}</h3>
                  <p className="text-gray-500">ID: R-{viewResident.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{viewResident.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{viewResident.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                  <p>{viewResident.emergencyContact || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className={`
                    ${viewResident.paymentStatus === 'paid' ? 'text-green-600' : ''}
                    ${viewResident.paymentStatus === 'partial' ? 'text-yellow-600' : ''}
                    ${viewResident.paymentStatus === 'overdue' ? 'text-red-600' : ''}
                    ${viewResident.paymentStatus === 'unpaid' ? 'text-gray-600' : ''}
                  `}>
                    {viewResident.paymentStatus.charAt(0).toUpperCase() + viewResident.paymentStatus.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Move-In Date</p>
                  <p>{viewResident.moveInDate ? new Date(viewResident.moveInDate).toLocaleDateString() : "Not moved in"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Expected Duration</p>
                  <p>{viewResident.expectedDuration || "Not specified"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Housing Assignment</p>
                  <p>
                    {viewResident.bed 
                      ? `${viewResident.bed.room.name} / ${viewResident.bed.name}` 
                      : "Not currently assigned"
                    }
                  </p>
                </div>
                {viewResident.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="whitespace-pre-wrap">{viewResident.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
