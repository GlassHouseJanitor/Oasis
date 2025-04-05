import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import InventoryList from "@/components/inventory-list";
import AmazonSearch from "@/components/amazon-search";
import { InventoryItem } from "@shared/schema";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("inventory");
  const { toast } = useToast();
  
  const {
    data: inventoryItems,
    isLoading,
    isError,
    error
  } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
  });
  
  // Count low stock items
  const lowStockCount = inventoryItems?.filter(
    item => item.currentQuantity < item.minimumQuantity
  ).length || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-montserrat text-[#264653]">Inventory Management</h1>
      
      <Tabs 
        defaultValue="inventory" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
          <TabsTrigger value="order">
            Order Supplies
            {lowStockCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {lowStockCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <InventoryList 
                onOrderSupplies={() => setActiveTab("order")}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="order" className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <AmazonSearch 
                lowStockItems={inventoryItems?.filter(
                  item => item.currentQuantity < item.minimumQuantity
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
