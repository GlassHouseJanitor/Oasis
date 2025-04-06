import { Bell, Menu } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          className="md:hidden text-gray-500 mr-4" 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold font-montserrat text-[#333232]">Homestead</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-[#a3b68a]">
          <Bell className="h-6 w-6" />
        </button>
        
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-[#a3b68a] text-white flex items-center justify-center">
            <span className="font-medium text-sm">AU</span>
          </div>
        </div>
      </div>
    </header>
  );
}
