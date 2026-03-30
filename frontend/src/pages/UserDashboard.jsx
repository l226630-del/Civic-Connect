import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getMyIssues } from "@/features/issues/issuesSlice";
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
    FileText,
    PlusCircle,
    Trophy,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";


const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

export default function UserDashboard()
{
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { myIssues, isLoading } = useSelector((state) => state.issues);

    useEffect(() =>
    {
        dispatch(getMyIssues({ limit: 5 }));
    }, [dispatch]);

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

    const stats = [
        {
            title: "Total Issues",
            value: myIssues.length,
            icon: FileText,
            description: "Issues you've reported",
        },
        {
            title: "Points Earned",
            value: user?.points || 0,
            icon: TrendingUp,
            description: "From community contributions",
        },
        {
            title: "Achievements",
            value: user?.achievements?.length || 0,
            icon: Trophy,
            description: "Badges earned",
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">

                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <Avatar className="h-16 w-16">
                            <AvatarImage
                                src={
                                    user?.profilePhoto
                                        ? `/${user.profilePhoto}`
                                        : undefined
                                }
                                alt={user?.username}
                            />
                            <AvatarFallback className="text-lg">
                                {getInitials(user?.username)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">
                                Welcome back, {user?.username}!
                            </h1>
                            <p className="text-muted-foreground">
                                {user?.bio ||
                                    "Help make your community better by reporting civic issues."}
                            </p>
                        </div>
                        <Link to="/issues/create" className="hidden lg:block">
                            <Button>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Report Issue
                            </Button>
                        </Link>
                    </CardContent>
                </Card>


                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>


                {user?.achievements && user.achievements.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Achievements</CardTitle>
                            <CardDescription>
                                Badges you've earned for your contributions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {user.achievements.map((achievement, index) => (
                                    <Badge key={index} variant="secondary" className="py-1 px-3">
                                        <Trophy className="h-3 w-3 mr-1" />
                                        {achievement.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent issues */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Your Recent Issues</CardTitle>
                            <CardDescription>Issues you've recently reported</CardDescription>
                        </div>
                        <Link to="/issues">
                            <Button variant="outline" size="sm">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : myIssues.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">No issues yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Start contributing by reporting your first civic issue
                                </p>
                                <Link to="/issues/create">
                                    <Button>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Report Issue
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myIssues.map((issue) => (
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
                                            <TableCell className="text-muted-foreground">
                                                {new Date(issue.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
