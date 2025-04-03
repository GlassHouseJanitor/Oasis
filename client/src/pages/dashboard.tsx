import { useEffect, useState } from "react";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationItem } from "@/components/notification-item";
import { useQuery } from "@tanstack/react-query";
import { Home, CreditCard, AlertTriangle, Package2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

interface DashboardStats {
  totalHouses: number;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  totalResidents: number;
  overduePayments: number;
  pendingMaintenance: number;
  urgentMaintenance: number;
  lowInventoryItems: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  
  const {
    data: stats,
    isLoading,
    isError,
    error
  } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error loading dashboard",
        description: (error as Error)?.message || "Could not load dashboard statistics",
        variant: "destructive"
      });
    }
  }, [isError, error, toast]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-montserrat text-[#333232]">Dashboard</h1>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Occupancy"
          value={isLoading ? "Loading..." : `${stats?.occupancyRate || 0}%`}
          icon={<Home className="h-6 w-6" />}
          trend={
            stats?.occupancyRate ? {
              value: "5% from last month",
              isPositive: true
            } : undefined
          }
          colorScheme="teal"
          onClick={() => {
            window.location.href = "/housing";
          }}
        />
        
        <StatsCard
          title="Pending Payments"
          value={isLoading ? "Loading..." : stats?.overduePayments.toString() || "0"}
          icon={<CreditCard className="h-6 w-6" />}
          trend={
            stats?.overduePayments ? {
              value: `${stats.overduePayments} overdue`,
              isPositive: false
            } : undefined
          }
          colorScheme="peach"
          onClick={() => {
            window.location.href = "/finances";
          }}
        />
        
        <StatsCard
          title="Maintenance Requests"
          value={isLoading ? "Loading..." : stats?.pendingMaintenance.toString() || "0"}
          icon={<AlertTriangle className="h-6 w-6" />}
          colorScheme="gold"
          onClick={() => {
            window.location.href = "/housing";
          }}
        />
        
        <StatsCard
          title="Low Inventory Items"
          value={isLoading ? "Loading..." : stats?.lowInventoryItems.toString() || "0"}
          icon={<Package2 className="h-6 w-6" />}
          colorScheme="red"
          onClick={() => {
            window.location.href = "/inventory";
          }}
        />
      </div>
      
      {/* Notifications & Reminders */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold font-montserrat text-[#333232] mb-4">Notifications & Reminders</h2>
          
          <div className="space-y-4">
            <NotificationItem
              type="error"
              title="Rent Payment Overdue"
              message="Robert Davis is 5 days overdue on rent payment of $450."
              timestamp="2 days ago"
              actions={{
                primary: {
                  label: "Send Reminder",
                  onClick: () => {
                    window.location.href = "/communication";
                  }
                },
                secondary: {
                  label: "View Details",
                  onClick: () => {
                    window.location.href = "/finances";
                  }
                }
              }}
            />
            
            <NotificationItem
              type="warning"
              title="Maintenance Request"
              message="Room 6 has a reported plumbing issue that needs attention."
              timestamp="Yesterday"
              actions={{
                primary: {
                  label: "Schedule Repair",
                  onClick: () => {
                    toast({
                      title: "Maintenance scheduled",
                      description: "A repair has been scheduled for tomorrow"
                    });
                  }
                },
                secondary: {
                  label: "View Details",
                  onClick: () => {
                    window.location.href = "/housing";
                  }
                }
              }}
            />
            
            <NotificationItem
              type="success"
              title="New Applicant"
              message="A new applicant, David Brown, has completed the application process."
              timestamp="Today"
              actions={{
                primary: {
                  label: "Review Application",
                  onClick: () => {
                    window.location.href = "/residents";
                  }
                },
                secondary: {
                  label: "Schedule Interview",
                  onClick: () => {
                    toast({
                      title: "Interview scheduled",
                      description: "Interview scheduled for David Brown"
                    });
                  }
                }
              }}
            />
            
            <NotificationItem
              type="info"
              title="Inventory Alert"
              message={`${stats?.lowInventoryItems || 0} items in the inventory are running low and need to be reordered.`}
              timestamp="Today"
              actions={{
                primary: {
                  label: "View Items",
                  onClick: () => {
                    window.location.href = "/inventory";
                  }
                },
                secondary: {
                  label: "Order from Amazon",
                  onClick: () => {
                    window.location.href = "/inventory";
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
