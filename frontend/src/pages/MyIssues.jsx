import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
        MapPin,
        Calendar,
        ThumbsUp,
        Eye,
        Plus,
        FileText,
        Clock,
        CheckCircle,
        XCircle,
        AlertTriangle,
    } from "lucide-react";
import api from "@/services/api";
import { formatDistanceToNow } from "date-fns";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

const statusConfig = {
    pending: {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
    },
    "in-progress": {
        label: "In Progress",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: AlertTriangle,
    },
    resolved: {
        label: "Resolved",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
    },
    closed: {
        label: "Closed",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: XCircle,
    },
};

const priorityConfig = {
    low: { label: "Low", color: "bg-gray-100 text-gray-700" },
    medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
    high: { label: "High", color: "bg-orange-100 text-orange-700" },
    critical: { label: "Critical", color: "bg-red-100 text-red-700" },
};

function IssueCard({ issue })
{
    const status = statusConfig[issue.status] || statusConfig.pending;
    const priority = priorityConfig[issue.priority] || priorityConfig.medium;
    const StatusIcon = status.icon;

    return (
        <Link to={`/issues/${issue._id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        {issue.images?.[0] && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={`${API_URL}${issue.images[0]}`}
                                    alt={issue.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-semibold text-lg line-clamp-1">
                                    {issue.title}
                                </h3>
                                <Badge variant="outline" className={status.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {status.label}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                {issue.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="line-clamp-1">
                                        {issue.location?.address || "No address"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {formatDistanceToNow(new Date(issue.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>{issue.upvotes?.length || 0}</span>
                                </div>
                                <Badge variant="outline" className={priority.color}>
                                    {priority.label}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function IssueCardSkeleton()
{
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3 mb-3" />
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MyIssues()
{
    const { user } = useSelector((state) => state.auth);
    const [myIssues, setMyIssues] = useState([]);
    const [upvotedIssues, setUpvotedIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("created");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() =>
    {
        fetchIssues();
    }, []);

    const fetchIssues = async () =>
    {
        try
        {
            setLoading(true);
            const [myIssuesRes, allIssuesRes] = await Promise.all([
                api.get("/issues", { params: { creator: user?._id } }),
                api.get("/issues"),
            ]);

            setMyIssues(myIssuesRes.data.data || []);

            // Filter upvoted issues (issues where current user is in upvotes array)
            const upvoted = (allIssuesRes.data.data || []).filter((issue) =>
                issue.upvotes?.includes(user?._id)
            );
            setUpvotedIssues(upvoted);
        } catch (error)
        {
            console.error("Error fetching issues:", error);
        } finally
        {
            setLoading(false);
        }
    };

    const getFilteredIssues = (issues) =>
    {
        let filtered = [...issues];


        if (statusFilter !== "all")
        {
            filtered = filtered.filter((issue) => issue.status === statusFilter);
        }


        switch (sortBy)
        {
            case "newest":
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "oldest":
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "most-upvotes":
                filtered.sort(
                    (a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)
                );
                break;
            default:
                break;
        }

        return filtered;
    };

    const stats = {
        total: myIssues.length,
        pending: myIssues.filter((i) => i.status === "pending").length,
        inProgress: myIssues.filter((i) => i.status === "in-progress").length,
        resolved: myIssues.filter(
            (i) => i.status === "resolved" || i.status === "closed"
        ).length,
        totalUpvotes: myIssues.reduce(
            (sum, i) => sum + (i.upvotes?.length || 0),
            0
        ),
    };

    return (
        <MainLayout>
            <div className="container mx-auto py-6 px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">My Issues</h1>
                        <p className="text-muted-foreground">
                            Track and manage your reported issues
                        </p>
                    </div>
                    <Link to="/issues/create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Report Issue
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-xs text-muted-foreground">Total Issues</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <div className="text-xs text-muted-foreground">Pending</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                            <div className="text-2xl font-bold">{stats.inProgress}</div>
                            <div className="text-xs text-muted-foreground">In Progress</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                            <div className="text-2xl font-bold">{stats.resolved}</div>
                            <div className="text-xs text-muted-foreground">Resolved</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <ThumbsUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                            <div className="text-2xl font-bold">{stats.totalUpvotes}</div>
                            <div className="text-xs text-muted-foreground">Total Upvotes</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <TabsList>
                            <TabsTrigger value="created">
                                My Issues ({myIssues.length})
                            </TabsTrigger>
                            <TabsTrigger value="upvoted">
                                Upvoted ({upvotedIssues.length})
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="most-upvotes">Most Upvotes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <TabsContent value="created" className="space-y-4">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <IssueCardSkeleton key={i} />
                            ))
                        ) : getFilteredIssues(myIssues).length > 0 ? (
                            getFilteredIssues(myIssues).map((issue) => (
                                <IssueCard key={issue._id} issue={issue} />
                            ))
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="font-semibold mb-2">No issues found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {statusFilter !== "all"
                                            ? `You don't have any ${statusFilter} issues`
                                            : "You haven't reported any issues yet"}
                                    </p>
                                    <Link to="/issues/create">
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Report Your First Issue
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="upvoted" className="space-y-4">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <IssueCardSkeleton key={i} />
                            ))
                        ) : getFilteredIssues(upvotedIssues).length > 0 ? (
                            getFilteredIssues(upvotedIssues).map((issue) => (
                                <IssueCard key={issue._id} issue={issue} />
                            ))
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <ThumbsUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="font-semibold mb-2">No upvoted issues</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {statusFilter !== "all"
                                            ? `No ${statusFilter} issues you've upvoted`
                                            : "You haven't upvoted any issues yet"}
                                    </p>
                                    <Link to="/issues">
                                        <Button variant="outline">
                                            <Eye className="w-4 h-4 mr-2" />
                                            Browse Issues
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
