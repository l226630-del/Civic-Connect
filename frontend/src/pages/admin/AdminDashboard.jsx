import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getIssues, updateIssueStatus } from "@/features/issues/issuesSlice";
import { getDepartments } from "@/features/departments/departmentsSlice";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import
{
    AlertTriangle,
    CheckCircle2,
    Clock,
    XCircle,
    MoreHorizontal,
    Eye,
    Building2,
    Users,
    FileText,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import api from "@/services/api";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

export default function AdminDashboard()
{
    const dispatch = useDispatch();
    const { issues, isLoading } = useSelector((state) => state.issues);
    const { departments } = useSelector((state) => state.departments);

    const [stats, setStats] = useState({
        totalIssues: 0,
        reportedIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0,
        totalUsers: 0,
        totalDepartments: 0,
    });
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() =>
    {
        dispatch(getIssues({ limit: 50 }));
        dispatch(getDepartments(true));
        fetchStats();
    }, [dispatch]);

    const fetchStats = async () =>
    {
        try
        {
            const response = await api.get("/issues/stats");
            if (response.data.success)
            {
                setStats(response.data.data);
            }
        } catch (error)
        {

        }
    };

    useEffect(() =>
    {

        if (issues.length > 0)
        {
            setStats((prev) => ({
                ...prev,
                totalIssues: issues.length,
                reportedIssues: issues.filter((i) => i.status === "reported").length,
                inProgressIssues: issues.filter((i) => i.status === "in-progress")
                    .length,
                resolvedIssues: issues.filter(
                    (i) => i.status === "resolved" || i.status === "closed"
                ).length,
                totalDepartments: departments.length,
            }));
        }
    }, [issues, departments]);

    const handleStatusChange = async (issueId, newStatus) =>
    {
        try
        {
            await api.patch(`/issues/${issueId}/status`, { status: newStatus });
            dispatch(getIssues({ limit: 50 }));
            toast.success("Status updated successfully");
        } catch (error)
        {
            toast.error("Failed to update status");
        }
    };

    const handleDepartmentAssign = async (issueId, departmentId) =>
    {
        try
        {
            await api.patch(`/issues/${issueId}/assign`, { departmentId });
            dispatch(getIssues({ limit: 50 }));
            toast.success("Department assigned successfully");
        } catch (error)
        {
            toast.error("Failed to assign department");
        }
    };

    const getStatusBadge = (status) =>
    {
        const statusConfig = {
            pending: {
                label: "Pending",
                className: "bg-gray-100 text-gray-800 border-gray-200",
                icon: Clock,
            },
            reported: {
                label: "Reported",
                className: "bg-red-100 text-red-800 border-red-200",
                icon: AlertTriangle,
            },
            "in-progress": {
                label: "In Progress",
                className: "bg-blue-100 text-blue-800 border-blue-200",
                icon: Clock,
            },
            resolved: {
                label: "Resolved",
                className: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle2,
            },
            closed: {
                label: "Closed",
                className: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: XCircle,
            },
        };
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <Badge variant="outline" className={`gap-1 ${config.className}`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (date) =>
    {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const filteredIssues =
        statusFilter === "all"
            ? issues
            : issues.filter((issue) => issue.status === statusFilter);

    const statCards = [
        {
            title: "Total Issues",
            value: stats.totalIssues,
            icon: FileText,
            change: "+12%",
            trend: "up",
            description: "All reported issues",
        },
        {
            title: "Pending Review",
            value: stats.reportedIssues,
            icon: AlertTriangle,
            change: "-5%",
            trend: "down",
            description: "Awaiting action",
        },
        {
            title: "In Progress",
            value: stats.inProgressIssues,
            icon: Clock,
            change: "+8%",
            trend: "up",
            description: "Being addressed",
        },
        {
            title: "Resolved",
            value: stats.resolvedIssues,
            icon: CheckCircle2,
            change: "+15%",
            trend: "up",
            description: "Successfully closed",
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage civic issues and monitor community engagement
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link to="/admin/departments">
                                <Building2 className="h-4 w-4 mr-2" />
                                Departments
                            </Link>
                        </Button>
                    </div>
                </div>


                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    {stat.trend === "up" ? (
                                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                                    )}
                                    <span
                                        className={
                                            stat.trend === "up" ? "text-green-500" : "text-red-500"
                                        }
                                    >
                                        {stat.change}
                                    </span>
                                    <span className="ml-1">from last month</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>


                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Issues Management</CardTitle>
                                <CardDescription>
                                    Review, assign, and update status of reported issues
                                </CardDescription>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="reported">Reported</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Issue</TableHead>
                                        <TableHead>Reporter</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredIssues.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <p className="text-muted-foreground">No issues found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredIssues.map((issue) => (
                                            <TableRow key={issue._id}>
                                                <TableCell>
                                                    <div className="max-w-[200px]">
                                                        <Link
                                                            to={`/issues/${issue._id}`}
                                                            className="font-medium hover:underline line-clamp-1"
                                                        >
                                                            {issue.title}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                                            {issue.location?.address || "No address"}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage
                                                                src={
                                                                    issue.creator?.profilePhoto
                                                                        ? `/${issue.creator.profilePhoto}`
                                                                        : undefined
                                                                }
                                                            />
                                                            <AvatarFallback className="text-xs">
                                                                {issue.creator?.username
                                                                    ?.charAt(0)
                                                                    .toUpperCase() || "U"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">
                                                            {issue.creator?.username}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {issue.category?.charAt(0).toUpperCase() +
                                                            issue.category?.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={issue.status}
                                                        onValueChange={(value) =>
                                                            handleStatusChange(issue._id, value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[130px] h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="reported">Reported</SelectItem>
                                                            <SelectItem value="in-progress">
                                                                In Progress
                                                            </SelectItem>
                                                            <SelectItem value="resolved">Resolved</SelectItem>
                                                            <SelectItem value="closed">Closed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={issue.department?._id || "unassigned"}
                                                        onValueChange={(value) =>
                                                            value !== "unassigned" &&
                                                            handleDepartmentAssign(issue._id, value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[150px] h-8">
                                                            <SelectValue placeholder="Assign..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="unassigned" disabled>
                                                                Unassigned
                                                            </SelectItem>
                                                            {departments.map((dept) => (
                                                                <SelectItem key={dept._id} value={dept._id}>
                                                                    {dept.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(issue.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild>
                                                                <Link to={`/issues/${issue._id}`}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>


                <div className="grid gap-4 md:grid-cols-2">

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest reported issues</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {issues.slice(0, 5).map((issue) => (
                                    <div key={issue._id} className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={
                                                    issue.creator?.profilePhoto
                                                        ? `/${issue.creator.profilePhoto}`
                                                        : undefined
                                                }
                                            />
                                            <AvatarFallback className="text-xs">
                                                {issue.creator?.username?.charAt(0).toUpperCase() ||
                                                    "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={`/issues/${issue._id}`}
                                                className="font-medium text-sm hover:underline line-clamp-1"
                                            >
                                                {issue.title}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                by {issue.creator?.username} •{" "}
                                                {formatDate(issue.createdAt)}
                                            </p>
                                        </div>
                                        {getStatusBadge(issue.status)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader>
                            <CardTitle>Departments Overview</CardTitle>
                            <CardDescription>
                                Issue distribution by department
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {departments.slice(0, 5).map((dept) =>
                                {
                                    const deptIssues = issues.filter(
                                        (i) => i.department?._id === dept._id
                                    ).length;
                                    const percentage =
                                        issues.length > 0
                                            ? Math.round((deptIssues / issues.length) * 100)
                                            : 0;

                                    return (
                                        <div key={dept._id} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{dept.name}</span>
                                                <span className="text-muted-foreground">
                                                    {deptIssues} issues
                                                </span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {departments.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No departments created yet
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
