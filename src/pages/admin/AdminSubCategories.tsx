import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, LayoutGrid, Eye, EyeOff, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  is_active: boolean; // to filter parent dropdown
}

interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  image_url?: string | null;
  icon?: string | null;
  show_as_cards?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  [key: string]: any;
}

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const AdminSubCategories = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [slugTouched, setSlugTouched] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<SubCategory>>({
    category_id: "",
    name: "",
    slug: "",
    description: "",
    display_order: 0,
    is_active: true,
    image_url: "",
    icon: "",
    show_as_cards: true,
    seo_title: "",
    seo_description: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [subCategoriesRes, categoriesRes] = await Promise.all([
        supabase
          .from("sub_categories")
          .select("*")
          .order("display_order"),
        supabase
          .from("categories")
          .select("id, name, is_active")
          .order("name"),
      ]);

      if (subCategoriesRes.error) throw subCategoriesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setSubCategories((subCategoriesRes.data as SubCategory[]) || []);
      setCategories((categoriesRes.data as Category[]) || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch sub-categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.category_id) {
        toast({
          title: "Validation error",
          description: "Please select a parent category",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        ...formData,
        description: formData.description || null,
        display_order: Number.isNaN(formData.display_order)
          ? 0
          : formData.display_order,
      };

      if (editingSubCategory) {
        const { error } = await supabase
          .from("sub_categories")
          .update(payload)
          .eq("id", editingSubCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("sub_categories")
          .insert([payload as any]); // cast to any to avoid strict type checks on new fields

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: editingSubCategory
          ? "Sub-category updated"
          : "Sub-category created",
      });

      setDialogOpen(false);
      resetForm();
      fetchInitialData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save sub-category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sub-category?")) return;

    try {
      // Check for products first
      const { count, error: countError } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("sub_category_id", id); // Assuming sub_category_id column exists or needs to be checked

      if (!countError && count && count > 0) {
        toast({
          title: "Cannot delete",
          description: "Products exist in this sub-category.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from("sub_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sub-category deleted",
      });

      fetchInitialData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete sub-category",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setSlugTouched(true);
    setFormData({
      ...subCategory,
      description: subCategory.description || "",
      image_url: subCategory.image_url || "",
      icon: subCategory.icon || "",
      show_as_cards: subCategory.show_as_cards ?? true,
      seo_title: subCategory.seo_title || "",
      seo_description: subCategory.seo_description || "",
    });
    setActiveTab("general");
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSubCategory(null);
    setSlugTouched(false);
    setActiveTab("general");
    setFormData({
      category_id: "",
      name: "",
      slug: "",
      description: "",
      display_order: 0,
      is_active: true,
      image_url: "",
      icon: "",
      show_as_cards: true,
      seo_title: "",
      seo_description: "",
    });
  };

  const getCategoryName = (category_id: string) =>
    categories.find((c) => c.id === category_id)?.name || "-";

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Sub-Categories</h1>
          <p className="text-muted-foreground dark:text-slate-400">Manage specific product groupings under main categories.</p>
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
              Add Sub-Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 dark:bg-slate-900 dark:border-slate-700">
            <DialogHeader className="p-6 pb-2 border-b dark:border-slate-800">
              <DialogTitle className="text-xl dark:text-white">
                {editingSubCategory ? "Edit Sub-Category" : "Add New Sub-Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="p-6 pt-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="general" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">General</TabsTrigger>
                    <TabsTrigger value="visuals" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">Visuals & Layout</TabsTrigger>
                    <TabsTrigger value="seo" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">SEO</TabsTrigger>
                  </TabsList>

                  {/* --- GENERAL TAB --- */}
                  <TabsContent value="general" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">Parent Category</Label>
                      <select
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({ ...formData, category_id: e.target.value })
                        }
                        required
                      >
                        <option value="">Select Parent Category...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id} disabled={!cat.is_active}>
                            {cat.name} {!cat.is_active && "(Inactive)"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2 md:col-span-1">
                        <Label className="dark:text-slate-300">Name *</Label>
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
                          maxLength={255}
                          placeholder="e.g. Dining Chairs"
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
                            placeholder="dining-chairs"
                            className="pl-8 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            required
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">Description</Label>
                      <Textarea
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={3}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                      <h3 className="text-sm font-semibold mb-2 dark:text-slate-200">Behavior</h3>
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
                        <div className="space-y-2">
                          <Label className="dark:text-slate-300">Display Order</Label>
                          <Input
                            type="number"
                            value={formData.display_order}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                display_order: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* --- VISUALS TAB --- */}
                  <TabsContent value="visuals" className="space-y-6">
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2 dark:text-slate-300"><ImageIcon size={16} /> Thumbnail Image</Label>
                      <div className="flex gap-4 items-start">
                        <Input
                          value={formData.image_url || ''}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          placeholder="https://... (Sub-category preview)"
                          className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                      {formData.image_url && (
                        <div className="aspect-square w-32 rounded-lg border overflow-hidden bg-slate-100 relative">
                          <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
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
                    <div className="space-y-4 border-t pt-4 dark:border-slate-800">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                        <div className="space-y-0.5">
                          <Label className="text-base flex items-center gap-2 dark:text-slate-200"><Layers size={16} /> Show as Cards</Label>
                          <p className="text-xs text-muted-foreground dark:text-slate-400">If enabled, this sub-category is displayed as a visual card on the category page. If disabled, it only appears as a filter chip.</p>
                        </div>
                        <Switch
                          checked={formData.show_as_cards}
                          onCheckedChange={(c) => setFormData({ ...formData, show_as_cards: c })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* --- SEO TAB --- */}
                  <TabsContent value="seo" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">SEO Title</Label>
                      <Input
                        value={formData.seo_title || ''}
                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                        placeholder="Meta Title"
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                      <p className="text-xs text-muted-foreground text-right">{formData.seo_title?.length || 0}/60</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">SEO Description</Label>
                      <Textarea
                        value={formData.seo_description || ''}
                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                        rows={4}
                        placeholder="Meta Description"
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                      <p className="text-xs text-muted-foreground text-right">{formData.seo_description?.length || 0}/160</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter className="p-6 pt-2 border-t mt-auto dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700">Cancel</Button>
                <Button type="submit" className="bg-brand-orange hover:bg-brand-orange-dark">
                  {editingSubCategory ? "Save Changes" : "Create Sub-Category"}
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
          ) : subCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-3">
              <Layers className="h-10 w-10 opacity-20" />
              <p>No sub-categories found. Create one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800">
                <TableRow className="dark:border-slate-800 hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead className="w-[200px] dark:text-slate-300">Sub-Category Name</TableHead>
                  <TableHead className="dark:text-slate-300">Parent Category</TableHead>
                  <TableHead className="dark:text-slate-300">Layout</TableHead>
                  <TableHead className="dark:text-slate-300">Order</TableHead>
                  <TableHead className="dark:text-slate-300">Status</TableHead>
                  <TableHead className="w-[120px] text-right dark:text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subCategories.map((sub) => (
                  <TableRow key={sub.id} className="group dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">{sub.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-mono">/{sub.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-slate-600 dark:text-slate-300 dark:border-slate-700">
                        {getCategoryName(sub.category_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.show_as_cards ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">Cards</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400">Filter Only</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">#{sub.display_order}</TableCell>
                    <TableCell>
                      {sub.is_active ? (
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
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => handleEdit(sub)}
                        >
                          <Pencil size={14} className="text-slate-600 dark:text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          onClick={() => handleDelete(sub.id)}
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

export default AdminSubCategories;
