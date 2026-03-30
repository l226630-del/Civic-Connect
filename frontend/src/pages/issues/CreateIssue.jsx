import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createIssue } from "@/features/issues/issuesSlice";
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
import { toast } from "sonner";
import
    {
        AlertCircle,
        Loader2,
        MapPin,
        Upload,
        X,
        Image as ImageIcon,
    } from "lucide-react";

export default function CreateIssue()
{
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { departments } = useSelector((state) => state.departments);
    const { isLoading, error } = useSelector((state) => state.issues);

    const [images, setImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [location, setLocation] = useState({
        coordinates: [0, 0],
        address: "",
    });
    const [locationLoading, setLocationLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: { errors },
    } = useForm();

    const selectedCategory = watch("category");

    useEffect(() =>
    {
        dispatch(getDepartments(true));
    }, [dispatch]);

    const handleImageChange = (e) =>
    {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5)
        {
            toast.error("Maximum 5 images allowed");
            return;
        }

        const newImages = [...images, ...files].slice(0, 5);
        setImages(newImages);


        const newPreviews = newImages.map((file) => URL.createObjectURL(file));
        setImagePreview(newPreviews);
    };

    const removeImage = (index) =>
    {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreview.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreview(newPreviews);
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

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("category", data.category);
        if (data.department)
        {
            formData.append("department", data.department);
        }
        formData.append(
            "location",
            JSON.stringify({
                type: "Point",
                coordinates: location.coordinates,
                address: location.address || data.address,
            })
        );

        images.forEach((image) =>
        {
            formData.append("images", image);
        });

        const result = await dispatch(createIssue(formData));
        if (createIssue.fulfilled.match(result))
        {
            toast.success("Issue reported successfully!");
            navigate(`/issues/${result.payload._id}`);
        } else
        {
            toast.error(result.payload || "Failed to create issue");
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

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Report a Civic Issue</CardTitle>
                        <CardDescription>
                            Help improve your community by reporting issues that need
                            attention
                        </CardDescription>
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
                                <Label>Department (Optional)</Label>
                                <Select
                                    onValueChange={(value) => setValue("department", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept._id} value={dept._id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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


                            <div className="space-y-2">
                                <Label>Photos (Optional, max 5)</Label>
                                <div className="border-2 border-dashed rounded-lg p-4">
                                    {imagePreview.length > 0 ? (
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
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 py-4">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                Upload photos of the issue
                                            </p>
                                        </div>
                                    )}
                                    {images.length < 5 && (
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
                                    disabled={isLoading}
                                >
                                    {isLoading && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Submit Report
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
