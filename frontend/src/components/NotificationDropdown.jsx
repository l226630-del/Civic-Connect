import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/features/notifications/notificationsSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  ThumbsUp,
  Trophy,
  Building2,
  Info,
} from "lucide-react";

export default function NotificationDropdown() {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(getUnreadCount());
    dispatch(getNotifications({ limit: 10 }));
  }, [dispatch]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead([id]));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type) => {
    const icons = {
      status_update: CheckCircle2,
      department_assigned: Building2,
      new_comment: MessageCircle,
      upvote_milestone: ThumbsUp,
      achievement: Trophy,
      system: Info,
    };
    const Icon = icons[type] || Info;
    return <Icon className="h-4 w-4" />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      status_update: "text-green-500",
      department_assigned: "text-blue-500",
      new_comment: "text-purple-500",
      upvote_milestone: "text-orange-500",
      achievement: "text-yellow-500",
      system: "text-muted-foreground",
    };
    return colors[type] || "text-muted-foreground";
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-muted/30" : ""
                  }`}
                  onClick={() =>
                    !notification.read && handleMarkAsRead(notification._id)
                  }
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-0.5 ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                        {notification.issue && (
                          <Link
                            to={`/issues/${
                              notification.issue._id || notification.issue
                            }`}
                            className="text-xs text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Issue
                          </Link>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Link to="/notifications">
            <Button variant="ghost" className="w-full text-sm">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
