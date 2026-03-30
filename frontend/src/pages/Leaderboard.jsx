import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/services/api";
import
{
    Trophy,
    Medal,
    Crown,
    Star,
    FileText,
    CheckCircle2,
    TrendingUp,
} from "lucide-react";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

export default function Leaderboard()
{
    const { user } = useSelector((state) => state.auth);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState("all");
    const [userRank, setUserRank] = useState(null);

    useEffect(() =>
    {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () =>
    {
        setIsLoading(true);
        try
        {
            const response = await api.get("/users/leaderboard", {
                params: { timeframe, limit: 50 },
            });
            if (response.data.success)
            {
                setLeaderboard(response.data.data);


                const currentUser = response.data.data.find((u) => u._id === user?._id);
                setUserRank(currentUser?.rank || null);
            }
        } catch (error)
        {
            console.error("Error fetching leaderboard:", error);
        } finally
        {
            setIsLoading(false);
        }
    };

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

    const getRankIcon = (rank) =>
    {
        if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
        if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
        return (
            <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
        );
    };

    const getRankBgClass = (rank) =>
    {
        if (rank === 1)
            return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300";
        if (rank === 2)
            return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300";
        if (rank === 3)
            return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300";
        return "";
    };

    const timeframeOptions = [
        { value: "all", label: "All Time" },
        { value: "month", label: "This Month" },
        { value: "week", label: "This Week" },
    ];

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Trophy className="h-8 w-8 text-yellow-500" />
                            Leaderboard
                        </h1>
                        <p className="text-muted-foreground">
                            Top contributors making a difference in the community
                        </p>
                    </div>
                </div>

                {user && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage
                                            src={
                                                user.profilePhoto
                                                    ? `/${user.profilePhoto}`
                                                    : undefined
                                            }
                                        />
                                        <AvatarFallback>
                                            {getInitials(user.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">Your Ranking</p>
                                        <p className="text-sm text-muted-foreground">
                                            Keep contributing to climb the ranks!
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-primary">
                                            #{userRank || "-"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Rank</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{user.points || 0}</p>
                                        <p className="text-xs text-muted-foreground">Points</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs value={timeframe} onValueChange={setTimeframe}>
                    <TabsList>
                        {timeframeOptions.map((option) => (
                            <TabsTrigger key={option.value} value={option.value}>
                                {option.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {!isLoading && leaderboard.length >= 3 && (
                    <div className="grid grid-cols-3 gap-4">
                        <Card className={`${getRankBgClass(2)} text-center pt-8`}>
                            <CardContent>
                                <div className="flex flex-col items-center">
                                    {getRankIcon(2)}
                                    <Avatar className="h-16 w-16 mt-2 border-4 border-gray-300">
                                        <AvatarImage
                                            src={
                                                leaderboard[1]?.profilePhoto
                                                    ? `/${leaderboard[1].profilePhoto}`
                                                    : undefined
                                            }
                                        />
                                        <AvatarFallback>
                                            {getInitials(leaderboard[1]?.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="font-medium mt-2">{leaderboard[1]?.username}</p>
                                    <Badge variant="secondary" className="mt-1">
                                        <Star className="h-3 w-3 mr-1" />
                                        {leaderboard[1]?.points || 0}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={`${getRankBgClass(1)} text-center -mt-4`}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center">
                                    {getRankIcon(1)}
                                    <Avatar className="h-20 w-20 mt-2 border-4 border-yellow-400">
                                        <AvatarImage
                                            src={
                                                leaderboard[0]?.profilePhoto
                                                    ? `/${leaderboard[0].profilePhoto}`
                                                    : undefined
                                            }
                                        />
                                        <AvatarFallback>
                                            {getInitials(leaderboard[0]?.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="font-bold text-lg mt-2">
                                        {leaderboard[0]?.username}
                                    </p>
                                    <Badge className="mt-1 bg-yellow-500">
                                        <Star className="h-3 w-3 mr-1" />
                                        {leaderboard[0]?.points || 0}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={`${getRankBgClass(3)} text-center pt-8`}>
                            <CardContent>
                                <div className="flex flex-col items-center">
                                    {getRankIcon(3)}
                                    <Avatar className="h-16 w-16 mt-2 border-4 border-amber-500">
                                        <AvatarImage
                                            src={
                                                leaderboard[2]?.profilePhoto
                                                    ? `/${leaderboard[2].profilePhoto}`
                                                    : undefined
                                            }
                                        />
                                        <AvatarFallback>
                                            {getInitials(leaderboard[2]?.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="font-medium mt-2">{leaderboard[2]?.username}</p>
                                    <Badge variant="secondary" className="mt-1">
                                        <Star className="h-3 w-3 mr-1" />
                                        {leaderboard[2]?.points || 0}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Rankings</CardTitle>
                        <CardDescription>
                            Citizens ranked by their contribution points
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-6 w-8" />
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20 mt-1" />
                                        </div>
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                ))}
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No rankings available yet</p>
                                <p className="text-sm">Be the first to report an issue!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {leaderboard.map((rankedUser, index) => (
                                    <div
                                        key={rankedUser._id}
                                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${rankedUser._id === user?._id
                                            ? "bg-primary/10 border border-primary/20"
                                            : "hover:bg-muted/50"
                                            } ${getRankBgClass(rankedUser.rank)}`}
                                    >
                                        <div className="w-10 flex justify-center">
                                            {getRankIcon(rankedUser.rank)}
                                        </div>

                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={
                                                    rankedUser.profilePhoto
                                                        ? `/${rankedUser.profilePhoto}`
                                                        : undefined
                                                }
                                            />
                                            <AvatarFallback>
                                                {getInitials(rankedUser.username)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium truncate">
                                                    {rankedUser.username}
                                                    {rankedUser._id === user?._id && (
                                                        <span className="text-primary ml-1">(You)</span>
                                                    )}
                                                </p>
                                                {rankedUser.achievements?.length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {rankedUser.achievements.length} badges
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    {rankedUser.issueCount} issues
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {rankedUser.resolvedCount} resolved
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-lg">{rankedUser.points}</p>
                                            <p className="text-xs text-muted-foreground">points</p>
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
