import React, { createContext, useContext, useState } from "react";
import { Notification, NotificationType } from "@/components/Notification";

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationContextValue {
  showNotification: (data: NotificationData) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = (data: NotificationData) => {
    setNotification(data);
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isVisible={isVisible}
          onClose={handleClose}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
