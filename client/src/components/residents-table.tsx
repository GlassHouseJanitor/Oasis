import { useState } from "react";
import { useResidents } from "@/hooks/use-residents";
import { ResidentWithBed } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, UserPlus, User, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ResidentsTableProps {
  onViewResident?: (resident: ResidentWithBed) => void;
  onEditResident?: (resident: ResidentWithBed) => void;
  onAddResident?: () => void;
}

export default function ResidentsTable({ 
  onViewResident, 
  onEditResident,
  onAddResident
}: ResidentsTableProps) {
  const { residentsWithBeds, isLoading } = useResidents();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Filter residents based on search query
  const filteredResidents = residentsWithBeds?.filter(resident => {
    const fullName = `${resident.firstName} ${resident.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || 
           (resident.email && resident.email.toLowerCase().includes(query)) ||
           (resident.bed?.room.name.toLowerCase().includes(query) || false);
  }) || [];
  
  // Paginate the filtered results
  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResidents = filteredResidents.slice(startIndex, startIndex + itemsPerPage);
  
  // Payment status badge variants
  const paymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-[#a3b68a] text-[#616d52] hover:bg-[#616d52]">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-[#ffd966] text-yellow-800 hover:bg-yellow-100">Partial</Badge>;
      case 'overdue':
        return <Badge className="bg-[#b70b08] text-red-1000 hover:bg-red-800">Overdue</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unpaid</Badge>;
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-montserrat text-[#264653]">Residents</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search residents..."
              className="pl-9 pr-4 py-2 w-56"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button 
            className="bg-[#a3b68a] hover:bg-[#2A9D8F]/90 text-white"
            onClick={onAddResident}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Resident</TableHead>
                <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Room/Bed</TableHead>
                <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Move-In Date</TableHead>
                <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Payment Status</TableHead>
                <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading residents...</TableCell>
                </TableRow>
              ) : paginatedResidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchQuery 
                      ? "No residents match your search" 
                      : "No residents found"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedResidents.map(resident => (
                  <TableRow key={resident.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#a3b68a]/10 flex items-center justify-center text-[#a3b68a]">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-[#a3b68a]" onClick={() => onViewResident?.(resident)}>
                            {resident.firstName} {resident.lastName}
                          </div>
                          <div className="text-sm text-gray-500">ID: R-{resident.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {resident.bed ? (
                        <div className="text-sm text-gray-900">
                          {resident.bed.room.name} / {resident.bed.name}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Not assigned</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {resident.moveInDate ? (
                        <>
                          <div className="text-sm text-gray-900">
                            {format(new Date(resident.moveInDate), "MMM d, yyyy")}
                          </div>
                          <div className="text-sm text-gray-500">{resident.expectedDuration}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">Not moved in</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {paymentStatusBadge(resident.paymentStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button 
                          className="text-[#264653] hover:text-[#a3b68a]"
                          onClick={() => onViewResident?.(resident)}
                        >
                          View
                        </button>
                        <button 
                          className="text-[#264653] hover:text-[#a3b68a]"
                          onClick={() => onEditResident?.(resident)}
                        >
                          Edit
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {filteredResidents.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredResidents.length)} of {filteredResidents.length} residents
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let pageNum = currentPage;
                if (totalPages <= 3) {
                  pageNum = i + 1;
                } else if (currentPage === 1) {
                  pageNum = i + 1;
                } else if (currentPage === totalPages) {
                  pageNum = totalPages - 2 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-[#a3b68a]" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
