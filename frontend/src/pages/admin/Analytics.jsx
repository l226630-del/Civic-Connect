import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        BarChart3,
        TrendingUp,
        Clock,
        CheckCircle,
        FileText,
        Users,
        Building2,
        AlertTriangle,
    } from "lucide-react";
import
    {
        BarChart,
        Bar,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        ResponsiveContainer,
        PieChart,
        Pie,
        Cell,
        LineChart,
        Line,
        Legend,
    } from "recharts";
import { toast } from "sonner";
import api from "@/services/api";

const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
];

const priorityColors = {
    low: "#22c55e",
    medium: "#eab308",
    high: "#f97316",
    critical: "#ef4444",
};

export default function Analytics()
{
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("30");
    const [data, setData] = useState(null);

    useEffect(() =>
    {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () =>
    {
        try
        {
            setLoading(true);
            const response = await api.get("/admin/analytics", {
                params: { period },
            });
            setData(response.data.data);
        } catch (error)
        {
            console.error("Error fetching analytics:", error);
            toast.error("Failed to fetch analytics");
        } finally
        {
            setLoading(false);
        }
    };

    const formatCategoryData = (categories) =>
    {
        if (!categories) return [];
        return categories.map((cat) => ({
            name: cat._id || "Uncategorized",
            value: cat.count,
        }));
    };

    const formatPriorityData = (priorities) =>
    {
        if (!priorities) return [];
        return priorities.map((p) => ({
            name: p._id || "Unknown",
            value: p.count,
            fill: priorityColors[p._id] || "#8884D8",
        }));
    };

    const formatDepartmentData = (departments) =>
    {
        if (!departments) return [];
        return departments.map((d) => ({
            name: d._id || "Unassigned",
            total: d.count,
            resolved: d.resolved,
        }));
    };

    if (loading)
    {
        return (
            <MainLayout>
                <div className="container mx-auto py-6 px-4">
                    <div className="mb-6">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-24" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-80" />
                        ))}
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container mx-auto py-6 px-4">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="w-6 h-6" />
                            Analytics Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Insights and statistics for civic issues
                        </p>
                    </div>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Time period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {data?.avgResolutionTime || 0} days
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Avg Resolution Time
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {data?.issuesByDay?.reduce((sum, d) => sum + d.count, 0) || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Issues in Period
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {data?.userGrowth?.reduce((sum, d) => sum + d.count, 0) || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    New Users in Period
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Building2 className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {data?.issuesByDepartment?.length || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Active Departments
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Issues Over Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data?.issuesByDay || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="_id"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) =>
                                        {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        labelFormatter={(value) =>
                                            new Date(value).toLocaleDateString()
                                        }
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#0088FE"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        name="Issues"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Issues by Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={formatCategoryData(data?.issuesByCategory)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} (${(percent * 100).toFixed(0)}%)`
                                        }
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {formatCategoryData(data?.issuesByCategory).map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            )
                                        )}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Issues by Priority
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={formatPriorityData(data?.issuesByPriority)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Issues">
                                        {formatPriorityData(data?.issuesByPriority).map(
                                            (entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            )
                                        )}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Department Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={formatDepartmentData(data?.issuesByDepartment)}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tick={{ fontSize: 12 }} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 12 }}
                                        width={100}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total" fill="#8884d8" name="Total Issues" />
                                    <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>


                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                User Registration Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={data?.userGrowth || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="_id"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) =>
                                        {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        labelFormatter={(value) =>
                                            new Date(value).toLocaleDateString()
                                        }
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        name="New Users"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
