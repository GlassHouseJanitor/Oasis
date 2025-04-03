import { cn } from "@/lib/utils";

export type NotificationType = 'warning' | 'error' | 'success' | 'info';

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
}

const typeStyles: Record<NotificationType, { borderColor: string, bgColor: string }> = {
  error: { borderColor: 'border-[#b70b08]', bgColor: 'bg-red-50' },
  warning: { borderColor: 'border-[#deaf61]', bgColor: 'bg-yellow-50' },
  success: { borderColor: 'border-[#544d27]', bgColor: 'bg-green-50' },
  info: { borderColor: 'border-[#333232]', bgColor: 'bg-blue-50' }
};

export function NotificationItem({ 
  type, 
  title, 
  message, 
  timestamp, 
  actions 
}: NotificationItemProps) {
  const { borderColor, bgColor } = typeStyles[type];
  
  return (
    <div className={cn("p-3 border-l-4", borderColor, bgColor, "rounded-r")}>
      <div className="flex justify-between">
        <h3 className="font-montserrat font-medium">{title}</h3>
        <span className="text-gray-500 text-sm">{timestamp}</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{message}</p>
      
      {actions && (
        <div className="mt-2 flex space-x-2">
          {actions.primary && (
            <button 
              className="text-sm text-[#544d27] font-medium hover:underline"
              onClick={actions.primary.onClick}
            >
              {actions.primary.label}
            </button>
          )}
          {actions.secondary && (
            <button 
              className="text-sm text-[#333232] font-medium hover:underline"
              onClick={actions.secondary.onClick}
            >
              {actions.secondary.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
