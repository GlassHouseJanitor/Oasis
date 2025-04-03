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
import Inventory from "@/pages/inventory";
import Finances from "@/pages/finances";
import Communication from "@/pages/communication";
import { useState } from "react";

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
            <Route path="/residents" component={Residents} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/finances" component={Finances} />
            <Route path="/communication" component={Communication} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
