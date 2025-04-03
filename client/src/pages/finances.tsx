import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Payment, Resident } from "@shared/schema";
import PaymentForm from "@/components/payment-form";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Plus, 
  Search, 
  Printer, 
  Download,
  Filter, 
  ArrowUpDown,
  Inbox,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Finances() {
  const [activeTab, setActiveTab] = useState("payments");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const {
    data: payments,
    isLoading: isLoadingPayments,
  } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
  });
  
  const {
    data: residents,
    isLoading: isLoadingResidents,
  } = useQuery<Resident[]>({
    queryKey: ['/api/residents'],
  });
  
  // Helper to format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };
  
  // Filter payments based on search query
  const filteredPayments = payments?.filter(payment => {
    const resident = residents?.find(r => r.id === payment.residentId);
    if (!resident) return false;
    
    const residentName = `${resident.firstName} ${resident.lastName}`.toLowerCase();
    const invoiceId = payment.invoiceId?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return residentName.includes(query) || invoiceId.includes(query);
  }) || [];

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil((filteredPayments?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  
  const handleAddPayment = (resident?: Resident) => {
    setSelectedResident(resident || null);
    setIsFormOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-montserrat text-[#264653]">Financial Management</h1>
      
      <Tabs 
        defaultValue="payments" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold font-montserrat text-[#264653]">Payment History</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search payments..."
                      className="pl-9 pr-4 py-2 w-56"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <Button 
                    className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white"
                    onClick={() => handleAddPayment()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Resident</TableHead>
                      <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Amount</TableHead>
                      <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Date</TableHead>
                      <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Payment Method</TableHead>
                      <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Invoice</TableHead>
                      <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPayments || isLoadingResidents ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">Loading payments...</TableCell>
                      </TableRow>
                    ) : paginatedPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          {searchQuery 
                            ? "No payments match your search" 
                            : "No payments recorded yet"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPayments.map(payment => {
                        const resident = residents?.find(r => r.id === payment.residentId);
                        
                        return (
                          <TableRow key={payment.id} className="hover:bg-gray-50">
                            <TableCell>
                              {resident ? (
                                <div className="font-medium">{resident.firstName} {resident.lastName}</div>
                              ) : (
                                <div className="text-gray-500">Unknown Resident</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-[#264653]">{formatCurrency(payment.amount)}</div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(payment.datePaid), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              {payment.paymentMethod}
                            </TableCell>
                            <TableCell>
                              {payment.invoiceId ? (
                                <div className="text-blue-600 hover:underline cursor-pointer">
                                  {payment.invoiceId}
                                </div>
                              ) : (
                                <div className="text-gray-500">No Invoice</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <button 
                                  className="text-[#264653] hover:text-[#2A9D8F]"
                                  onClick={() => {
                                    toast({
                                      title: "View details",
                                      description: `Viewing payment details for ${resident?.firstName} ${resident?.lastName}`,
                                    });
                                  }}
                                >
                                  View
                                </button>
                                <button 
                                  className="text-[#264653] hover:text-[#2A9D8F]"
                                  onClick={() => {
                                    toast({
                                      title: "Print receipt",
                                      description: "Generating receipt...",
                                    });
                                  }}
                                >
                                  Receipt
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {filteredPayments.length > 0 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
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
                          className={currentPage === pageNum ? "bg-[#2A9D8F]" : ""}
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold font-montserrat text-[#264653]">Invoices</h2>
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                  </Button>
                </div>
              </div>
              
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
                  <Inbox className="h-16 w-16" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No invoices yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Create and send invoices to residents. You can track payment status and send reminders.
                </p>
                <Button className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold font-montserrat text-[#264653]">Financial Reports</h2>
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Financial Reports Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  We're working on adding financial reporting capabilities. Check back soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Payment Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter payment details for the resident
            </DialogDescription>
          </DialogHeader>
          
          <PaymentForm 
            residents={residents || []}
            selectedResident={selectedResident}
            onSuccess={() => {
              setIsFormOpen(false);
              queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
              queryClient.invalidateQueries({ queryKey: ['/api/residents'] });
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
