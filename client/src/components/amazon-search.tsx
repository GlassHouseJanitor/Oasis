import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "@shared/schema";
import { Search, ExternalLink, ShoppingCart, Check, Package2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface AmazonSearchProps {
  lowStockItems?: InventoryItem[];
}

interface AmazonProduct {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  url: string;
}

// Mock for demo purposes
const mockAmazonProducts: AmazonProduct[] = [
  {
    id: "1",
    name: "Toilet Paper, 24 Count",
    price: "$21.99",
    imageUrl: "https://via.placeholder.com/100",
    url: "https://www.amazon.com/dp/example1"
  },
  {
    id: "2",
    name: "Paper Towels, 12 Rolls",
    price: "$18.49",
    imageUrl: "https://via.placeholder.com/100",
    url: "https://www.amazon.com/dp/example2"
  },
  {
    id: "3",
    name: "Laundry Detergent, 100oz",
    price: "$14.97",
    imageUrl: "https://via.placeholder.com/100",
    url: "https://www.amazon.com/dp/example3"
  },
  {
    id: "4",
    name: "Dish Soap, 3 Pack",
    price: "$8.94",
    imageUrl: "https://via.placeholder.com/100",
    url: "https://www.amazon.com/dp/example4"
  }
];

export default function AmazonSearch({ lowStockItems }: AmazonSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<AmazonProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [orderedItems, setOrderedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const {
    data: houses,
    isLoading: isLoadingHouses,
  } = useQuery({
    queryKey: ['/api/houses'],
  });
  
  const handleSearch = () => {
    setIsSearching(true);
    
    // In a real implementation, this would be an API call to search Amazon products
    // For demo purposes, we'll use a mock and filter based on search term
    setTimeout(() => {
      const results = mockAmazonProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try different search terms",
        });
      }
    }, 1000);
  };
  
  const handleOrderItem = async (product: AmazonProduct) => {
    try {
      // In a real implementation, this would place an Amazon order or add to cart
      // For demo purposes, we'll just update our inventory
      
      // Find matching inventory item
      const matchingItem = lowStockItems?.find(item => 
        item.name.toLowerCase().includes(product.name.toLowerCase().split(",")[0]) ||
        product.name.toLowerCase().includes(item.name.toLowerCase())
      );
      
      if (matchingItem) {
        // Update inventory item with more quantity and the Amazon URL
        await apiRequest("PATCH", `/api/inventory/${matchingItem.id}`, {
          currentQuantity: matchingItem.currentQuantity + 10, // Adding 10 units for demo
          amazonUrl: product.url
        });
        
        // Invalidate inventory queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      } else {
        // Create new inventory item
        await apiRequest("POST", "/api/inventory", {
          name: product.name,
          category: "General",
          currentQuantity: 10,
          minimumQuantity: 5,
          amazonUrl: product.url,
          houseId: houses?.[0]?.id || 1,
        });
        
        // Invalidate inventory queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      }
      
      // Mark as ordered in UI
      setOrderedItems(prev => new Set(prev).add(product.id));
      
      toast({
        title: "Order Placed",
        description: `${product.name} has been ordered and inventory updated`,
      });
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <h2 className="text-lg font-semibold font-montserrat text-[#264653] mb-4">Order Supplies</h2>
      
      {/* Search Box */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for supplies on Amazon..."
              className="pl-10 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button 
            className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
      
      {/* Low Stock Items */}
      {lowStockItems && lowStockItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3">Low Stock Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockItems.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <Package2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.currentQuantity} of {item.minimumQuantity} min
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm(item.name);
                        handleSearch();
                      }}
                    >
                      Search
                    </Button>
                    {item.amazonUrl && (
                      <a 
                        href={item.amazonUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h3 className="text-md font-semibold mb-3">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center mr-3">
                      {/* In a real app, this would be an actual product image */}
                      <Package2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-[#2A9D8F] font-semibold">{product.price}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button 
                      size="sm"
                      className={orderedItems.has(product.id) 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-[#2A9D8F] hover:bg-[#2A9D8F]/90"
                      }
                      onClick={() => handleOrderItem(product)}
                      disabled={orderedItems.has(product.id)}
                    >
                      {orderedItems.has(product.id) ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Ordered
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Order
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!isSearching && searchResults.length === 0 && searchTerm === "" && !lowStockItems?.length && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
            <ShoppingCart className="h-16 w-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Search for Supplies</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Search for items to order from Amazon. Items will be added to your inventory automatically.
          </p>
        </div>
      )}
    </div>
  );
}
