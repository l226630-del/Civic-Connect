import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getIssue, updateIssue } from "@/features/issues/issuesSlice";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import
    {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
    } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import
    {
        AlertCircle,
        Loader2,
        MapPin,
        Upload,
        X,
        Image as ImageIcon,
        ArrowLeft,
    } from "lucide-react";

// Get base URL for static assets
const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

export default function EditIssue()
{
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { departments } = useSelector((state) => state.departments);
    const {
        currentIssue: issue,
        isLoading,
        error,
    } = useSelector((state) => state.issues);
    const { user } = useSelector((state) => state.auth);

    const [newImages, setNewImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [location, setLocation] = useState({
        coordinates: [0, 0],
        address: "",
    });
    const [locationLoading, setLocationLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    useEffect(() =>
    {
        dispatch(getIssue(id));
        dispatch(getDepartments(true));
    }, [dispatch, id]);


    useEffect(() =>
    {
        if (issue)
        {
            setValue("title", issue.title);
            setValue("description", issue.description);
            setValue("category", issue.category);
            if (issue.department?._id)
            {
                setValue("department", issue.department._id);
            }
            if (issue.location)
            {
                setLocation({
                    coordinates: issue.location.coordinates || [0, 0],
                    address: issue.location.address || "",
                });
            }
            if (issue.photos)
            {
                setExistingPhotos(issue.photos);
            }
        }
    }, [issue, setValue]);

    const handleImageChange = (e) =>
    {
        const files = Array.from(e.target.files);
        const totalImages = existingPhotos.length + newImages.length + files.length;

        if (totalImages > 5)
        {
            toast.error("Maximum 5 images allowed");
            return;
        }

        const newFiles = [...newImages, ...files].slice(
            0,
            5 - existingPhotos.length
        );
        setNewImages(newFiles);


        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setImagePreview(newPreviews);
    };

    const removeNewImage = (index) =>
    {
        const updatedImages = newImages.filter((_, i) => i !== index);
        const updatedPreviews = imagePreview.filter((_, i) => i !== index);
        setNewImages(updatedImages);
        setImagePreview(updatedPreviews);
    };

    const removeExistingPhoto = (index) =>
    {
        setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
    };

    const getCurrentLocation = () =>
    {
        if (!navigator.geolocation)
        {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) =>
            {
                const { latitude, longitude } = position.coords;
                setLocation({
                    coordinates: [longitude, latitude],
                    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                });
                setLocationLoading(false);
                toast.success("Location detected successfully");
            },
            (error) =>
            {
                setLocationLoading(false);
                toast.error("Unable to get your location. Please enter manually.");
            }
        );
    };

    const onSubmit = async (data) =>
    {
        if (location.coordinates[0] === 0 && location.coordinates[1] === 0)
        {
            toast.error("Please set a location for the issue");
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("category", data.category);
        formData.append(
            "location",
            JSON.stringify({
                type: "Point",
                coordinates: location.coordinates,
                address: location.address,
            })
        );


        formData.append("existingPhotos", JSON.stringify(existingPhotos));


        newImages.forEach((image) =>
        {
            formData.append("images", image);
        });

        const result = await dispatch(updateIssue({ id, formData }));

        setIsSubmitting(false);

        if (updateIssue.fulfilled.match(result))
        {
            toast.success("Issue updated successfully!");
            navigate(`/issues/${id}`);
        } else
        {
            toast.error(result.payload || "Failed to update issue");
        }
    };

    const categories = [
        {
            value: "pothole",
            label: "Pothole",
            description: "Road damage, potholes",
        },
        {
            value: "streetlight",
            label: "Street Light",
            description: "Broken or flickering lights",
        },
        {
            value: "garbage",
            label: "Garbage",
            description: "Waste collection issues",
        },
        {
            value: "water",
            label: "Water",
            description: "Water supply or drainage issues",
        },
        { value: "roads", label: "Roads", description: "General road maintenance" },
        { value: "other", label: "Other", description: "Other civic issues" },
    ];


    const isOwner = user?._id === issue?.creator?._id;
    const canEdit = isOwner && issue?.status === "pending";

    if (isLoading && !issue)
    {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </MainLayout>
        );
    }

    if (issue && !canEdit)
    {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Cannot Edit Issue</h2>
                            <p className="text-muted-foreground mb-4">
                                {!isOwner
                                    ? "You are not authorized to edit this issue."
                                    : "This issue is already being processed and cannot be edited."}
                            </p>
                            <Button onClick={() => navigate(`/issues/${id}`)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Issue
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <CardTitle>Edit Issue</CardTitle>
                                <CardDescription>
                                    Update the details of your reported issue
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}


                            <div className="space-y-2">
                                <Label htmlFor="title">Issue Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="Brief description of the issue"
                                    {...register("title", {
                                        required: "Title is required",
                                        maxLength: {
                                            value: 200,
                                            message: "Title cannot exceed 200 characters",
                                        },
                                    })}
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>


                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={watch("category")}
                                    onValueChange={(value) => setValue("category", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                <div>
                                                    <div className="font-medium">{cat.label}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {cat.description}
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    {...register("category", {
                                        required: "Category is required",
                                    })}
                                />
                                {errors.category && (
                                    <p className="text-sm text-destructive">
                                        {errors.category.message}
                                    </p>
                                )}
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Provide detailed information about the issue..."
                                    rows={4}
                                    {...register("description", {
                                        required: "Description is required",
                                        maxLength: {
                                            value: 2000,
                                            message: "Description cannot exceed 2000 characters",
                                        },
                                    })}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>


                            <div className="space-y-2">
                                <Label>Location *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Address or coordinates"
                                        value={location.address}
                                        onChange={(e) =>
                                            setLocation({ ...location, address: e.target.value })
                                        }
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={getCurrentLocation}
                                        disabled={locationLoading}
                                    >
                                        {locationLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <MapPin className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {location.coordinates[0] !== 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Coordinates: {location.coordinates[1].toFixed(6)},{" "}
                                        {location.coordinates[0].toFixed(6)}
                                    </p>
                                )}
                            </div>


                            {existingPhotos.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Current Photos</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {existingPhotos.map((photo, index) => (
                                            <div key={index} className="relative aspect-square">
                                                <img
                                                    src={`${API_URL}${photo}`}
                                                    alt={`Existing ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6"
                                                    onClick={() => removeExistingPhoto(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                            <div className="space-y-2">
                                <Label>
                                    Add New Photos (max {5 - existingPhotos.length} more)
                                </Label>
                                <div className="border-2 border-dashed rounded-lg p-4">
                                    {imagePreview.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {imagePreview.map((preview, index) => (
                                                <div key={index} className="relative aspect-square">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6"
                                                        onClick={() => removeNewImage(index)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {existingPhotos.length + newImages.length < 5 && (
                                        <label className="cursor-pointer">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                asChild
                                            >
                                                <span>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Add Photos
                                                </span>
                                            </Button>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>


                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Update Issue
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
