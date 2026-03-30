import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import
{
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationDropdown from "@/components/NotificationDropdown";
import
{
    Menu,
    Home,
    FileText,
    PlusCircle,
    Trophy,
    User,
    Settings,
    LogOut,
    LayoutDashboard,
    Building2,
    BarChart3,
} from "lucide-react";
import { useState } from "react";

// Get base URL for static assets (strip /api suffix)
const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

export default function Navbar()
{
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () =>
    {
        dispatch(logout());
        navigate("/login");
    };

    const isAdmin = user?.role === "admin";

    const navLinks = [
        { to: "/dashboard", label: "Dashboard", icon: Home },
        { to: "/issues", label: "Issues", icon: FileText },
        { to: "/issues/create", label: "Report Issue", icon: PlusCircle },
        { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    ];

    const adminLinks = [
        { to: "/admin/dashboard", label: "Admin Panel", icon: LayoutDashboard },
        { to: "/admin/departments", label: "Departments", icon: Building2 },
        { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ];

    const getInitials = (name) =>
    {
        return (
            name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U"
        );
    };

    const NavLink = ({ to, label, icon: Icon, onClick }) =>
    {
        const isActive = location.pathname === to;
        return (
            <Link to={to} onClick={onClick}>
                <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                >
                    <Icon className="h-4 w-4" />
                    {label}
                </Button>
            </Link>
        );
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 flex h-14 items-center">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild className="lg:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-4">
                        <div className="flex flex-col gap-2 mt-4">
                            <h2 className="text-lg font-semibold mb-4">CivicConnect</h2>
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    {...link}
                                    onClick={() => setMobileMenuOpen(false)}
                                />
                            ))}
                            {isAdmin && (
                                <>
                                    <div className="my-2 border-t" />
                                    <p className="text-xs text-muted-foreground px-2 mb-1">
                                        Admin
                                    </p>
                                    {adminLinks.map((link) => (
                                        <NavLink
                                            key={link.to}
                                            {...link}
                                            onClick={() => setMobileMenuOpen(false)}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>

                <Link to="/dashboard" className="mr-6 flex items-center space-x-2">
                    <span className="font-bold text-xl">CivicConnect</span>
                </Link>

                <nav className="hidden lg:flex items-center space-x-1 flex-1 overflow-hidden">
                    {navLinks.map((link) =>
                    {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link key={link.to} to={link.to}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className="whitespace-nowrap"
                                >
                                    <link.icon className="h-4 w-4 lg:mr-2" />
                                    <span className="hidden xl:inline">{link.label}</span>
                                </Button>
                            </Link>
                        );
                    })}
                    {isAdmin && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Admin
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {adminLinks.map((link) => (
                                    <DropdownMenuItem key={link.to} asChild>
                                        <Link to={link.to} className="flex items-center gap-2">
                                            <link.icon className="h-4 w-4" />
                                            {link.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </nav>

                <div className="flex items-center gap-2">
                    <NotificationDropdown />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={
                                            user?.profilePhoto
                                                ? `/${user.profilePhoto}`
                                                : undefined
                                        }
                                        alt={user?.username}
                                    />
                                    <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/profile" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard" className="flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
