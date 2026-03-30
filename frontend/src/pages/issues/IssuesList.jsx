import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import
{
    getIssues,
    setFilters,
    clearFilters,
} from "@/features/issues/issuesSlice";
import { getDepartments } from "@/features/departments/departmentsSlice";
import MainLayout from "@/components/layout/MainLayout";
import
{
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import
{
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Search,
    Grid3X3,
    List,
    MapPin,
    ThumbsUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    PlusCircle,
    X,
} from "lucide-react";

export default function IssuesList()
{
    const dispatch = useDispatch();
    const { issues, pagination, filters, isLoading } = useSelector(
        (state) => state.issues
    );
    const { departments } = useSelector((state) => state.departments);
    const [viewMode, setViewMode] = useState("grid");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() =>
    {
        dispatch(getDepartments(true));
    }, [dispatch]);

    useEffect(() =>
    {
        dispatch(
            getIssues({
                ...filters,
                search: searchTerm || undefined,
                page: pagination.page,
                limit: 12,
            })
        );
    }, [dispatch, filters, searchTerm, pagination.page]);

    const handleFilterChange = (key, value) =>
    {
        dispatch(setFilters({ [key]: value === "all" ? "" : value }));
    };

    const handleClearFilters = () =>
    {
        dispatch(clearFilters());
        setSearchTerm("");
    };

    const getStatusBadge = (status) =>
    {
        const variants = {
            pending: {
                className: "bg-gray-100 text-gray-800 border-gray-200",
                icon: Clock,
                label: "Pending",
            },
            reported: {
                className: "bg-red-100 text-red-800 border-red-200",
                icon: AlertCircle,
                label: "Reported",
            },
            "in-progress": {
                className: "bg-blue-100 text-blue-800 border-blue-200",
                icon: AlertCircle,
                label: "In Progress",
            },
            resolved: {
                className: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle2,
                label: "Resolved",
            },
            closed: {
                className: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Clock,
                label: "Closed",
            },
        };
        const config = variants[status] || variants.pending;
        return (
            <Badge variant="outline" className={`gap-1 ${config.className}`}>
                <config.icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "pothole", label: "Pothole" },
        { value: "streetlight", label: "Street Light" },
        { value: "garbage", label: "Garbage" },
        { value: "water", label: "Water" },
        { value: "roads", label: "Roads" },
        { value: "other", label: "Other" },
    ];

    const statuses = [
        { value: "all", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "in-progress", label: "In Progress" },
        { value: "resolved", label: "Resolved" },
    ];

    const hasActiveFilters =
        filters.category || filters.status || filters.department || searchTerm;

    return (
        <MainLayout>
            <div className="space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Civic Issues</h1>
                        <p className="text-muted-foreground">
                            Browse and track issues reported in your community
                        </p>
                    </div>
                    <Link to="/issues/create">
                        <Button>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Report Issue
                        </Button>
                    </Link>
                </div>


                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search issues..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={filters.category || "all"}
                                onValueChange={(value) => handleFilterChange("category", value)}
                            >
                                <SelectTrigger className="w-full lg:w-40">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status || "all"}
                                onValueChange={(value) => handleFilterChange("status", value)}
                            >
                                <SelectTrigger className="w-full lg:w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.department || "all"}
                                onValueChange={(value) =>
                                    handleFilterChange("department", value)
                                }
                            >
                                <SelectTrigger className="w-full lg:w-48">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept._id} value={dept._id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                {hasActiveFilters && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleClearFilters}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant={viewMode === "grid" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {isLoading ? (
                    <div
                        className={
                            viewMode === "grid"
                                ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                                : "space-y-2"
                        }
                    >
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton
                                key={i}
                                className={viewMode === "grid" ? "h-64" : "h-16"}
                            />
                        ))}
                    </div>
                ) : issues.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No issues found</h3>
                            <p className="text-muted-foreground mb-4">
                                {hasActiveFilters
                                    ? "Try adjusting your filters"
                                    : "Be the first to report an issue in your community"}
                            </p>
                            {hasActiveFilters ? (
                                <Button variant="outline" onClick={handleClearFilters}>
                                    Clear Filters
                                </Button>
                            ) : (
                                <Link to="/issues/create">
                                    <Button>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Report Issue
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : viewMode === "grid" ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {issues.map((issue) => (
                            <Link key={issue._id} to={`/issues/${issue._id}`}>
                                <Card className="h-full hover:shadow-md transition-shadow">
                                    {issue.photos?.length > 0 && (
                                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                                            <img
                                                src={`/${issue.photos[0]}`}
                                                alt={issue.title}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-lg line-clamp-1">
                                                {issue.title}
                                            </CardTitle>
                                            {getStatusBadge(issue.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {issue.description}
                                        </p>
                                        {issue.location?.address && (
                                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span className="line-clamp-1">
                                                    {issue.location.address}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="pt-2">
                                        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                                            <Badge variant="outline" className="capitalize">
                                                {issue.category}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <ThumbsUp className="h-3 w-3" />
                                                {issue.upvoteCount || issue.upvotes?.length || 0}
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Upvotes</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {issues.map((issue) => (
                                    <TableRow key={issue._id}>
                                        <TableCell>
                                            <Link
                                                to={`/issues/${issue._id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {issue.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {issue.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(issue.status)}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-32 truncate">
                                            {issue.location?.address || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <ThumbsUp className="h-3 w-3" />
                                                {issue.upvoteCount || issue.upvotes?.length || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(issue.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}


                {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            disabled={pagination.page === 1}
                            onClick={() =>
                                dispatch(getIssues({ ...filters, page: pagination.page - 1 }))
                            }
                        >
                            Previous
                        </Button>
                        <span className="flex items-center px-4 text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={pagination.page === pagination.pages}
                            onClick={() =>
                                dispatch(getIssues({ ...filters, page: pagination.page + 1 }))
                            }
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
