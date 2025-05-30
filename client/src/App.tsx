import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import Housing from "@/pages/housing";
import Residents from "@/pages/residents";
import ResidentProfile from "@/pages/resident-profile";
import Inventory from "@/pages/inventory";
import Finances from "@/pages/finances";
import Communication from "@/pages/communication";
import ThemeSettings from "@/pages/theme-settings";
import HouseBuilderPage from "@/pages/house-builder";
import { useState, useEffect } from "react";
import { initializeTheme } from "@/lib/theme-manager";

function Router() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7FAFC]">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        closeMobileSidebar={() => setIsMobileSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/housing" component={Housing} />
            <Route path="/house-builder" component={HouseBuilderPage} />
            <Route path="/residents" component={Residents} />
            <Route path="/residents/:id" component={ResidentProfile} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/finances" component={Finances} />
            <Route path="/communication" component={Communication} />
            <Route path="/theme-settings" component={ThemeSettings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  // Initialize theme when application first loads
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
