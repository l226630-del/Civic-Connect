import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import
    {
        Home,
        FileText,
        PlusCircle,
        Trophy,
        User,
        Bell,
        LayoutDashboard,
        Building2,
        BarChart3,
        ClipboardList,
        Users,
    } from "lucide-react";

export default function Sidebar()
{
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const { unreadCount } = useSelector((state) => state.notifications);

    const isAdmin = user?.role === "admin";

    const navLinks = [
        { to: "/dashboard", label: "Dashboard", icon: Home },
        { to: "/issues", label: "Browse Issues", icon: FileText },
        { to: "/issues/create", label: "Report Issue", icon: PlusCircle },
        { to: "/my-issues", label: "My Issues", icon: ClipboardList },
        {
            to: "/notifications",
            label: "Notifications",
            icon: Bell,
            badge: unreadCount,
        },
        { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
        { to: "/profile", label: "My Profile", icon: User },
    ];

    const adminLinks = [
        { to: "/admin/dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
        { to: "/admin/departments", label: "Departments", icon: Building2 },
        { to: "/admin/users", label: "User Management", icon: Users },
        { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ];

    const NavLink = ({ to, label, icon: Icon, badge }) =>
    {
        const isActive = location.pathname === to;
        return (
            <Link to={to}>
                <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                >
                    <Icon className="h-4 w-4" />
                    {label}
                    {badge > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                            {badge > 9 ? "9+" : badge}
                        </Badge>
                    )}
                </Button>
            </Link>
        );
    };

    return (
        <aside className="hidden lg:flex w-64 flex-col border-r bg-background">
            <ScrollArea className="flex-1 px-3 py-4">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                        Navigation
                    </p>
                    {navLinks.map((link) => (
                        <NavLink key={link.to} {...link} />
                    ))}
                </div>

                {isAdmin && (
                    <>
                        <Separator className="my-4" />
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                                Administration
                            </p>
                            {adminLinks.map((link) => (
                                <NavLink key={link.to} {...link} />
                            ))}
                        </div>
                    </>
                )}
            </ScrollArea>

            <div className="border-t p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Points</span>
                    <span className="font-semibold">{user?.points || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Achievements</span>
                    <span className="font-semibold">
                        {user?.achievements?.length || 0}
                    </span>
                </div>
            </div>
        </aside>
    );
}
