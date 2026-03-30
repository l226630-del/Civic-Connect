import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import
{
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import
{
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import
{
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import
{
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import
{
    Users,
    Search,
    MoreVertical,
    Shield,
    UserCog,
    Building2,
    Ban,
    CheckCircle,
    Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import api from "@/services/api";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

const roleConfig = {
    citizen: {
        label: "Citizen",
        color: "bg-gray-100 text-gray-700",
        icon: Users,
    },
    admin: { label: "Admin", color: "bg-red-100 text-red-700", icon: Shield },
    department: {
        label: "Department",
        color: "bg-blue-100 text-blue-700",
        icon: Building2,
    },
};

export default function UserManagement()
{
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState("");

    useEffect(() =>
    {
        fetchUsers();
    }, []);

    const fetchUsers = async () =>
    {
        try
        {
            setLoading(true);
            const response = await api.get("/admin/users");
            setUsers(response.data.data || []);
        } catch (error)
        {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally
        {
            setLoading(false);
        }
    };

    const handleRoleChange = async () =>
    {
        if (!selectedUser || !newRole) return;

        try
        {
            await api.put(`/admin/users/${selectedUser._id}/role`, { role: newRole });
            setUsers(
                users.map((u) =>
                    u._id === selectedUser._id ? { ...u, role: newRole } : u
                )
            );
            toast.success(`User role updated to ${newRole}`);
            setRoleDialogOpen(false);
            setSelectedUser(null);
            setNewRole("");
        } catch (error)
        {
            toast.error(error.response?.data?.message || "Failed to update role");
        }
    };

    const openRoleDialog = (user) =>
    {
        setSelectedUser(user);
        setNewRole(user.role);
        setRoleDialogOpen(true);
    };

    const filteredUsers = users.filter((user) =>
    {
        const matchesSearch =
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        citizens: users.filter((u) => u.role === "citizen").length,
        admins: users.filter((u) => u.role === "admin").length,
        departments: users.filter((u) => u.role === "department").length,
    };

    return (
        <MainLayout>
            <div className="container mx-auto py-6 px-4">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCog className="w-6 h-6" />
                        User Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage user accounts and permissions
                    </p>
                </div>


                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <Users className="w-8 h-8 text-primary" />
                            <div>
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <div className="text-xs text-muted-foreground">Total Users</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <Users className="w-8 h-8 text-gray-500" />
                            <div>
                                <div className="text-2xl font-bold">{stats.citizens}</div>
                                <div className="text-xs text-muted-foreground">Citizens</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <Shield className="w-8 h-8 text-red-500" />
                            <div>
                                <div className="text-2xl font-bold">{stats.admins}</div>
                                <div className="text-xs text-muted-foreground">Admins</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className="text-2xl font-bold">{stats.departments}</div>
                                <div className="text-xs text-muted-foreground">Departments</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="citizen">Citizens</SelectItem>
                                    <SelectItem value="admin">Admins</SelectItem>
                                    <SelectItem value="department">Departments</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>


                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Points</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-muted-foreground">No users found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) =>
                                        {
                                            const role = roleConfig[user.role] || roleConfig.citizen;
                                            const RoleIcon = role.icon;
                                            return (
                                                <TableRow key={user._id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage
                                                                    src={
                                                                        user.profilePhoto
                                                                            ? `/${user.profilePhoto}`
                                                                            : undefined
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {user.username?.charAt(0).toUpperCase() ||
                                                                        "U"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-medium">
                                                                {user.username}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={role.color}>
                                                            <RoleIcon className="w-3 h-3 mr-1" />
                                                            {role.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Trophy className="w-4 h-4 text-yellow-500" />
                                                            {user.points || 0}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => openRoleDialog(user)}
                                                                >
                                                                    <Shield className="w-4 h-4 mr-2" />
                                                                    Change Role
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>


                <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change User Role</DialogTitle>
                            <DialogDescription>
                                Update the role for {selectedUser?.username}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="citizen">Citizen</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="department">Department</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setRoleDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleRoleChange}>Update Role</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
