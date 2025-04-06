import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BedWithRoom, ResidentWithBed } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResidents } from "@/hooks/use-residents";
import { useBeds } from "@/hooks/use-beds";
import HouseBuilder from "@/components/house-builder/house-builder";
import ResidentDragDrop from "@/components/resident-drag-drop";
import { queryClient } from "@/lib/queryClient";
import { Loader2, BuildingIcon, Plus } from "lucide-react";

export default function HousingPage() {
  const [selectedBed, setSelectedBed] = useState<BedWithRoom | null>(null);
  const [viewResident, setViewResident] = useState<ResidentWithBed | null>(null);
  const [activeTab, setActiveTab] = useState("beds");
  const { toast } = useToast();
  const { residents, isLoading: residentsLoading } = useResidents();
  const { bedsWithRooms, isLoading: bedsLoading } = useBeds();

  const handleBedSelect = (bed: BedWithRoom) => {
    setSelectedBed(bed);
  };

  const handleViewResident = (resident: ResidentWithBed) => {
    setViewResident(resident);
  };

  const handleAssignmentComplete = () => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/residents'] });
    queryClient.invalidateQueries({ queryKey: ['/api/beds'] });
    toast({
      title: "Assignment Updated",
      description: "The resident assignment has been updated successfully."
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-montserrat text-[#333232]">Housing Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="beds">Bed Management</TabsTrigger>
          <TabsTrigger value="builder">House Builder</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
        </TabsList>

        <TabsContent value="beds" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#333232]">Resident Assignment</h2>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              {residentsLoading || bedsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#a3b68a]" />
                  <span className="ml-3 text-gray-600">Loading housing data...</span>
                </div>
              ) : (
                <ResidentDragDrop 
                  residents={residents || []} 
                  beds={bedsWithRooms || []} 
                  onAssignmentComplete={handleAssignmentComplete}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder">
          <Card>
            <CardContent className="p-6">
              <HouseBuilder />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="residents">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 text-[#333232]">Resident Management</h2>
              
              {residentsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#a3b68a]" />
                  <span className="ml-3 text-gray-600">Loading residents...</span>
                </div>
              ) : residents && residents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {residents.map(resident => (
                    <Card key={resident.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-[#333232]">{resident.firstName} {resident.lastName}</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                resident.paymentStatus === 'paid' ? 'bg-[#a3b68a] text-white' :
                                resident.paymentStatus === 'partial' ? 'bg-amber-500 text-white' :
                                resident.paymentStatus === 'unpaid' ? 'bg-gray-500 text-white' :
                                'bg-red-500 text-white'
                              }`}>
                                {resident.paymentStatus}
                              </span>
                              
                              {resident.bed && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {resident.bed.room.name} / {resident.bed.name}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm" onClick={() => handleViewResident(resident)}>
                            Details
                          </Button>
                        </div>
                        
                        {resident.moveInDate && (
                          <div className="mt-2 text-xs text-gray-500">
                            Move-in: {new Date(resident.moveInDate).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-md">
                  <BuildingIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Residents Found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    There are no residents in the system yet. Add residents to assign them to beds.
                  </p>
                  <Button className="bg-[#a3b68a] hover:bg-[#8a9c70] text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add Resident
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bed Assignment Dialog */}
      <Dialog open={!!selectedBed} onOpenChange={(open) => !open && setSelectedBed(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bed Assignment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedBed && (
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold">{selectedBed.room.name} / {selectedBed.name}</h3>
                  <p className="text-sm text-gray-500">Status: {selectedBed.status}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Assign Resident</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                    {residents && residents.map(resident => (
                      <button
                        key={resident.id}
                        className="flex items-center p-2 border rounded hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          // Make API call to update assignment
                          fetch(`/api/residents/${resident.id}`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ bedId: selectedBed.id }),
                          })
                            .then(response => {
                              if (!response.ok) throw new Error('Failed to update bed assignment');
                              return response.json();
                            })
                            .then(() => {
                              toast({
                                title: "Bed Assigned",
                                description: `${resident.firstName} ${resident.lastName} assigned to ${selectedBed.room.name}/${selectedBed.name}`
                              });
                              // Invalidate queries to refresh data
                              queryClient.invalidateQueries({ queryKey: ['/api/residents'] });
                              queryClient.invalidateQueries({ queryKey: ['/api/beds'] });
                              setSelectedBed(null);
                            })
                            .catch(error => {
                              console.error('Error:', error);
                              toast({
                                title: "Assignment Failed",
                                description: "Failed to update bed assignment. Please try again.",
                                variant: "destructive"
                              });
                            });
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#a3b68a] flex items-center justify-center text-white text-sm mr-2">
                          {resident.firstName.charAt(0)}{resident.lastName.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div>{resident.firstName} {resident.lastName}</div>
                          <div className="text-xs text-gray-500">
                            {resident.bed 
                              ? `Currently in ${resident.bed.room.name}/${resident.bed.name}` 
                              : 'Not assigned'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Resident Details Dialog */}
      <Dialog open={!!viewResident} onOpenChange={(open) => !open && setViewResident(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resident Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {viewResident && (
              <div>
                <h3 className="font-semibold text-lg">{viewResident.firstName} {viewResident.lastName}</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Status:</span>
                    <span className="font-medium">{viewResident.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Room Assignment:</span>
                    <span className="font-medium">
                      {viewResident.bed 
                        ? `${viewResident.bed.room.name} / ${viewResident.bed.name}` 
                        : 'Unassigned'}
                    </span>
                  </div>
                  {viewResident.moveInDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Move-in Date:</span>
                      <span className="font-medium">{new Date(viewResident.moveInDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {viewResident.expectedDuration && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expected Stay:</span>
                      <span className="font-medium">{viewResident.expectedDuration}</span>
                    </div>
                  )}
                  {viewResident.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{viewResident.phone}</span>
                    </div>
                  )}
                  {viewResident.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{viewResident.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}