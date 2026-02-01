import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Pencil, Trash2, X, GripVertical, Copy, ExternalLink, Info } from "lucide-react";


import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  sub_category_id: string | null;
  metal_type: string | null;
  finish_type: string | null;
  is_faas_enabled: boolean;
  is_active: boolean;
  display_order: number;
  featured: boolean;
  // Pricing
  price_type: "fixed" | "contact" | "fixed_custom";
  price: number | null;
  original_price: number | null;
  price_unit: string | null;
  specifications: Record<string, string> | null;
}

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  category_id: string;
  name: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category_id: "",
    sub_category_id: "",
    metal_type: "",
    finish_type: "",
    is_faas_enabled: false,
    is_active: true,
    display_order: 0,
    featured: false,
    price_type: "contact" as "fixed" | "contact" | "fixed_custom",
    price: 0,
    original_price: 0,
    price_unit: "piece",
    specifications: {} as Record<string, string>,
  });

  // Local state for specifications management
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([]);

  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [filterFaas, setFilterFaas] = useState<"all" | "yes" | "no">("all");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "yes" | "no">(
    "all",
  );
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);



  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("sub_categories")
        .select("id, category_id, name, is_active")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setSubCategories((data as SubCategory[]) || []);
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setProducts((data || []) as any as Product[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || "-";

  const getSubCategoryName = (id: string | null) =>
    subCategories.find((s) => s.id === id)?.name || "-";

  const filteredProducts = products.filter((product) => {
    const matchesSearch = search
      ? product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.slug.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesCategory =
      filterCategoryId === "all" ? true : product.category_id === filterCategoryId;

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? product.is_active
          : !product.is_active;

    const matchesFaas =
      filterFaas === "all"
        ? true
        : filterFaas === "yes"
          ? product.is_faas_enabled
          : !product.is_faas_enabled;

    const matchesFeatured =
      filterFeatured === "all"
        ? true
        : filterFeatured === "yes"
          ? product.featured
          : !product.featured;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesFaas &&
      matchesFeatured
    );
  });

  const visibleProductIds = filteredProducts.map((p) => p.id);
  const allVisibleSelected =
    visibleProductIds.length > 0 &&
    visibleProductIds.every((id) => selectedProductIds.includes(id));

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const updateSelectedProducts = async (
    fields: Partial<Product>,
    successMessage: string,
  ) => {
    if (selectedProductIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("products")
        .update(fields)
        .in("id", selectedProductIds);

      if (error) throw error;

      toast({ title: "Success", description: successMessage });
      setSelectedProductIds([]);
      fetchProducts();
    } catch (error) {
      console.error("Error updating products:", error);
      toast({
        title: "Error",
        description: "Failed to update selected products",
        variant: "destructive",
      });
    }
  };

  const handleBulkActivate = () =>
    updateSelectedProducts({ is_active: true }, "Selected products activated");

  const handleBulkDeactivate = () =>
    updateSelectedProducts({ is_active: false }, "Selected products deactivated");

  const handleBulkToggleField = async (
    field: "is_faas_enabled" | "featured",
  ) => {
    if (selectedProductIds.length === 0) return;

    try {
      const updates = selectedProductIds
        .map((id) => {
          const product = products.find((p) => p.id === id);
          if (!product) return null;
          return {
            id,
            [field]: !product[field],
          } as Partial<Product> & { id: string };
        })
        .filter(Boolean) as Array<Partial<Product> & { id: string }>;

      await Promise.all(
        updates.map((u) =>
          supabase
            .from("products")
            .update({ [field]: u[field] })
            .eq("id", u.id),
        ),
      );

      toast({ title: "Success", description: "Selected products updated" });
      setSelectedProductIds([]);
      fetchProducts();
    } catch (error) {
      console.error("Error toggling field on products:", error);
      toast({
        title: "Error",
        description: "Failed to update selected products",
        variant: "destructive",
      });
    }
  };

  const handleBulkToggleFaas = () => handleBulkToggleField("is_faas_enabled");
  const handleBulkToggleFeatured = () => handleBulkToggleField("featured");



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSave = {
        ...formData,
        category_id: formData.category_id || null,
        sub_category_id: formData.sub_category_id || null,
        specifications: specsList.length > 0 ? specsList.reduce((acc, curr) => {
          if (curr.key.trim()) acc[curr.key.trim()] = curr.value;
          return acc;
        }, {} as Record<string, string>) : null
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(dataToSave)
          .eq("id", editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([dataToSave]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: editingProduct ? "Product updated" : "Product created",
      });

      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted",
      });

      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      category_id: product.category_id || "",
      sub_category_id: product.sub_category_id || "",
      metal_type: product.metal_type || "",
      finish_type: product.finish_type || "",
      is_faas_enabled: product.is_faas_enabled,
      is_active: product.is_active,
      display_order: product.display_order,
      featured: product.featured ?? false,
      price_type: product.price_type || "contact",
      price: product.price || 0,
      original_price: product.original_price || 0,
      price_unit: product.price_unit || "piece",
      specifications: product.specifications || {},
    });

    // Parse specs for the list editor
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      setSpecsList(Object.entries(product.specifications).map(([key, value]) => ({ key, value })));
    } else {
      setSpecsList([
        { key: "Material", value: product.metal_type || "" },
        { key: "Finish", value: product.finish_type || "" },
        { key: "Dimensions", value: "Standard" },
        { key: "Warranty", value: "1 Year" }
      ]);
    }

    await fetchProductImages(product.id);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductImages([]);
    setImageUrlInput("");
    setFormData({
      name: "",
      slug: "",
      description: "",
      category_id: "",
      sub_category_id: "",
      metal_type: "",
      finish_type: "",
      is_faas_enabled: false,
      is_active: true,
      display_order: 0,
      featured: false,
      price_type: "contact",
      price: 0,
      original_price: 0,
      price_unit: "piece",
      specifications: {},
    });
    setSpecsList([{ key: "", value: "" }]);
  };

  const fetchProductImages = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("display_order");

      if (error) throw error;
      setProductImages(data || []);
    } catch (error) {
      console.error("Error fetching product images:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProduct) {
      toast({
        title: "Error",
        description: "Please save the product first before adding images",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const fileName = `${editingProduct.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(fileName);

      const nextOrder =
        productImages.length > 0
          ? Math.max(...productImages.map((img) => img.display_order)) + 1
          : 0;

      const { data: insertData, error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: editingProduct.id,
          image_url: publicUrl,
          display_order: nextOrder,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setProductImages((prev) => [...prev, insertData as ProductImage]);
      toast({ title: "Image uploaded" });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = async () => {
    if (!editingProduct) {
      toast({
        title: "Error",
        description: "Please save the product first before adding images",
        variant: "destructive",
      });
      return;
    }

    if (!imageUrlInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const nextOrder =
        productImages.length > 0
          ? Math.max(...productImages.map((img) => img.display_order)) + 1
          : 0;

      const { data, error } = await supabase
        .from("product_images")
        .insert({
          product_id: editingProduct.id,
          image_url: imageUrlInput.trim(),
          display_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;

      setProductImages((prev) => [...prev, data as ProductImage]);
      setImageUrlInput("");
      toast({ title: "Image added" });
    } catch (error) {
      console.error("Error adding image URL:", error);
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      if (imageUrl.includes("product-images")) {
        const path = imageUrl.split("product-images/")[1];
        if (path) {
          await supabase.storage.from("product-images").remove([path]);
        }
      }

      setProductImages((prev) => prev.filter((img) => img.id !== imageId));
      toast({ title: "Image deleted" });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleReorderImage = async (
    imageId: string,
    direction: "up" | "down",
  ) => {
    const sorted = [...productImages].sort(
      (a, b) => a.display_order - b.display_order,
    );
    const index = sorted.findIndex((img) => img.id === imageId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return;

    const current = sorted[index];
    const target = sorted[targetIndex];

    try {
      const { error: err1 } = await supabase
        .from("product_images")
        .update({ display_order: target.display_order })
        .eq("id", current.id);

      const { error: err2 } = await supabase
        .from("product_images")
        .update({ display_order: current.display_order })
        .eq("id", target.id);

      if (err1 || err2) throw err1 || err2;

      setProductImages((prev) =>
        prev.map((img) => {
          if (img.id === current.id)
            return { ...img, display_order: target.display_order };
          if (img.id === target.id)
            return { ...img, display_order: current.display_order };
          return img;
        }),
      );
    } catch (error) {
      console.error("Error reordering image:", error);
      toast({
        title: "Error",
        description: "Failed to reorder image",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAltText = async (imageId: string, altText: string) => {
    try {
      const { error } = await supabase
        .from("product_images")
        .update({ alt_text: altText || null })
        .eq("id", imageId);

      if (error) throw error;

      setProductImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, alt_text: altText || null } : img)),
      );

      toast({ title: "Alt text updated" });
    } catch (error) {
      console.error("Error updating alt text:", error);
      toast({
        title: "Error",
        description: "Failed to update alt text",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      let newSlug = `${product.slug}-copy`;
      let slugExists = true;
      let counter = 1;

      while (slugExists) {
        const { data } = await supabase
          .from("products")
          .select("id")
          .eq("slug", newSlug)
          .maybeSingle();
        if (!data) {
          slugExists = false;
        } else {
          counter++;
          newSlug = `${product.slug}-copy-${counter}`;
        }
      }

      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert({
          name: `${product.name} (Copy)`,
          slug: newSlug,
          description: product.description,
          category_id: product.category_id,
          sub_category_id: product.sub_category_id,
          metal_type: product.metal_type,
          finish_type: product.finish_type,
          is_faas_enabled: product.is_faas_enabled,
          is_active: false,
          display_order: product.display_order,
          featured: product.featured,
        })
        .select()
        .single();

      if (productError) throw productError;

      const { data: images } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", product.id);

      if (images && images.length > 0) {
        const imagesToInsert = images.map((img) => ({
          product_id: newProduct.id,
          image_url: img.image_url,
          alt_text: img.alt_text,
          display_order: img.display_order,
        }));

        await supabase.from("product_images").insert(imagesToInsert);
      }

      await fetchProducts();
      toast({
        title: "Product duplicated",
        description: "Opening duplicate for editing...",
      });

      handleEdit(newProduct as any as Product);
    } catch (error) {
      console.error("Error duplicating product:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate product",
        variant: "destructive",
      });
    }
  };

  const handleMoveProduct = async (
    product: Product,
    direction: "up" | "down",
  ) => {
    const sorted = [...products].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
    );
    const index = sorted.findIndex((p) => p.id === product.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return;

    const target = sorted[targetIndex];

    try {
      const { error: err1 } = await supabase
        .from("products")
        .update({ display_order: target.display_order })
        .eq("id", product.id);

      const { error: err2 } = await supabase
        .from("products")
        .update({ display_order: product.display_order })
        .eq("id", target.id);

      if (err1 || err2) throw err1 || err2;

      await fetchProducts();
    } catch (error) {
      console.error("Error reordering products", error);
      toast({
        title: "Error",
        description: "Failed to reorder products",
        variant: "destructive",
      });
    }
  };

  const fillDemoData = async (key: string) => {
    const demo = DEMO_PRODUCTS.find(p => p.slug === key);
    if (!demo) return;

    let catId = categories.find(c => c.name === demo.category)?.id;
    let subCatId = "";

    // 1. Handle Category
    if (!catId) {
      toast({ title: "Creating Category...", description: `Adding "${demo.category}" to database.` });
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert({
          name: demo.category,
          slug: demo.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          is_active: true,
          display_order: 99
        })
        .select()
        .single();

      if (catError) {
        console.error("Error creating category:", catError);
        toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
        return;
      }
      catId = newCat.id;
      // Refresh categories list
      await fetchCategories();
    }

    // 2. Handle Sub-Category (if category exists/created)
    if (catId) {
      // Refresh sub-categories to be sure
      const { data: currentSubs } = await supabase.from('sub_categories').select('*').eq('category_id', catId);
      const existingSub = currentSubs?.find(s => s.name === demo.sub_category);

      if (existingSub) {
        subCatId = existingSub.id;
      } else {
        toast({ title: "Creating Sub-Category...", description: `Adding "${demo.sub_category}"` });
        const { data: newSub, error: subError } = await supabase
          .from('sub_categories')
          .insert({
            category_id: catId,
            name: demo.sub_category,
            slug: demo.sub_category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            is_active: true
          })
          .select()
          .single();

        if (!subError && newSub) {
          subCatId = newSub.id;
          await fetchSubCategories();
        }
      }
    }

    setFormData({
      ...formData,
      name: demo.name,
      slug: demo.slug + "-" + Math.floor(Math.random() * 1000),
      description: demo.description,
      category_id: catId || "",
      sub_category_id: subCatId || "",
      metal_type: demo.metal_type,
      finish_type: demo.finish_type,
      is_faas_enabled: demo.is_faas_enabled,
      is_active: demo.is_active,
      display_order: 0,
      featured: demo.featured,
      price_type: demo.price_type as any,
      price: 0,
      original_price: 0,
      price_unit: "piece",
      specifications: {},
    });

    setSpecsList(Object.entries(demo.specifications).map(([key, value]) => ({ key, value })));
    toast({ title: "Demo data filled", description: `Ready to save: ${demo.name}` });
  };

  const DEMO_PRODUCTS = [
    {
      name: "Heavy-Duty Steel Workbench",
      slug: "heavy-duty-steel-workbench",
      category: "Industrial Metal Furniture",
      sub_category: "Heavy Duty Workbenches",
      description: "Heavy-duty industrial steel workbench designed for factory floors, assembly lines, and production environments. Built using high-grade mild steel for superior load-bearing capacity and long service life.",
      specifications: { "Load Capacity": "Up to 1000 kg", "Frame Material": "Mild Steel (MS)", "Top Thickness": "5 mm", "Height": "850 mm", "Custom Size Available": "Yes" },
      metal_type: "MS",
      finish_type: "Powder Coated",
      price_type: "contact",
      is_faas_enabled: false,
      featured: true,
      is_active: true
    },
    {
      name: "Metal Executive Office Desk",
      slug: "metal-executive-office-desk",
      category: "Commercial & Office Metal Furniture",
      sub_category: "Metal Office Desks",
      description: "Modern industrial-style executive office desk with a precision-welded metal frame. Suitable for corporate offices, design studios, and administrative spaces.",
      specifications: { "Frame Material": "MS Square Tube", "Load Capacity": "250 kg", "Finish": "Matte Powder Coated", "Modular Design": "Yes", "Cable Management": "Included" },
      metal_type: "MS",
      finish_type: "Powder Coated",
      price_type: "contact",
      is_faas_enabled: true,
      featured: false,
      is_active: true
    },
    {
      name: "Heavy Duty Pallet Racking System",
      slug: "heavy-duty-pallet-racking-system",
      category: "Storage & Racking Systems",
      sub_category: "Heavy Duty Pallet Racks",
      description: "High-load pallet racking system engineered for warehouses and logistics centers. Designed for maximum storage efficiency and safety.",
      specifications: { "Load Capacity per Level": "2000 kg", "Upright Material": "High-Tensile Steel", "Beam Type": "Box Beam", "Finish": "Industrial Powder Coat", "Expansion Ready": "Yes" },
      metal_type: "MS",
      finish_type: "Powder Coated",
      price_type: "contact",
      is_faas_enabled: false,
      featured: true,
      is_active: true
    },
    {
      name: "Metal School Dual Desk Bench",
      slug: "metal-school-dual-desk-bench",
      category: "Institutional Metal Furniture",
      sub_category: "School Desks & Benches",
      description: "Durable metal desk and bench set designed for schools and educational institutions. Built for long-term use with minimal maintenance.",
      specifications: { "Seating Capacity": "2 Students", "Frame Material": "MS Pipe", "Anti-Rust Coating": "Yes", "Floor Mount Option": "Available" },
      metal_type: "MS",
      finish_type: "Powder Coated",
      price_type: "contact",
      is_faas_enabled: false,
      featured: false,
      is_active: true
    },
    {
      name: "Industrial Restaurant Dining Table",
      slug: "industrial-restaurant-dining-table",
      category: "Hospitality Metal Furniture",
      sub_category: "Restaurant Tables (Metal Base)",
      description: "Industrial-style dining table with a robust metal base, designed for restaurants, cafés, and commercial dining spaces.",
      specifications: { "Base Material": "MS Fabricated Frame", "Seating Capacity": "4–6 Persons", "Finish": "Matte Black Powder Coat", "Outdoor Use": "Optional Treatment Available" },
      metal_type: "MS",
      finish_type: "Powder Coated",
      price_type: "contact",
      is_faas_enabled: true,
      featured: false,
      is_active: true
    },
    {
      name: "Custom MS Fabrication Solution",
      slug: "custom-ms-fabrication-solution",
      category: "Custom Metal Fabrication",
      sub_category: "MS / SS Custom Fabrication",
      description: "End-to-end custom metal fabrication services tailored to industrial and commercial requirements. Designed, engineered, and manufactured in-house.",
      specifications: { "Material Options": "MS / SS / GI", "Design Support": "Included", "Fabrication Process": "CNC, Welding, Finishing", "Customization Level": "High" },
      metal_type: "MS / SS",
      finish_type: "As Required",
      price_type: "contact",
      is_faas_enabled: false,
      featured: true,
      is_active: true
    },
    {
      name: "Industrial Material Handling Trolley",
      slug: "industrial-material-handling-trolley",
      category: "Metal Fixtures & Accessories",
      sub_category: "Industrial Trolleys",
      description: "Heavy-duty industrial trolley designed for efficient material movement inside factories, warehouses, and production units.",
      specifications: { "Load Capacity": "500 kg", "Wheel Type": "PU / Nylon", "Frame Construction": "Welded MS", "Handle Type": "Fixed" },
      metal_type: "MS",
      finish_type: "Powder Coated",
      price_type: "contact",
      is_faas_enabled: true,
      featured: false,
      is_active: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Products</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center pr-8">
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                {!editingProduct && (
                  <Select onValueChange={fillDemoData}>
                    <SelectTrigger className="w-[180px] h-8 text-xs bg-slate-100 dark:bg-slate-800 border-none">
                      <SelectValue placeholder="✨ Fill Demo Data" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_PRODUCTS.map(p => (
                        <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="industrial-metal-chair"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        category_id: value,
                        sub_category_id: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sub-Category</Label>
                  <Select
                    value={formData.sub_category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sub_category_id: value })
                    }
                    disabled={!formData.category_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories
                        .filter(
                          (sub) => sub.category_id === formData.category_id,
                        )
                        .map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Specifications</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSpecsList([...specsList, { key: "", value: "" }])}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Spec
                  </Button>
                </div>
                <div className="space-y-2 border rounded-lg p-3 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700 max-h-[200px] overflow-y-auto">
                  {specsList.map((spec, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Key (e.g. Dimensions)"
                        value={spec.key}
                        onChange={(e) => {
                          const newList = [...specsList];
                          newList[idx].key = e.target.value;
                          setSpecsList(newList);
                        }}
                        className="flex-1 bg-white dark:bg-slate-900 h-8 text-sm dark:border-slate-700 dark:text-white"
                      />
                      <Input
                        placeholder="Value (e.g. 120x60cm)"
                        value={spec.value}
                        onChange={(e) => {
                          const newList = [...specsList];
                          newList[idx].value = e.target.value;
                          setSpecsList(newList);
                        }}
                        className="flex-1 bg-white dark:bg-slate-900 h-8 text-sm dark:border-slate-700 dark:text-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                        onClick={() => setSpecsList(specsList.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {specsList.length === 0 && (
                    <p className="text-xs text-center text-slate-400 py-2">No specifications added</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Metal Type</Label>
                  <Input
                    value={formData.metal_type}
                    onChange={(e) =>
                      setFormData({ ...formData, metal_type: e.target.value })
                    }
                    placeholder="MS / SS"
                  />
                </div>
                <div>
                  <Label>Finish Type</Label>
                  <Input
                    value={formData.finish_type}
                    onChange={(e) =>
                      setFormData({ ...formData, finish_type: e.target.value })
                    }
                    placeholder="Powder Coated"
                  />
                </div>
              </div>

              {/* Pricing Configuration */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold flex items-center gap-2">Pricing Configuration</h3>

                <div className="space-y-3">
                  <Label>Pricing Type</Label>
                  <RadioGroup
                    value={formData.price_type}
                    onValueChange={(val: "fixed" | "contact" | "fixed_custom") =>
                      setFormData({ ...formData, price_type: val })
                    }
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className={`border rounded-lg p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-700 ${formData.price_type === 'fixed' ? 'ring-2 ring-brand-orange bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="pt-fixed" />
                        <Label htmlFor="pt-fixed" className="font-semibold cursor-pointer">Fixed Price</Label>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 ml-6">Show exact price. Standard e-commerce behavior.</p>
                    </div>

                    <div className={`border rounded-lg p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-700 ${formData.price_type === 'contact' ? 'ring-2 ring-brand-orange bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="contact" id="pt-contact" />
                        <Label htmlFor="pt-contact" className="font-semibold cursor-pointer">Contact for Price</Label>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 ml-6">Hide price. "Get Quote" button redirects to inquiry.</p>
                    </div>

                    <div className={`border rounded-lg p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-700 ${formData.price_type === 'fixed_custom' ? 'ring-2 ring-brand-orange bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed_custom" id="pt-custom" />
                        <Label htmlFor="pt-custom" className="font-semibold cursor-pointer">Fixed + Custom</Label>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 ml-6">Show "Starting from ₹...". Indicates customization available.</p>
                    </div>
                  </RadioGroup>
                </div>

                {/* Conditional Price Fields */}
                {formData.price_type !== 'contact' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in-50">
                    <div>
                      <Label>{formData.price_type === 'fixed_custom' ? 'Starting Price (₹)' : 'Price (₹)'} *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Original Price (₹) <span className="text-slate-400 font-normal text-xs">(Optional)</span></Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.original_price || ""}
                        onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                        placeholder="For strike-through"
                      />
                    </div>
                    <div>
                      <Label>Unit <span className="text-slate-400 font-normal text-xs">(e.g. piece, set)</span></Label>
                      <Input
                        value={formData.price_unit || ""}
                        onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                        placeholder="piece"
                      />
                    </div>
                  </div>
                )}

                {formData.price_type === 'contact' && (
                  <div className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 p-3 rounded-md text-sm border border-blue-100 dark:border-blue-800 flex gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Note:</strong> Users will see a "Contact for Price" badge. The "Get Quote" button will open your configured CTA (WhatsApp/Form).
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value || "0", 10),
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="cursor-pointer" htmlFor="faas-toggle">Available for FaaS</Label>
                  </div>
                  <Switch
                    id="faas-toggle"
                    checked={formData.is_faas_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_faas_enabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="cursor-pointer" htmlFor="featured-toggle">Featured Product</Label>
                  </div>
                  <Switch
                    id="featured-toggle"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="cursor-pointer" htmlFor="active-toggle">Active Status</Label>
                  </div>
                  <Switch
                    id="active-toggle"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Product Images
                </h3>

                {editingProduct ? (
                  <>
                    <div className="grid gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="space-y-2">
                        <Label>Upload Image</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="bg-white"
                          />
                          {uploadingImage && (
                            <span className="text-sm text-muted-foreground animate-pulse">
                              Uploading...
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Or Add Image URL</Label>
                        <div className="flex gap-2">
                          <Input
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="bg-white"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAddImageUrl}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    {productImages.length > 0 && (
                      <div className="space-y-2">
                        <Label>Gallery ({productImages.length})</Label>
                        <div className="space-y-2 max-h-80 overflow-y-auto border rounded-md p-2 bg-white">
                          {productImages
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((img, index) => (
                              <div
                                key={img.id}
                                className="flex items-center gap-3 bg-slate-50 rounded-md p-2 border border-slate-100 group"
                              >
                                <GripVertical className="h-4 w-4 text-slate-400" />
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border bg-white">
                                  <img
                                    src={img.image_url}
                                    className="h-full w-full object-cover"
                                    alt="Product thumbnail"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <Input
                                    placeholder="Alt text (optional)"
                                    value={img.alt_text || ""}
                                    onChange={(e) =>
                                      handleUpdateAltText(
                                        img.id,
                                        e.target.value,
                                      )
                                    }
                                    className="text-sm h-8 bg-white"
                                  />
                                </div>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    disabled={index === 0}
                                    onClick={() =>
                                      handleReorderImage(img.id, "up")
                                    }
                                    className="h-8 w-8 hover:bg-white"
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    disabled={index === productImages.length - 1}
                                    onClick={() =>
                                      handleReorderImage(img.id, "down")
                                    }
                                    className="h-8 w-8 hover:bg-white"
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      handleDeleteImage(img.id, img.image_url)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200">
                    Please create the product first. You can upload images in the edit screen.
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-brand-orange hover:bg-brand-orange/90 text-white min-w-[120px]">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <div className="relative md:max-w-xs w-full">
              <Input
                placeholder="Search by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white focus-visible:ring-brand-orange"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
            </div>

            <Select
              value={filterCategoryId}
              onValueChange={(value) => setFilterCategoryId(value)}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Select
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as "all" | "active" | "inactive")
                }
              >
                <SelectTrigger className="w-[120px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterFaas}
                onValueChange={(value) =>
                  setFilterFaas(value as "all" | "yes" | "no")
                }
              >
                <SelectTrigger className="w-[110px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white">
                  <SelectValue placeholder="FaaS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All FaaS</SelectItem>
                  <SelectItem value="yes">FaaS Only</SelectItem>
                  <SelectItem value="no">Non-FaaS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-slate-100" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <BoxIcon className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No products found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearch("");
                  setFilterCategoryId("all");
                  setFilterStatus("all");
                }}
                className="mt-2 text-brand-orange"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="border-t border-slate-100 dark:border-slate-800">
              {selectedProductIds.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {selectedProductIds.length} selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 bg-white dark:bg-slate-800" onClick={handleBulkActivate}>Activate</Button>
                    <Button size="sm" variant="outline" className="h-8 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 bg-white dark:bg-slate-800" onClick={handleBulkDeactivate}>Deactivate</Button>
                    <Button size="sm" variant="outline" className="h-8 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 bg-white dark:bg-slate-800" onClick={handleBulkToggleFaas}>FaaS</Button>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800">
                  <TableRow>
                    <TableHead className="w-12 pl-4">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProductIds((prev) => [...prev, ...visibleProductIds.filter(id => !prev.includes(id))]);
                          } else {
                            setSelectedProductIds((prev) => prev.filter(id => !visibleProductIds.includes(id)));
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="w-16 font-semibold text-slate-700 dark:text-slate-300">Order</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">Name</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Category</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Sub-Category</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Metal Info</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">FaaS</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Featured</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 dark:border-slate-800 transition-colors group">
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={() => toggleSelectProduct(product.id)}
                        />
                      </TableCell>
                      <TableCell className="text-slate-500 font-mono text-xs">{product.display_order}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white line-clamp-1">{product.name}</span>
                          <span className="text-xs text-slate-400 line-clamp-1">{product.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-sm">{getCategoryName(product.category_id)}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-sm">{getSubCategoryName(product.sub_category_id)}</TableCell>
                      <TableCell>
                        {product.metal_type ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {product.metal_type}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.is_faas_enabled ? (
                          <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" title="Available for FaaS" />
                        ) : (
                          <span className="inline-flex h-2 w-2 rounded-full bg-slate-200" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.featured ? (
                          <span className="inline-flex items-center justify-center p-1 rounded-full bg-yellow-100 text-yellow-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                            onClick={() => handleMoveProduct(product, "up")}
                            title="Move Up"
                          >
                            ↑
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                            onClick={() => handleMoveProduct(product, "down")}
                            title="Move Down"
                          >
                            ↓
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => handleDuplicateProduct(product)}
                            title="Duplicate"
                          >
                            <Copy size={16} />
                          </Button>
                          <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              title="View on Site"
                            >
                              <ExternalLink size={16} />
                            </Button>
                          </a>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-brand-orange"
                            onClick={() => handleEdit(product)}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                            onClick={() => handleDelete(product.id)}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}


export default AdminProducts;
