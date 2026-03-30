import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import
    {
        getDepartments,
        createDepartment,
        updateDepartment,
        deleteDepartment,
    } from "@/features/departments/departmentsSlice";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
        Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
    } from "@/components/ui/dialog";
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
import { toast } from "sonner";
import
    {
        Building2,
        Plus,
        Pencil,
        Trash2,
        Mail,
        Phone,
        Loader2,
    } from "lucide-react";

export default function DepartmentManagement()
{
    const dispatch = useDispatch();
    const { departments, isLoading, error } = useSelector((state) => state.departments);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        email: "",
        phone: "",
        isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() =>
    {
        dispatch(getDepartments(false));
    }, [dispatch]);

    const resetForm = () =>
    {
        setFormData({
            name: "",
            description: "",
            email: "",
            phone: "",
            isActive: true,
        });
        setEditingDepartment(null);
    };

    const handleOpenDialog = (department = null) =>
    {
        if (department)
        {
            setEditingDepartment(department);
            setFormData({
                name: department.name || "",
                description: department.description || "",
                email: department.email || "",
                phone: department.phone || "",
                isActive: department.isActive ?? true,
            });
        } else
        {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () =>
    {
        setIsDialogOpen(false);
        resetForm();
    };

    const handleInputChange = (e) =>
    {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        setIsSubmitting(true);

        try
        {
            if (editingDepartment)
            {
                const result = await dispatch(
                    updateDepartment({ id: editingDepartment._id, departmentData: formData })
                );
                if (updateDepartment.fulfilled.match(result))
                {
                    toast.success("Department updated successfully");
                    handleCloseDialog();
                } else
                {
                    toast.error(result.payload || "Failed to update department");
                }
            } else
            {
                const result = await dispatch(createDepartment(formData));
                if (createDepartment.fulfilled.match(result))
                {
                    toast.success("Department created successfully");
                    handleCloseDialog();
                } else
                {
                    toast.error(result.payload || "Failed to create department");
                }
            }
        } catch (error)
        {
            toast.error("An error occurred");
        } finally
        {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) =>
    {
        const result = await dispatch(deleteDepartment(id));
        if (deleteDepartment.fulfilled.match(result))
        {
            toast.success("Department deleted successfully");
        } else
        {
            toast.error(result.payload || "Failed to delete department");
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Department Management</h1>
                        <p className="text-muted-foreground">
                            Create and manage government departments
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Department
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingDepartment ? "Edit Department" : "Create Department"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingDepartment
                                            ? "Update the department information"
                                            : "Add a new government department to handle civic issues"}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Department Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Public Works Department"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Brief description of the department's responsibilities"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="dept@city.gov"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="isActive">Active Status</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Inactive departments won't appear in issue assignment
                                            </p>
                                        </div>
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) =>
                                                setFormData((prev) => ({ ...prev, isActive: checked }))
                                            }
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseDialog}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        )}
                                        {editingDepartment ? "Update" : "Create"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>


                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departments.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <Building2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {departments.filter((d) => d.isActive).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {departments.filter((d) => !d.isActive).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>


                <Card>
                    <CardHeader>
                        <CardTitle>All Departments</CardTitle>
                        <CardDescription>
                            A list of all government departments in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : departments.length === 0 ? (
                            <div className="text-center py-12">
                                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No departments yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Get started by creating your first department
                                </p>
                                <Button onClick={() => handleOpenDialog()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Department
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Issues</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.map((dept) => (
                                        <TableRow key={dept._id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{dept.name}</p>
                                                    {dept.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {dept.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {dept.email && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Mail className="h-3 w-3" />
                                                            <a
                                                                href={`mailto:${dept.email}`}
                                                                className="hover:underline"
                                                            >
                                                                {dept.email}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {dept.phone && (
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Phone className="h-3 w-3" />
                                                            {dept.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={dept.isActive ? "default" : "secondary"}>
                                                    {dept.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground">
                                                    {dept.issueCount || 0} assigned
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(dept)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Department?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete "{dept.name}". Issues
                                                                    assigned to this department will be unassigned. This
                                                                    action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(dept._id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
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
