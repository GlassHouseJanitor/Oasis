import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: "teal" | "peach" | "gold" | "red";
  onClick?: () => void;
}

const colorSchemes = {
  teal: {
    iconBg: "bg-[#544d27] bg-opacity-10",
    iconColor: "text-[#544d27]"
  },
  peach: {
    iconBg: "bg-[#333232] bg-opacity-10",
    iconColor: "text-[#333232]"
  },
  gold: {
    iconBg: "bg-[#333232] bg-opacity-10",
    iconColor: "text-[#333232]"
  },
  red: {
    iconBg: "bg-[#333232] bg-opacity-10",
    iconColor: "text-[#333232]"
  }
};

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  colorScheme = "teal",
  onClick
}: StatsCardProps) {
  const { iconBg, iconColor } = colorSchemes[colorScheme];
  
  return (
    <div 
      className={cn(
        "bg-white p-4 rounded-lg shadow-sm border border-gray-100",
        onClick && "cursor-pointer hover:shadow-md transition-shadow"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-montserrat">{title}</p>
          <p className="text-2xl font-bold text-[#333232] font-montserrat mt-1">{value}</p>
        </div>
        <div className={cn("p-3 rounded-full", iconBg)}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </div>
      
      {trend && (
        <div className="mt-2 flex items-center">
          <span className={cn(
            "text-sm flex items-center",
            trend.isPositive ? "text-[#544d27]" : "text-[#333232]"
          )}>
            {trend.isPositive ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
