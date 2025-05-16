import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const notificationVariants = cva(
  "fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md transform transition-all duration-300",
  {
    variants: {
      state: {
        visible: "opacity-100 translate-y-0",
        hidden: "opacity-0 translate-y-2 pointer-events-none",
      },
    },
    defaultVariants: {
      state: "hidden",
    },
  }
);

export type NotificationType = "success" | "error" | "warning";

export interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Notification({
  type,
  title,
  message,
  isVisible,
  onClose,
}: NotificationProps) {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  // Icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "error":
        return <AlertCircle className="text-red-500" size={20} />;
      case "warning":
        return <AlertCircle className="text-yellow-500" size={20} />;
    }
  };

  if (!isVisible && !isShowing) return null;

  return (
    <div className={cn(notificationVariants({ state: isShowing ? "visible" : "hidden" }))}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
            onClick={() => {
              setIsShowing(false);
              setTimeout(onClose, 300);
            }}
          >
            <span className="sr-only">Close</span>
            <XCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
