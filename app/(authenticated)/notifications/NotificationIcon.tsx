import { Bell, BellRing } from "lucide-react";

interface NotificationIconProps {
  hasUnreadNotifications: boolean;
}

const NotificationIcon = ({ hasUnreadNotifications }: NotificationIconProps) => {
  return (
    <div className="relative">
      {hasUnreadNotifications ? (
        <BellRing className="h-6 w-6 text-red-500 animate-bounce" />
      ) : (
        <Bell className="h-6 w-6" />
      )}
    </div>
  );
};

export default NotificationIcon;
