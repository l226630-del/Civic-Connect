import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import
{
    getIssue,
    toggleUpvote,
    deleteIssue,
} from "@/features/issues/issuesSlice";
import MainLayout from "@/components/layout/MainLayout";
import Comments from "@/components/Comments";
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
import { Separator } from "@/components/ui/separator";
import
{
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import
{
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import
{
    ArrowLeft,
    MapPin,
    Calendar,
    ThumbsUp,
    MessageCircle,
    Share2,
    Trash2,
    Edit,
    Building2,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    Clock,
    XCircle,
    Download,
    MessageSquare,
    Link,
} from "lucide-react";
import jsPDF from "jspdf";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

export default function IssueDetail()
{
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentIssue: issue, isLoading } = useSelector(
        (state) => state.issues
    );
    const { user } = useSelector((state) => state.auth);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() =>
    {
        dispatch(getIssue(id));
    }, [dispatch, id]);

    const handleUpvote = async () =>
    {
        const result = await dispatch(toggleUpvote(id));
        if (toggleUpvote.fulfilled.match(result))
        {

            dispatch(getIssue(id));
            toast.success(
                result.payload.hasUpvoted ? "Issue upvoted!" : "Upvote removed"
            );
        }
    };

    const handleDelete = async () =>
    {
        const result = await dispatch(deleteIssue(id));
        if (deleteIssue.fulfilled.match(result))
        {
            toast.success("Issue deleted successfully");
            navigate("/issues");
        } else
        {
            toast.error("Failed to delete issue");
        }
    };

    const handleCopyLink = () =>
    {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    const generatePDF = async () =>
    {
        if (!issue) return;

        toast.loading("Generating PDF...", { id: "pdf-loading" });

        try
        {
            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;
            let yPosition = 20;

            // Header
            pdf.setFontSize(24);
            pdf.setTextColor(33, 37, 41);
            pdf.text("CivicConnect", margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(12);
            pdf.setTextColor(108, 117, 125);
            pdf.text("Issue Report", margin, yPosition);
            yPosition += 15;

            // Draw a line
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;

            // Title
            pdf.setFontSize(18);
            pdf.setTextColor(33, 37, 41);
            const titleLines = pdf.splitTextToSize(
                issue.title,
                pageWidth - 2 * margin
            );
            pdf.text(titleLines, margin, yPosition);
            yPosition += titleLines.length * 8 + 10;

            // Status and Category
            pdf.setFontSize(11);
            pdf.setTextColor(108, 117, 125);
            pdf.text(
                `Status: ${issue.status?.charAt(0).toUpperCase() + issue.status?.slice(1)
                }`,
                margin,
                yPosition
            );
            yPosition += 7;
            pdf.text(
                `Category: ${issue.category?.charAt(0).toUpperCase() + issue.category?.slice(1)
                }`,
                margin,
                yPosition
            );
            yPosition += 15;

            // Description
            pdf.setFontSize(14);
            pdf.setTextColor(33, 37, 41);
            pdf.text("Description", margin, yPosition);
            yPosition += 8;

            pdf.setFontSize(11);
            pdf.setTextColor(73, 80, 87);
            const descLines = pdf.splitTextToSize(
                issue.description,
                pageWidth - 2 * margin
            );
            pdf.text(descLines, margin, yPosition);
            yPosition += descLines.length * 6 + 15;

            // Location
            if (issue.location?.address || issue.location?.coordinates)
            {
                pdf.setFontSize(14);
                pdf.setTextColor(33, 37, 41);
                pdf.text("Location", margin, yPosition);
                yPosition += 8;

                pdf.setFontSize(11);
                pdf.setTextColor(73, 80, 87);
                const locationText =
                    issue.location?.address ||
                    `Coordinates: ${issue.location?.coordinates?.[1]?.toFixed(
                        6
                    )}, ${issue.location?.coordinates?.[0]?.toFixed(6)}`;
                const locationLines = pdf.splitTextToSize(
                    locationText,
                    pageWidth - 2 * margin
                );
                pdf.text(locationLines, margin, yPosition);
                yPosition += locationLines.length * 6 + 15;
            }

            // Reporter Info
            pdf.setFontSize(14);
            pdf.setTextColor(33, 37, 41);
            pdf.text("Reported By", margin, yPosition);
            yPosition += 8;

            pdf.setFontSize(11);
            pdf.setTextColor(73, 80, 87);
            pdf.text(`${issue.creator?.username || "Anonymous"}`, margin, yPosition);
            yPosition += 15;


            if (issue.department?.name)
            {
                pdf.setFontSize(14);
                pdf.setTextColor(33, 37, 41);
                pdf.text("Assigned Department", margin, yPosition);
                yPosition += 8;

                pdf.setFontSize(11);
                pdf.setTextColor(73, 80, 87);
                pdf.text(issue.department.name, margin, yPosition);
                if (issue.department.email)
                {
                    yPosition += 6;
                    pdf.text(issue.department.email, margin, yPosition);
                }
                yPosition += 15;
            }


            pdf.setFontSize(14);
            pdf.setTextColor(33, 37, 41);
            pdf.text("Timeline", margin, yPosition);
            yPosition += 8;

            pdf.setFontSize(11);
            pdf.setTextColor(73, 80, 87);
            pdf.text(`Created: ${formatDate(issue.createdAt)}`, margin, yPosition);
            yPosition += 6;
            if (issue.updatedAt !== issue.createdAt)
            {
                pdf.text(
                    `Last Updated: ${formatDate(issue.updatedAt)}`,
                    margin,
                    yPosition
                );
                yPosition += 6;
            }
            yPosition += 15;


            pdf.setFontSize(14);
            pdf.setTextColor(33, 37, 41);
            pdf.text("Engagement", margin, yPosition);
            yPosition += 8;

            pdf.setFontSize(11);
            pdf.setTextColor(73, 80, 87);
            pdf.text(`Upvotes: ${issue.upvotes?.length || 0}`, margin, yPosition);
            yPosition += 6;
            pdf.text(`Comments: ${issue.comments?.length || 0}`, margin, yPosition);
            yPosition += 20;


            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            pdf.setTextColor(108, 117, 125);
            pdf.text(
                `Generated on ${new Date().toLocaleDateString()}`,
                margin,
                yPosition
            );
            pdf.text(`View online: ${window.location.href}`, margin, yPosition + 5);

            toast.dismiss("pdf-loading");
            return pdf;
        } catch (error)
        {
            toast.dismiss("pdf-loading");
            toast.error("Failed to generate PDF");
            console.error("PDF generation error:", error);
            return null;
        }
    };

    const handleDownloadPDF = async () =>
    {
        const pdf = await generatePDF();
        if (pdf)
        {
            const filename = `issue-${issue.title
                .substring(0, 30)
                .replace(/[^a-z0-9]/gi, "_")}-${id}.pdf`;
            pdf.save(filename);
            toast.success("PDF downloaded successfully!");
        }
    };

    const handleShareWhatsApp = async () =>
    {
        const pdf = await generatePDF();
        if (pdf)
        {
            // Generate a message with issue details
            const message = encodeURIComponent(
                `🚨 *CivicConnect Issue Report*\n\n` +
                `*${issue.title}*\n\n` +
                `📋 Status: ${issue.status?.charAt(0).toUpperCase() + issue.status?.slice(1)
                }\n` +
                `🏷️ Category: ${issue.category?.charAt(0).toUpperCase() + issue.category?.slice(1)
                }\n` +
                `📍 Location: ${issue.location?.address || "View on app"}\n\n` +
                `📝 ${issue.description?.substring(0, 200)}${issue.description?.length > 200 ? "..." : ""
                }\n\n` +
                `👤 Reported by: ${issue.creator?.username || "Anonymous"}\n` +
                `👍 Upvotes: ${issue.upvotes?.length || 0}\n\n` +
                `🔗 View full details: ${window.location.href}`
            );

            // Download the PDF first
            const filename = `issue-${issue.title
                .substring(0, 30)
                .replace(/[^a-z0-9]/gi, "_")}-${id}.pdf`;
            pdf.save(filename);

            // Open WhatsApp with the message
            window.open(`https://wa.me/?text=${message}`, "_blank");
            toast.success(
                "PDF downloaded! Share it via WhatsApp along with the message."
            );
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

    const getCategoryBadge = (category) =>
    {
        const colors = {
            pothole: "bg-orange-100 text-orange-800",
            streetlight: "bg-yellow-100 text-yellow-800",
            garbage: "bg-green-100 text-green-800",
            water: "bg-blue-100 text-blue-800",
            roads: "bg-gray-100 text-gray-800",
            other: "bg-purple-100 text-purple-800",
        };
        return (
            <Badge className={colors[category] || colors.other}>
                {category?.charAt(0).toUpperCase() + category?.slice(1)}
            </Badge>
        );
    };

    const formatDate = (date) =>
    {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isOwner = user?._id === issue?.creator?._id;
    const isAdmin = user?.role === "admin";
    const hasUpvoted = issue?.upvotes?.includes(user?._id);

    if (isLoading || !issue)
    {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{issue.title}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(issue.createdAt)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(issue.status)}
                        {getCategoryBadge(issue.category)}
                    </div>
                </div>


                {issue.photos?.length > 0 && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="relative aspect-video">
                                <img
                                    src={`${API_URL}${issue.photos[currentImageIndex]}`}
                                    alt={`Issue photo ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                {issue.photos.length > 1 && (
                                    <>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute left-2 top-1/2 -translate-y-1/2"
                                            onClick={() =>
                                                setCurrentImageIndex((prev) =>
                                                    prev === 0 ? issue.photos.length - 1 : prev - 1
                                                )
                                            }
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2"
                                            onClick={() =>
                                                setCurrentImageIndex((prev) =>
                                                    prev === issue.photos.length - 1 ? 0 : prev + 1
                                                )
                                            }
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                            {issue.photos.map((_, index) => (
                                                <button
                                                    key={index}
                                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex
                                                        ? "bg-white"
                                                        : "bg-white/50"
                                                        }`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid md:grid-cols-3 gap-6">

                    <div className="md:col-span-2 space-y-6">

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{issue.description}</p>
                            </CardContent>
                        </Card>


                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {issue.location?.address ||
                                        `${issue.location?.coordinates?.[1]?.toFixed(
                                            6
                                        )}, ${issue.location?.coordinates?.[0]?.toFixed(6)}`}
                                </p>
                                {issue.location?.coordinates && (
                                    <a
                                        href={`https://maps.google.com/?q=${issue.location.coordinates[1]},${issue.location.coordinates[0]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary text-sm hover:underline mt-2 inline-block"
                                    >
                                        View on Google Maps →
                                    </a>
                                )}
                            </CardContent>
                        </Card>


                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant={hasUpvoted ? "default" : "outline"}
                                            size="sm"
                                            onClick={handleUpvote}
                                            className="gap-2"
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            {issue.upvotes?.length || 0}
                                        </Button>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <MessageCircle className="h-4 w-4" />
                                            {issue.comments?.length || 0}
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Share2 className="h-4 w-4" />
                                                    Share
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuItem onClick={handleDownloadPDF}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={handleShareWhatsApp}>
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    Share to WhatsApp
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={handleCopyLink}>
                                                    <Link className="h-4 w-4 mr-2" />
                                                    Copy Link
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {(isOwner || isAdmin) && (
                                        <div className="flex items-center gap-2">
                                            {isOwner && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/issues/${id}/edit`)}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Delete this issue?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will
                                                            permanently delete this issue and remove all
                                                            associated data.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDelete}>
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>


                        <Card>
                            <CardContent className="p-6">
                                <Comments issueId={id} />
                            </CardContent>
                        </Card>
                    </div>


                    <div className="space-y-6">

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Reported By</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage
                                            src={
                                                issue.creator?.profilePhoto
                                                    ? `/${issue.creator.profilePhoto}`
                                                    : undefined
                                            }
                                        />
                                        <AvatarFallback>
                                            {issue.creator?.username?.charAt(0).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{issue.creator?.username}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {issue.creator?.points || 0} points
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {issue.department && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Assigned Department
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">{issue.department.name}</p>
                                    {issue.department.email && (
                                        <a
                                            href={`mailto:${issue.department.email}`}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {issue.department.email}
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        )}


                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                        <div>
                                            <p className="text-sm font-medium">Issue Created</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(issue.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    {issue.updatedAt !== issue.createdAt && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                                            <div>
                                                <p className="text-sm font-medium">Last Updated</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(issue.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
