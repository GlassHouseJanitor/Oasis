import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { 
  Search, 
  PlusCircle, 
  Package2, 
  AlertCircle,
  Edit,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface InventoryListProps {
  onOrderSupplies?: () => void;
}

const inventoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  currentQuantity: z.coerce.number().int().min(0, "Quantity must be a positive number"),
  minimumQuantity: z.coerce.number().int().min(0, "Minimum quantity must be a positive number"),
  amazonUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
  notes: z.string().optional(),
  houseId: z.coerce.number().positive("House ID is required"),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

export default function InventoryList({ onOrderSupplies }: InventoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const {
    data: inventoryItems,
    isLoading,
    isError,
    error,
  } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
  });
  
  const {
    data: houses,
    isLoading: isLoadingHouses,
  } = useQuery({
    queryKey: ['/api/houses'],
  });
  
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      category: "",
      currentQuantity: 0,
      minimumQuantity: 5,
      amazonUrl: "",
      notes: "",
      houseId: houses && houses.length > 0 ? houses[0].id : 1,
    },
  });
  
  // Filter inventory items based on search query
  const filteredItems = inventoryItems?.filter(item => {
    const query = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(query) || 
           item.category.toLowerCase().includes(query);
  }) || [];

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil((filteredItems?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
  
  // Get low stock items
  const lowStockItems = inventoryItems?.filter(
    item => item.currentQuantity < item.minimumQuantity
  ) || [];
  
  const handleAddItem = () => {
    setEditingItem(null);
    form.reset({
      name: "",
      category: "",
      currentQuantity: 0,
      minimumQuantity: 5,
      amazonUrl: "",
      notes: "",
      houseId: houses && houses.length > 0 ? houses[0].id : 1,
    });
    setIsDialogOpen(true);
  };
  
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      category: item.category,
      currentQuantity: item.currentQuantity,
      minimumQuantity: item.minimumQuantity,
      amazonUrl: item.amazonUrl || "",
      notes: item.notes || "",
      houseId: item.houseId,
    });
    setIsDialogOpen(true);
  };
  
  const handleDeleteItem = async (id: number) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      try {
        await apiRequest("DELETE", `/api/inventory/${id}`, undefined);
        queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
        toast({
          title: "Success",
          description: "Inventory item deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting inventory item:", error);
        toast({
          title: "Error",
          description: "Failed to delete inventory item",
          variant: "destructive",
        });
      }
    }
  };
  
  const onSubmit = async (values: InventoryFormValues) => {
    try {
      if (editingItem) {
        // Update existing item
        await apiRequest("PATCH", `/api/inventory/${editingItem.id}`, values);
        toast({
          title: "Success",
          description: "Inventory item updated successfully",
        });
      } else {
        // Create new item
        await apiRequest("POST", "/api/inventory", values);
        toast({
          title: "Success",
          description: "New inventory item added successfully",
        });
      }
      
      // Invalidate inventory queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error("Error saving inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to save inventory item",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold font-montserrat text-[#264653]">Inventory Items</h2>
          {lowStockItems.length > 0 && (
            <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs inline-flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {lowStockItems.length} low stock
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search inventory..."
              className="pl-9 pr-4 py-2 w-56"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button 
            className="bg-[#a3b68a] hover:bg-[#a3b68a]/90 text-white"
            onClick={handleAddItem}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>
      
      {lowStockItems.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-montserrat font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                Low Inventory Alert
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {lowStockItems.length} items are below minimum quantity and need to be reordered.
              </p>
            </div>
            <Button
              variant="outline"
              className="text-[#a3b68a] border-[#a3b68a]"
              onClick={onOrderSupplies}
            >
              Order Supplies
            </Button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Item Name</TableHead>
              <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Category</TableHead>
              <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Current Quantity</TableHead>
              <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Min. Quantity</TableHead>
              <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Status</TableHead>
              <TableHead className="text-xs font-montserrat font-semibold text-gray-500 uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading inventory items...</TableCell>
              </TableRow>
            ) : paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {searchQuery 
                    ? "No items match your search" 
                    : "No inventory items found"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map(item => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.currentQuantity}</TableCell>
                  <TableCell>{item.minimumQuantity}</TableCell>
                  <TableCell>
                    {item.currentQuantity < item.minimumQuantity ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs inline-block">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs inline-block">
                        In Stock
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button 
                        className="text-[#264653] hover:text-[#a3b68a]"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-[#264653] hover:text-red-500"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {item.amazonUrl && (
                        <a 
                          href={item.amazonUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {filteredItems.length > 0 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 mt-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} items
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
      
      {/* Add/Edit Inventory Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
            <DialogDescription>
              {editingItem 
                ? "Update inventory item information in the system."
                : "Enter the details of the new inventory item."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Toilet Paper" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Bathroom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minimumQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="amazonUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amazon URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.amazon.com/..." {...field} />
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
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional information" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="houseId"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#a3b68a] hover:bg-[#a3b68a]/90 text-white">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
