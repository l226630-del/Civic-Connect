import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import
{
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import
{
    MessageSquare,
    MoreVertical,
    Pencil,
    Trash2,
    Send,
    Shield,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import api from "@/services/api";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

export default function Comments({ issueId })
{
    const { user } = useSelector((state) => state.auth);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() =>
    {
        fetchComments();
    }, [issueId]);

    const fetchComments = async () =>
    {
        try
        {
            setLoading(true);
            const response = await api.get(`/comments/issue/${issueId}`);
            setComments(response.data.data || []);
        } catch (error)
        {
            console.error("Error fetching comments:", error);
        } finally
        {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        if (!newComment.trim()) return;

        try
        {
            setSubmitting(true);
            const response = await api.post(`/comments/issue/${issueId}`, {
                text: newComment,
            });
            setComments([response.data.data, ...comments]);
            setNewComment("");
            toast.success("Comment added!");
        } catch (error)
        {
            toast.error(error.response?.data?.message || "Failed to add comment");
        } finally
        {
            setSubmitting(false);
        }
    };

    const handleEdit = async (commentId) =>
    {
        if (!editText.trim()) return;

        try
        {
            const response = await api.put(`/comments/${commentId}`, {
                text: editText,
            });
            setComments(
                comments.map((c) => (c._id === commentId ? response.data.data : c))
            );
            setEditingId(null);
            setEditText("");
            toast.success("Comment updated!");
        } catch (error)
        {
            toast.error(error.response?.data?.message || "Failed to update comment");
        }
    };

    const handleDelete = async () =>
    {
        if (!deleteId) return;

        try
        {
            await api.delete(`/comments/${deleteId}`);
            setComments(comments.filter((c) => c._id !== deleteId));
            setDeleteId(null);
            toast.success("Comment deleted!");
        } catch (error)
        {
            toast.error(error.response?.data?.message || "Failed to delete comment");
        }
    };

    const startEditing = (comment) =>
    {
        setEditingId(comment._id);
        setEditText(comment.text);
    };

    const cancelEditing = () =>
    {
        setEditingId(null);
        setEditText("");
    };

    if (loading)
    {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">Comments</h3>
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Comments ({comments.length})</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
                <Avatar className="w-10 h-10">
                    <AvatarImage
                        src={
                            user?.profilePhoto ? `/${user.profilePhoto}` : undefined
                        }
                    />
                    <AvatarFallback>
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="resize-none"
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={submitting || !newComment.trim()}>
                            <Send className="w-4 h-4 mr-2" />
                            {submitting ? "Posting..." : "Post Comment"}
                        </Button>
                    </div>
                </div>
            </form>

            <div className="space-y-4 mt-6">
                {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No comments yet. Be the first to comment!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3">
                            <Avatar className="w-10 h-10">
                                <AvatarImage
                                    src={
                                        comment.user?.profilePhoto
                                            ? `/${comment.user.profilePhoto}`
                                            : undefined
                                    }
                                />
                                <AvatarFallback>
                                    {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{comment.user?.username}</span>
                                    {comment.user?.role === "admin" && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Admin
                                        </Badge>
                                    )}
                                    {comment.user?.role === "department" && (
                                        <Badge variant="outline" className="text-xs">
                                            Official
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>

                                {editingId === comment._id ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            rows={2}
                                            className="resize-none"
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleEdit(comment._id)}>
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={cancelEditing}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-foreground whitespace-pre-wrap">
                                        {comment.text}
                                    </p>
                                )}

                                {(user?._id === comment.user?._id || user?.role === "admin") &&
                                    editingId !== comment._id && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 mt-1"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                {user?._id === comment.user?._id && (
                                                    <DropdownMenuItem
                                                        onClick={() => startEditing(comment)}
                                                    >
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setDeleteId(comment._id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The comment will be permanently
                            deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
