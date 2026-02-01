import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FileText, Lock, Unlock, Search, Upload, UploadCloud, Loader2, CheckCircle2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Resource {
    id: string;
    title: string;
    category: string;
    format: string;
    size: string;
    image: string;
    summary: string;
    file_url: string;
    is_gated: boolean;
    created_at?: string;
}

const AdminResources = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const { toast } = useToast();

    const [formData, setFormData] = useState<Partial<Resource>>({
        title: "",
        category: "Whitepaper",
        format: "PDF",
        size: "",
        image: "",
        summary: "",
        file_url: "",
        is_gated: false,
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const { data, error } = await supabase
                .from("resources")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                if (error.code === '42P01') {
                    console.warn("Resources table missing, using empty state");
                    setResources([]);
                    return;
                }
                throw error;
            }
            setResources((data as Resource[]) || []);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to fetch resources. Ensure database migration is applied.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Maximum file size is 50MB",
                variant: "destructive",
            });
            return;
        }

        try {
            setUploadProgress(10);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `resources/${fileName}`;

            setUploadProgress(30);

            const { error } = await supabase.storage
                .from('resources')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                if (error.message.includes('not found')) {
                    toast({
                        title: "Storage not configured",
                        description: "Please create a 'resources' bucket in Supabase Storage first.",
                        variant: "destructive",
                    });
                } else {
                    throw error;
                }
                setUploadProgress(0);
                return;
            }

            setUploadProgress(70);

            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath);

            setUploadProgress(90);

            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

            setFormData({
                ...formData,
                file_url: publicUrl,
                size: `${sizeInMB} MB`,
                format: fileExt?.toUpperCase() || 'FILE'
            });

            setUploadProgress(100);

            toast({
                title: "Success",
                description: "File uploaded successfully!",
            });

            setTimeout(() => setUploadProgress(0), 1000);

        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "Upload failed",
                description: "An error occurred while uploading the file",
                variant: "destructive",
            });
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingResource) {
                const { error } = await supabase
                    .from("resources")
                    .update(formData)
                    .eq("id", editingResource.id);

                if (error) throw error;
            } else {
                const { error } = await supabase.from("resources").insert([formData]);

                if (error) throw error;
            }

            toast({
                title: "Success",
                description: editingResource ? "Resource updated" : "Resource created",
            });

            setDialogOpen(false);
            resetForm();
            fetchResources();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save resource",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;

        try {
            const { error } = await supabase.from("resources").delete().eq("id", id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Resource deleted",
            });

            fetchResources();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete resource",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (resource: Resource) => {
        setEditingResource(resource);
        setFormData({ ...resource });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingResource(null);
        setFormData({
            title: "",
            category: "Whitepaper",
            format: "PDF",
            size: "",
            image: "",
            summary: "",
            file_url: "",
            is_gated: false,
        });
    };

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || r.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(resources.map(r => r.category)));

    return (
        <div className="space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        Technical Resources
                    </h1>
                    <p className="text-muted-foreground dark:text-slate-400 mt-1">
                        Manage downloadable whitepapers, datasheets, and guides for your knowledge hub
                    </p>
                </div>

                <Dialog
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) resetForm();
                    }}
                >
                    <DialogTrigger asChild>
                        <Button size="lg" className="bg-brand-orange hover:bg-orange-600 shadow-lg shadow-orange-500/30">
                            <Plus className="mr-2" size={18} />
                            Add Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="dark:text-white text-xl">
                                {editingResource ? "Edit Resource" : "Add New Resource"}
                            </DialogTitle>
                            <DialogDescription className="dark:text-slate-400">
                                {editingResource ? "Update the resource information below" : "Fill in the details to add a new downloadable resource"}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label className="dark:text-slate-300 font-semibold">Title *</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="e.g. 2026 Robotics Market Report"
                                        className="dark:bg-slate-800 dark:border-slate-700 h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="dark:text-slate-300 font-semibold">Category</Label>
                                    <Input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        list="categories-list"
                                        placeholder="Type or select..."
                                        className="dark:bg-slate-800 dark:border-slate-700 h-11"
                                    />
                                    <datalist id="categories-list">
                                        <option value="Whitepaper" />
                                        <option value="Technical Spec" />
                                        <option value="E-Book" />
                                        <option value="Developer Doc" />
                                        <option value="Checklist" />
                                        <option value="Case Study Collection" />
                                    </datalist>
                                </div>

                                <div className="space-y-2">
                                    <Label className="dark:text-slate-300 font-semibold">Format</Label>
                                    <Input
                                        value={formData.format}
                                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                        placeholder="PDF, ZIP, DOCX"
                                        className="dark:bg-slate-800 dark:border-slate-700 h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="dark:text-slate-300 font-semibold">File Size</Label>
                                    <Input
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        placeholder="e.g. 2.5 MB"
                                        className="dark:bg-slate-800 dark:border-slate-700 h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="dark:text-slate-300 font-semibold">Cover Image URL</Label>
                                    <Input
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://..."
                                        className="dark:bg-slate-800 dark:border-slate-700 h-11"
                                    />
                                </div>

                                {/* File Upload / URL Tabs */}
                                <div className="col-span-2 space-y-2">
                                    <Label className="dark:text-slate-300 font-semibold">Resource File *</Label>
                                    <Tabs defaultValue="url" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
                                            <TabsTrigger value="url" className="dark:data-[state=active]:bg-slate-900">
                                                <FileText size={14} className="mr-2" /> URL Link
                                            </TabsTrigger>
                                            <TabsTrigger value="upload" className="dark:data-[state=active]:bg-slate-900">
                                                <Upload size={14} className="mr-2" /> Upload File
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="url" className="space-y-2 mt-4">
                                            <Input
                                                value={formData.file_url}
                                                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                                                placeholder="https://example.com/file.pdf"
                                                className="dark:bg-slate-800 dark:border-slate-700 h-11"
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Enter a direct link to your hosted file (PDF, ZIP, etc.)</p>
                                        </TabsContent>

                                        <TabsContent value="upload" className="space-y-3 mt-4">
                                            <div
                                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${uploadProgress > 0 && uploadProgress < 100 ? 'border-brand-orange bg-orange-50/50 dark:bg-orange-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                                                    }`}
                                            >
                                                <input
                                                    type="file"
                                                    id="file-upload-input"
                                                    className="hidden"
                                                    accept=".pdf,.zip,.docx,.doc,.ppt,.pptx"
                                                    onChange={handleFileUpload}
                                                />
                                                <label htmlFor="file-upload-input" className="cursor-pointer">
                                                    {uploadProgress > 0 && uploadProgress < 100 ? (
                                                        <div className="space-y-3">
                                                            <Loader2 className="w-10 h-10 mx-auto text-brand-orange animate-spin" />
                                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Uploading... {uploadProgress}%</p>
                                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                                                <div
                                                                    className="bg-brand-orange h-2.5 rounded-full transition-all duration-300"
                                                                    style={{ width: `${uploadProgress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ) : formData.file_url && !formData.file_url.startsWith('http') ? (
                                                        <div className="space-y-2">
                                                            <CheckCircle2 className="w-10 h-10 mx-auto text-green-600" />
                                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">File uploaded successfully!</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{formData.file_url.split('/').pop()}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <UploadCloud className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" />
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Click to upload or drag and drop</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF, ZIP, DOCX, PPT (Max 50MB)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {formData.file_url && !formData.file_url.startsWith('http') && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setFormData({ ...formData, file_url: '' })}
                                                    className="w-full dark:bg-slate-800 dark:border-slate-700"
                                                >
                                                    <Trash2 size={14} className="mr-2" /> Remove File
                                                </Button>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label className="dark:text-slate-300 font-semibold">Summary</Label>
                                    <Textarea
                                        value={formData.summary}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        rows={3}
                                        placeholder="Brief description of the content..."
                                        className="dark:bg-slate-800 dark:border-slate-700 resize-none"
                                    />
                                </div>

                                <div className="col-span-2 flex items-center justify-between p-4 border-2 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 dark:border-slate-700">
                                    <div className="space-y-0.5">
                                        <Label className="text-base dark:text-white font-semibold flex items-center gap-2">
                                            <Lock size={16} className="text-brand-orange" />
                                            Gated Content?
                                        </Label>
                                        <p className="text-xs text-muted-foreground dark:text-slate-400">Require email signup to access this resource</p>
                                    </div>
                                    <Switch
                                        checked={formData.is_gated}
                                        onCheckedChange={(c) => setFormData({ ...formData, is_gated: c })}
                                        className="data-[state=checked]:bg-brand-orange"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-brand-orange hover:bg-orange-600" disabled={uploadProgress > 0 && uploadProgress < 100}>
                                    {uploadProgress > 0 && uploadProgress < 100 ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                                    ) : (
                                        <>{editingResource ? "Save Changes" : "Create Resource"}</>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filter Bar */}
            <Card className="shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                            <Input
                                placeholder="Search resources by title or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 dark:bg-slate-800 dark:border-slate-700 h-11"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand-orange outline-none"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <Badge variant="secondary" className="px-3 py-2 dark:bg-slate-800 dark:text-slate-300">
                                {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resources Table */}
            <Card className="shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-16 w-16 rounded-lg dark:bg-slate-800" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4 dark:bg-slate-800" />
                                        <Skeleton className="h-3 w-1/2 dark:bg-slate-800" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                            </div>
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">No resources found</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                {searchTerm || filterCategory !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "Get started by adding your first resource"}
                            </p>
                            {!searchTerm && filterCategory === "all" && (
                                <Button onClick={() => setDialogOpen(true)} className="bg-brand-orange hover:bg-orange-600">
                                    <Plus size={16} className="mr-2" /> Add Your First Resource
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                <TableRow className="dark:border-slate-800 hover:bg-transparent dark:hover:bg-transparent">
                                    <TableHead className="w-[100px] dark:text-slate-300 font-semibold">Format</TableHead>
                                    <TableHead className="dark:text-slate-300 font-semibold">Resource</TableHead>
                                    <TableHead className="dark:text-slate-300 font-semibold">Category</TableHead>
                                    <TableHead className="dark:text-slate-300 font-semibold">Access</TableHead>
                                    <TableHead className="text-right dark:text-slate-300 font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredResources.map((resource) => (
                                    <TableRow key={resource.id} className="group dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="secondary" className="font-mono text-xs w-fit dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                                    {resource.format}
                                                </Badge>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500">{resource.size}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {resource.image && (
                                                    <img
                                                        src={resource.image}
                                                        className="w-12 h-12 rounded-lg object-cover border dark:border-slate-700"
                                                        alt=""
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-orange transition-colors">
                                                        {resource.title}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                                        {resource.summary}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700">
                                                {resource.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {resource.is_gated ? (
                                                <div className="flex items-center text-amber-600 dark:text-amber-500 text-sm font-medium gap-1.5">
                                                    <Lock size={14} /> Gated
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-emerald-600 dark:text-emerald-500 text-sm font-medium gap-1.5">
                                                    <Unlock size={14} /> Free
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                                                    onClick={() => window.open(resource.file_url, '_blank')}
                                                    title="View File"
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    onClick={() => handleEdit(resource)}
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} className="text-slate-600 dark:text-slate-400" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                                                    onClick={() => handleDelete(resource.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
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
    );
};

export default AdminResources;
