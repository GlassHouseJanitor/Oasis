import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";
import { useEffect } from "react";
import { X } from "lucide-react";

interface SidebarProps {
  isMobileOpen: boolean;
  closeMobileSidebar: () => void;
}

type NavItem = {
  path: string;
  label: string;
  icon: JSX.Element;
};

export default function Sidebar({ isMobileOpen, closeMobileSidebar }: SidebarProps) {
  const [location] = useLocation();
  
  // Close sidebar when location changes on mobile
  useEffect(() => {
    closeMobileSidebar();
  }, [location, closeMobileSidebar]);

  const navItems: NavItem[] = [
    {
      path: "/",
      label: "Dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: "/housing",
      label: "Housing Management",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      path: "/residents",
      label: "Residents",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      path: "/inventory",
      label: "Inventory",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      path: "/finances",
      label: "Finances",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      path: "/communication",
      label: "Communication",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-[#264653] w-full md:w-64 md:min-h-screen flex-shrink-0 flex flex-col",
          "fixed inset-y-0 left-0 z-50 md:relative",
          "transform transition-transform duration-200 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex items-center justify-between md:justify-start">
          <div className="bg-white rounded-lg p-1 overflow-hidden">
            <Logo className="h-10 w-auto" />
          </div>
          <button 
            className="md:hidden text-white"
            onClick={closeMobileSidebar}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 flex-1">
          {navItems.map((item) => {
            const isActive = 
              (item.path === "/" && location === "/") || 
              (item.path !== "/" && location.startsWith(item.path));
            
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "nav-item p-3 flex items-center text-gray-300 hover:bg-[#2A9D8F] hover:text-white transition-colors",
                    isActive && "bg-[#2A9D8F] text-white"
                  )}
                >
                  {item.icon}
                  <span className="font-montserrat font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto p-4 border-t border-gray-700 hidden md:block">
          <div className="text-gray-300 text-sm">
            <div className="font-montserrat">Logged in as:</div>
            <div className="mt-1">Admin User</div>
          </div>
          <button className="mt-3 w-full py-2 bg-[#F4A261] text-white rounded-md font-montserrat font-medium hover:bg-opacity-90 transition-colors">
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
