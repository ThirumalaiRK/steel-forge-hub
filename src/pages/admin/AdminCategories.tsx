import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, LayoutGrid, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  mobile_image_url?: string | null;
  icon?: string | null;
  is_active: boolean;
  display_order: number;
  show_in_menu: boolean;
  is_featured?: boolean;
  show_on_home?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  og_image?: string | null;
  [key: string]: any; // safer for future fields
}

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    mobile_image_url: "",
    icon: "",
    is_active: true,
    display_order: 0,
    show_in_menu: true,
    is_featured: false,
    show_on_home: false,
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_image: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(formData)
          .eq("id", editingCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert([formData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: editingCategory ? "Category updated" : "Category created",
      });

      setDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const { count, error: countError } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", id);

      if (countError) throw countError;

      if (count && count > 0) {
        toast({
          title: "Cannot delete category",
          description:
            "This category has products assigned. Reassign or delete those products first.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted",
      });

      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setSlugTouched(true);
    setFormData({
      ...category,
      description: category.description || "",
      image_url: category.image_url || "",
      mobile_image_url: category.mobile_image_url || "",
      icon: category.icon || "",
      seo_title: category.seo_title || "",
      seo_description: category.seo_description || "",
      seo_keywords: category.seo_keywords || "",
      og_image: category.og_image || "",
    });
    setActiveTab("general");
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setSlugTouched(false);
    setActiveTab("general");
    setFormData({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      mobile_image_url: "",
      icon: "",
      is_active: true,
      display_order: 0,
      show_in_menu: true,
      is_featured: false,
      show_on_home: false,
      seo_title: "",
      seo_description: "",
      seo_keywords: "",
      og_image: "",
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Categories</h1>
          <p className="text-muted-foreground dark:text-slate-400">Manage product categories, visibility, and navigation.</p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="lg" className="bg-brand-orange hover:bg-brand-orange-dark">
              <Plus className="mr-2" size={16} />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 dark:bg-slate-900 dark:border-slate-700">
            <DialogHeader className="p-6 pb-2 border-b dark:border-slate-800">
              <DialogTitle className="text-xl dark:text-white">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="p-6 pt-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="general" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">General</TabsTrigger>
                    <TabsTrigger value="visuals" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">Visual Identity</TabsTrigger>
                    <TabsTrigger value="seo" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">SEO & Metadata</TabsTrigger>
                  </TabsList>

                  {/* --- GENERAL TAB --- */}
                  <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2 md:col-span-1">
                        <Label className="dark:text-slate-300">Category Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              name: value,
                              slug: slugTouched ? prev.slug : slugify(value),
                            }));
                          }}
                          placeholder="e.g. Industrial Furniture"
                          required
                          className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2 col-span-2 md:col-span-1">
                        <Label className="dark:text-slate-300">Slug *</Label>
                        <div className="relative">
                          <Input
                            value={formData.slug}
                            onChange={(e) => {
                              setSlugTouched(true);
                              setFormData({ ...formData, slug: e.target.value });
                            }}
                            placeholder="industrial-furniture"
                            className="pl-8 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            required
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">Description <span className="text-xs text-muted-foreground dark:text-slate-500 ml-2">(Used for category landing page subtitle)</span></Label>
                      <Textarea
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={3}
                        placeholder="Brief description of this category..."
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                      <h3 className="text-sm font-semibold mb-2 dark:text-slate-200">Navigation & Visibility</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                          <div className="space-y-0.5">
                            <Label className="text-base dark:text-slate-200">Active Status</Label>
                            <p className="text-xs text-muted-foreground dark:text-slate-400">Visible to users</p>
                          </div>
                          <Switch
                            checked={formData.is_active}
                            onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                          <div className="space-y-0.5">
                            <Label className="text-base dark:text-slate-200">Main Menu</Label>
                            <p className="text-xs text-muted-foreground dark:text-slate-400">Show in header nav</p>
                          </div>
                          <Switch
                            checked={formData.show_in_menu}
                            onCheckedChange={(c) => setFormData({ ...formData, show_in_menu: c })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                          <div className="space-y-0.5">
                            <Label className="text-base dark:text-slate-200">Featured</Label>
                            <p className="text-xs text-muted-foreground dark:text-slate-400">Highlight this cat</p>
                          </div>
                          <Switch
                            checked={formData.is_featured}
                            onCheckedChange={(c) => setFormData({ ...formData, is_featured: c })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                          <div className="space-y-0.5">
                            <Label className="text-base dark:text-slate-200">Home Page</Label>
                            <p className="text-xs text-muted-foreground dark:text-slate-400">Show on homepage</p>
                          </div>
                          <Switch
                            checked={formData.show_on_home}
                            onCheckedChange={(c) => setFormData({ ...formData, show_on_home: c })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="dark:text-slate-300">Display Order</Label>
                        <Input
                          type="number"
                          className="max-w-[120px] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          value={formData.display_order}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              display_order: parseInt(e.target.value || "0", 10),
                            })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* --- VISUALS TAB --- */}
                  <TabsContent value="visuals" className="space-y-6">
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2 dark:text-slate-300"><ImageIcon size={16} /> Desktop Cover Image (16:9)</Label>
                      <div className="flex gap-4 items-start">
                        <Input
                          value={formData.image_url || ''}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          placeholder="https://... (Desktop Banner)"
                          className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                      {formData.image_url && (
                        <div className="aspect-video w-full max-w-sm rounded-lg border overflow-hidden bg-slate-100 relative">
                          <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                          <Badge className="absolute bottom-2 right-2">Desktop Preview</Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 border-t pt-4 dark:border-slate-800">
                      <Label className="flex items-center gap-2 dark:text-slate-300"><ImageIcon size={16} /> Mobile Cover Image (4:5)</Label>
                      <div className="flex gap-4 items-start">
                        <Input
                          value={formData.mobile_image_url || ''}
                          onChange={(e) => setFormData({ ...formData, mobile_image_url: e.target.value })}
                          placeholder="https://... (Mobile Banner)"
                          className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                      {formData.mobile_image_url && (
                        <div className="aspect-[4/5] w-32 rounded-lg border overflow-hidden bg-slate-100 relative">
                          <img src={formData.mobile_image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 border-t pt-4 dark:border-slate-800">
                      <Label className="flex items-center gap-2 dark:text-slate-300"><LayoutGrid size={16} /> Icon (Optional)</Label>
                      <Input
                        value={formData.icon || ''}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="lucide-react icon name or URL"
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                  </TabsContent>

                  {/* --- SEO TAB --- */}
                  <TabsContent value="seo" className="space-y-4">
                    <div className="space-y-2">
                      <Label>SEO Title</Label>
                      <Input
                        value={formData.seo_title || ''}
                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                        placeholder="Meta Title"
                      />
                      <p className="text-xs text-muted-foreground text-right">{formData.seo_title?.length || 0}/60</p>
                    </div>
                    <div className="space-y-2">
                      <Label>SEO Description</Label>
                      <Textarea
                        value={formData.seo_description || ''}
                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                        rows={4}
                        placeholder="Meta Description for search engines"
                      />
                      <p className="text-xs text-muted-foreground text-right">{formData.seo_description?.length || 0}/160</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <Input
                        value={formData.seo_keywords || ''}
                        onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                        placeholder="Comma separated keywords"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Image</Label>
                      <Input
                        value={formData.og_image || ''}
                        onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                        placeholder="Social sharing image URL"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="p-6 pt-2 border-t mt-auto dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700">Cancel</Button>
                <Button type="submit" className="bg-brand-orange hover:bg-brand-orange-dark">
                  {editingCategory ? "Save Changes" : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-3">
              <Search className="h-10 w-10 opacity-20" />
              <p>No categories found. Create one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800">
                <TableRow className="dark:border-slate-800 hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead className="w-[80px] dark:text-slate-300">Order</TableHead>
                  <TableHead className="w-[100px] dark:text-slate-300">Image</TableHead>
                  <TableHead className="dark:text-slate-300">Category Info</TableHead>
                  <TableHead className="dark:text-slate-300">Visibility</TableHead>
                  <TableHead className="dark:text-slate-300">Status</TableHead>
                  <TableHead className="text-right dark:text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className="group dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell className="font-medium text-slate-500 dark:text-slate-400">#{category.display_order}</TableCell>
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg border bg-slate-100 dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">{category.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-mono">/{category.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {category.show_in_menu && <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">Menu</Badge>}
                        {category.show_on_home && <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">Home</Badge>}
                        {category.is_featured && <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.is_active ? (
                        <div className="flex items-center text-emerald-600 text-sm font-medium">
                          <Eye size={14} className="mr-1.5" /> Active
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-400 text-sm font-medium">
                          <EyeOff size={14} className="mr-1.5" /> Inactive
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil size={14} className="text-slate-600 dark:text-slate-400" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 size={14} />
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

export default AdminCategories;
