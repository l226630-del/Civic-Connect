import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, getProfile } from "@/features/auth/authSlice";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/services/api";
import
{
    Camera,
    Trophy,
    Target,
    ThumbsUp,
    FileText,
    CheckCircle2,
    Star,
    Loader2,
    Edit,
    Save,
    X,
} from "lucide-react";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

export default function Profile()
{
    const dispatch = useDispatch();
    const { user, isLoading: authLoading } = useSelector((state) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [stats, setStats] = useState(null);
    const [achievements, setAchievements] = useState({
        earned: [],
        available: [],
    });
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        bio: "",
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() =>
    {
        if (user)
        {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                bio: user.bio || "",
            });
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () =>
    {
        setIsLoadingData(true);
        try
        {
            const [statsRes, achievementsRes] = await Promise.all([
                api.get("/users/stats"),
                api.get("/users/achievements"),
            ]);

            if (statsRes.data.success)
            {
                setStats(statsRes.data.data);
            }
            if (achievementsRes.data.success)
            {
                setAchievements(achievementsRes.data.data);
            }
        } catch (error)
        {
            console.error("Error fetching user data:", error);
        } finally
        {
            setIsLoadingData(false);
        }
    };

    const handleImageChange = (e) =>
    {
        const file = e.target.files[0];
        if (file)
        {
            if (file.size > 5 * 1024 * 1024)
            {
                toast.error("Image size must be less than 5MB");
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () =>
    {
        setIsSaving(true);
        try
        {
            const data = new FormData();
            data.append("username", formData.username);
            data.append("email", formData.email);
            data.append("bio", formData.bio);
            if (selectedImage)
            {
                data.append("image", selectedImage);
            }

            const result = await dispatch(updateProfile(data));
            if (updateProfile.fulfilled.match(result))
            {
                toast.success("Profile updated successfully");
                setIsEditing(false);
                setSelectedImage(null);
                setImagePreview(null);
            } else
            {
                toast.error(result.payload || "Failed to update profile");
            }
        } catch (error)
        {
            toast.error("Error updating profile");
        } finally
        {
            setIsSaving(false);
        }
    };

    const handleCancel = () =>
    {
        setFormData({
            username: user?.username || "",
            email: user?.email || "",
            bio: user?.bio || "",
        });
        setSelectedImage(null);
        setImagePreview(null);
        setIsEditing(false);
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

    const statCards = [
        {
            label: "Issues Reported",
            value: stats?.issuesCreated || 0,
            icon: FileText,
        },
        {
            label: "Issues Resolved",
            value: stats?.issuesResolved || 0,
            icon: CheckCircle2,
        },
        {
            label: "Upvotes Received",
            value: stats?.upvotesReceived || 0,
            icon: ThumbsUp,
        },
        { label: "Current Rank", value: `#${stats?.rank || "-"}`, icon: Trophy },
    ];

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6">

                            <div className="flex flex-col items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-32 w-32">
                                        <AvatarImage
                                            src={
                                                imagePreview ||
                                                (user?.profilePhoto
                                                    ? `/${user.profilePhoto}`
                                                    : undefined)
                                            }
                                        />
                                        <AvatarFallback className="text-3xl">
                                            {getInitials(user?.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isEditing && (
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute bottom-0 right-0 rounded-full"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="gap-1">
                                        <Star className="h-3 w-3" />
                                        {user?.points || 0} points
                                    </Badge>
                                </div>
                            </div>


                            <div className="flex-1 space-y-4">
                                {isEditing ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username</Label>
                                            <Input
                                                id="username"
                                                value={formData.username}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, username: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, email: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                value={formData.bio}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, bio: e.target.value })
                                                }
                                                placeholder="Tell us about yourself..."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleSave} disabled={isSaving}>
                                                {isSaving ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4 mr-2" />
                                                )}
                                                Save Changes
                                            </Button>
                                            <Button variant="outline" onClick={handleCancel}>
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h1 className="text-2xl font-bold">{user?.username}</h1>
                                                <p className="text-muted-foreground">{user?.email}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Profile
                                            </Button>
                                        </div>
                                        {user?.bio && (
                                            <p className="text-muted-foreground">{user.bio}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Member since{" "}
                                            {new Date(user?.createdAt).toLocaleDateString("en-US", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>


                <div className="grid gap-4 md:grid-cols-4">
                    {statCards.map((stat, index) => (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <stat.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>


                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Achievements
                        </CardTitle>
                        <CardDescription>
                            {achievements.earned.length} of{" "}
                            {achievements.earned.length + achievements.available.length}{" "}
                            unlocked
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="earned">
                            <TabsList>
                                <TabsTrigger value="earned">
                                    Earned ({achievements.earned.length})
                                </TabsTrigger>
                                <TabsTrigger value="available">
                                    Available ({achievements.available.length})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="earned" className="mt-4">
                                {isLoadingData ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {[...Array(4)].map((_, i) => (
                                            <Skeleton key={i} className="h-24" />
                                        ))}
                                    </div>
                                ) : achievements.earned.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No achievements earned yet</p>
                                        <p className="text-sm">
                                            Start reporting issues to earn badges!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {achievements.earned.map((achievement) => (
                                            <div
                                                key={achievement.id}
                                                className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border"
                                            >
                                                <span className="text-4xl">{achievement.icon}</span>
                                                <div className="flex-1">
                                                    <p className="font-medium">{achievement.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {achievement.description}
                                                    </p>
                                                    <Badge variant="secondary" className="mt-1">
                                                        +{achievement.points} pts
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="available" className="mt-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {achievements.available.map((achievement) => (
                                        <div
                                            key={achievement.id}
                                            className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-dashed opacity-75"
                                        >
                                            <span className="text-4xl grayscale">
                                                {achievement.icon}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-medium">{achievement.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {achievement.description}
                                                </p>
                                                <Badge variant="outline" className="mt-1">
                                                    +{achievement.points} pts
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
