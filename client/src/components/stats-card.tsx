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
    iconBg: "bg-[#2A9D8F] bg-opacity-10",
    iconColor: "text-[#2A9D8F]"
  },
  peach: {
    iconBg: "bg-[#F4A261] bg-opacity-10",
    iconColor: "text-[#F4A261]"
  },
  gold: {
    iconBg: "bg-[#E9C46A] bg-opacity-10",
    iconColor: "text-[#E9C46A]"
  },
  red: {
    iconBg: "bg-red-100",
    iconColor: "text-red-500"
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
          <p className="text-2xl font-bold text-[#264653] font-montserrat mt-1">{value}</p>
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
            trend.isPositive ? "text-green-500" : "text-red-500"
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
