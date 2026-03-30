import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import
    {
        getNotifications,
        getUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } from "@/features/notifications/notificationsSlice";
import MainLayout from "@/components/layout/MainLayout";
import
    {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import
    {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
        AlertDialogTrigger,
    } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import
    {
        Bell,
        CheckCircle2,
        AlertTriangle,
        MessageCircle,
        ThumbsUp,
        Trophy,
        Building2,
        Info,
        Trash2,
        CheckCheck,
    } from "lucide-react";

export default function Notifications()
{
    const dispatch = useDispatch();
    const { notifications, unreadCount, pagination, isLoading } = useSelector(
        (state) => state.notifications
    );

    useEffect(() =>
    {
        // Force refetch notifications when page loads
        dispatch(getNotifications({ limit: 50 }));
        dispatch(getUnreadCount());
    }, [dispatch]);

    // Poll for new notifications every 30 seconds
    useEffect(() =>
    {
        const interval = setInterval(() =>
        {
            dispatch(getNotifications({ limit: 50 }));
            dispatch(getUnreadCount());
        }, 30000);
        return () => clearInterval(interval);
    }, [dispatch]);

    const handleMarkAsRead = (id) =>
    {
        dispatch(markAsRead([id]));
    };

    const handleMarkAllAsRead = () =>
    {
        dispatch(markAllAsRead());
        toast.success("All notifications marked as read");
    };

    const handleDelete = (id) =>
    {
        dispatch(deleteNotification(id));
        toast.success("Notification deleted");
    };

    const getNotificationIcon = (type) =>
    {
        const icons = {
            status_update: CheckCircle2,
            department_assigned: Building2,
            new_comment: MessageCircle,
            upvote_milestone: ThumbsUp,
            achievement: Trophy,
            system: Info,
        };
        const Icon = icons[type] || Info;
        return <Icon className="h-5 w-5" />;
    };

    const getNotificationColor = (type) =>
    {
        const colors = {
            status_update: "text-green-500 bg-green-50",
            department_assigned: "text-blue-500 bg-blue-50",
            new_comment: "text-purple-500 bg-purple-50",
            upvote_milestone: "text-orange-500 bg-orange-50",
            achievement: "text-yellow-500 bg-yellow-50",
            system: "text-gray-500 bg-gray-50",
        };
        return colors[type] || "text-gray-500 bg-gray-50";
    };

    const formatDate = (date) =>
    {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days < 7) return `${days} days ago`;

        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
    };

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                        <p className="text-muted-foreground">
                            Stay updated on your reported issues
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={handleMarkAllAsRead}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark all as read
                        </Button>
                    )}
                </div>
                <div className="flex gap-4">
                    <Badge variant="secondary" className="text-sm py-1 px-3">
                        {pagination.total} total
                    </Badge>
                    {unreadCount > 0 && (
                        <Badge variant="default" className="text-sm py-1 px-3">
                            {unreadCount} unread
                        </Badge>
                    )}
                </div>

                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-4 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                <Bell className="h-12 w-12 mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">No notifications yet</h3>
                                <p className="text-sm">
                                    You'll receive notifications when there are updates on your
                                    issues
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-primary/5" : ""
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <div
                                                className={`p-2 rounded-full ${getNotificationColor(
                                                    notification.type
                                                )}`}
                                            >
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-medium">{notification.title}</p>
                                                        <p className="text-sm text-muted-foreground mt-0.5">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(notification.createdAt)}
                                                    </span>
                                                    {notification.issue && (
                                                        <Link
                                                            to={`/issues/${notification.issue._id || notification.issue
                                                                }`}
                                                            className="text-xs text-primary hover:underline"
                                                        >
                                                            View Issue
                                                        </Link>
                                                    )}
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification._id)}
                                                            className="text-xs text-primary hover:underline"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button className="text-xs text-destructive hover:underline">
                                                                Delete
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Delete notification?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This notification will be permanently deleted.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(notification._id)}
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
