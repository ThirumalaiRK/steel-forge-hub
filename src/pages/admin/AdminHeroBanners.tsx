import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MoveUp, MoveDown, Check, X, Image as ImageIcon, Smartphone, Monitor } from "lucide-react";
import { BannerPreview } from "@/components/admin/hero-banners/BannerPreview";
import { Badge } from "@/components/ui/badge";

// Extended interface matching the new capabilities
interface HeroBanner {
  id: any;
  title: string;
  subtitle: string;
  image_url: string;
  desktop_image_url: string;
  mobile_image_url: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
  display_order: number;
  // New Fields
  type: "standard" | "hero_offer" | "announcement" | "campaign";
  placement: "home_hero" | "home_secondary" | "category_hero" | "plp_top" | "global_promo";
  start_date: string | null;
  end_date: string | null;
  discount_text: string | null;
  offer_badge_style: "pill" | "ribbon" | "corner";
  cta_style: "primary" | "secondary" | "outline";
  cta_action_type: "internal" | "external" | "whatsapp" | "scroll";
  audience: "all" | "logged_in" | "admin_only";
  device_target: "all" | "desktop" | "mobile";
}

const AdminHeroBanners = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // File states
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [previewDesktop, setPreviewDesktop] = useState<string | null>(null);
  const [previewMobile, setPreviewMobile] = useState<string | null>(null);

  const initialFormState: Omit<HeroBanner, "id"> = {
    title: "",
    subtitle: "",
    image_url: "",
    desktop_image_url: "",
    mobile_image_url: "",
    cta_text: "Shop Now",
    cta_link: "/products",
    is_active: true,
    display_order: 0,
    type: "standard",
    placement: "home_hero",
    start_date: null,
    end_date: null,
    discount_text: "",
    offer_badge_style: "pill",
    cta_style: "primary",
    cta_action_type: "internal",
    audience: "all",
    device_target: "all",
  };

  const [formData, setFormData] = useState<Omit<HeroBanner, "id">>(initialFormState);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    // Filter OUT 'offer' type which belongs to AdminOffers page
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .neq("type", "offer")
      .order("display_order", { ascending: true });

    if (error) {
      toast({ title: "Error fetching banners", description: error.message, variant: "destructive" });
    } else {
      setBanners((data as any) || []);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setDesktopFile(null);
    setMobileFile(null);
    setPreviewDesktop(null);
    setPreviewMobile(null);
    setActiveTab("content");
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingId(banner.id);
    setFormData({
      ...initialFormState, // Ensure defaults for new fields if missing
      ...banner,
    });
    setPreviewDesktop(banner.desktop_image_url);
    setPreviewMobile(banner.mobile_image_url);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'desktop') {
        setDesktopFile(file);
        setPreviewDesktop(URL.createObjectURL(file));
      } else {
        setMobileFile(file);
        setPreviewMobile(URL.createObjectURL(file));
      }
    }
  };

  const uploadFile = async (file: File) => {
    const bucket = 'offers'; // Using existing bucket
    const path = `banners/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({ title: "Validation Error", description: "Title is required", variant: "destructive" });
      return false;
    }
    // Logic: If no existing URL and no file, error
    if (!formData.desktop_image_url && !desktopFile) {
      toast({ title: "Validation Error", description: "Desktop image is required", variant: "destructive" });
      return false;
    }
    if (formData.cta_text && !formData.cta_link) {
      toast({ title: "Validation Error", description: "CTA Link is required if CTA Text is present", variant: "destructive" });
      return false;
    }
    if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      toast({ title: "Validation Error", description: "End date cannot be before start date", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      let desktopUrl = formData.desktop_image_url;
      let mobileUrl = formData.mobile_image_url;

      if (desktopFile) desktopUrl = await uploadFile(desktopFile);
      if (mobileFile) mobileUrl = await uploadFile(mobileFile);

      const payload = {
        ...formData,
        desktop_image_url: desktopUrl,
        mobile_image_url: mobileUrl,
        image_url: desktopUrl, // Fallback legacy
      };

      if (editingId) {
        const { error } = await supabase.from("hero_banners").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Success", description: "Banner updated successfully" });
      } else {
        const { error } = await supabase.from("hero_banners").insert([payload]);
        if (error) throw error;
        toast({ title: "Success", description: "Banner created successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error saving banner", description: error.message || "Unknown error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Delete this banner?")) return;
    const { error } = await supabase.from("hero_banners").delete().eq("id", id);
    if (!error) {
      toast({ title: "Deleted", description: "Banner removed" });
      fetchBanners();
    }
  };

  const handleReorder = async (id: any, direction: "up" | "down") => {
    const bannerToMove = banners.find((b) => b.id === id);
    if (!bannerToMove) return;
    const currentIndex = banners.indexOf(bannerToMove);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;
    const otherBanner = banners[newIndex];

    try {
      // Try using the RPC if available
      const { error } = await supabase.rpc('swap_hero_banner_order' as any, {
        banner1_id: bannerToMove.id,
        banner2_id: otherBanner.id
      });
      if (error) throw error;
      fetchBanners();
    } catch (e) {
      // Fallback: manually swap display_order
      const p1 = bannerToMove.display_order;
      const p2 = otherBanner.display_order;
      await supabase.from("hero_banners").update({ display_order: p2 }).eq("id", bannerToMove.id);
      await supabase.from("hero_banners").update({ display_order: p1 }).eq("id", otherBanner.id);
      fetchBanners();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Hero Banners Manager</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage homepage and campaign banners with advanced controls.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-brand-orange hover:bg-brand-orange/90">
          <Plus className="mr-2 h-4 w-4" /> Add New Banner
        </Button>
      </div>

      {/* Main Table */}
      <div className="border rounded-lg bg-white dark:bg-slate-900 shadow-sm overflow-hidden dark:border-slate-700">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800">
            <TableRow className="dark:border-slate-800 hover:bg-transparent dark:hover:bg-transparent">
              <TableHead className="w-[80px] dark:text-slate-300">Order</TableHead>
              <TableHead className="w-[100px] dark:text-slate-300">Preview</TableHead>
              <TableHead className="dark:text-slate-300">Title & Type</TableHead>
              <TableHead className="dark:text-slate-300">Placement</TableHead>
              <TableHead className="dark:text-slate-300">Status</TableHead>
              <TableHead className="text-right dark:text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner, index) => (
              <TableRow key={banner.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:border-slate-800">
                <TableCell className="font-mono text-slate-500 dark:text-slate-400">{banner.display_order}</TableCell>
                <TableCell>
                  <div className="h-12 w-20 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden border dark:border-slate-700">
                    <img src={banner.desktop_image_url || banner.image_url} className="h-full w-full object-cover" alt="Thumb" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900 dark:text-white">{banner.title}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs uppercase dark:text-slate-300 dark:border-slate-700">{banner.type === 'hero_offer' ? 'Offer' : banner.type}</Badge>
                    {banner.discount_text && <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">{banner.discount_text}</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-600 capitalize dark:text-slate-400">{banner.placement?.replace('_', ' ') || 'Home Hero'}</TableCell>
                <TableCell>
                  <Badge className={banner.is_active ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300" : "bg-slate-100 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400"}>
                    {banner.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => handleReorder(banner.id, "up")} className="hover:bg-slate-100 dark:hover:bg-slate-800"><MoveUp className="h-4 w-4 text-slate-400" /></Button>
                    <Button variant="ghost" size="icon" disabled={index === banners.length - 1} onClick={() => handleReorder(banner.id, "down")} className="hover:bg-slate-100 dark:hover:bg-slate-800"><MoveDown className="h-4 w-4 text-slate-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)} className="hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="h-4 w-4 text-blue-500 dark:text-blue-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-red-600 dark:hover:bg-red-900/20 dark:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {banners.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No banners found. Create one to get started.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Modal - Full Width */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 [&>button]:hidden">
          <div className="p-6 border-b bg-white dark:bg-slate-900 flex justify-between items-center dark:border-slate-800">
            <DialogTitle className="text-xl dark:text-white">{editingId ? "Edit Banner" : "Create New Banner"}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700">Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-brand-orange hover:bg-brand-orange/90">
                {isSubmitting ? "Saving..." : "Save Banner"}
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel: Form */}
            <div className="w-1/2 overflow-y-auto p-6 bg-white dark:bg-slate-900 border-r dark:border-slate-800">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="content" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">Content</TabsTrigger>
                  <TabsTrigger value="settings" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">Settings</TabsTrigger>
                  <TabsTrigger value="schedule" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">Schedule</TabsTrigger>
                  <TabsTrigger value="advanced" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">Targeting</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6 animate-in fade-in-50">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title" className="text-slate-900 font-semibold dark:text-white">Banner Title <span className="text-red-500">*</span></Label>
                      <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Industrial Solutions 2024" className="text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="subtitle" className="dark:text-slate-300">Subtitle</Label>
                      <Textarea id="subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Brief description..." className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="dark:text-slate-300">Desktop Image <span className="text-slate-400 text-xs font-normal">(1920x800 recommended)</span></Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group h-48 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:border-slate-700">
                        <Input type="file" onChange={(e) => handleFileChange(e, 'desktop')} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                        {previewDesktop ? (
                          <div className="relative w-full h-full p-2">
                            <img src={previewDesktop} className="h-full w-full object-contain" />
                            <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">Change</div>
                          </div>
                        ) : (
                          <div className="text-slate-400 flex flex-col items-center">
                            <ImageIcon className="h-8 w-8 mb-2" />
                            <span className="text-sm font-medium">Upload Desktop</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="dark:text-slate-300">Mobile Image <span className="text-slate-400 text-xs font-normal">(1080x1350 recommended)</span></Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group h-48 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:border-slate-700">
                        <Input type="file" onChange={(e) => handleFileChange(e, 'mobile')} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                        {previewMobile ? (
                          <div className="relative w-full h-full p-2">
                            <img src={previewMobile} className="h-full w-full object-contain" />
                            <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">Change</div>
                          </div>
                        ) : (
                          <div className="text-slate-400 flex flex-col items-center">
                            <Smartphone className="h-8 w-8 mb-2" />
                            <span className="text-sm font-medium">Upload Mobile</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">CTA Text</Label>
                      <Input value={formData.cta_text} onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })} placeholder="e.g. Shop Now" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">CTA Link</Label>
                      <Input value={formData.cta_link} onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })} placeholder="/products" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <div className="space-y-4">
                    <Label className="dark:text-slate-300">Banner Placement</Label>
                    <Select value={formData.placement} onValueChange={(val: any) => setFormData({ ...formData, placement: val })}>
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <SelectItem value="home_hero">Homepage - Main Hero</SelectItem>
                        <SelectItem value="home_secondary">Homepage - Secondary Offer</SelectItem>
                        <SelectItem value="category_hero">Category Page Hero</SelectItem>
                        <SelectItem value="global_promo">Global Ribbon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="dark:text-slate-300">Banner Type</Label>
                    <RadioGroup value={formData.type} onValueChange={(val: any) => setFormData({ ...formData, type: val })} className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                        <RadioGroupItem value="standard" id="type-std" className="dark:border-slate-500 dark:text-brand-orange" />
                        <Label htmlFor="type-std" className="dark:text-slate-300">Standard</Label>
                      </div>
                      <div className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                        <RadioGroupItem value="hero_offer" id="type-offer" className="dark:border-slate-500 dark:text-brand-orange" />
                        <Label htmlFor="type-offer" className="dark:text-slate-300">Offer / Sale</Label>
                      </div>
                      <div className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                        <RadioGroupItem value="announcement" id="type-announcement" className="dark:border-slate-500 dark:text-brand-orange" />
                        <Label htmlFor="type-announcement" className="dark:text-slate-300">Announcement</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.type === 'hero_offer' && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-lg space-y-4">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-300">Offer Configuration</h4>
                      <div className="grid gap-2">
                        <Label className="dark:text-slate-300">Discount Text</Label>
                        <Input value={formData.discount_text || ""} onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })} placeholder="UP TO 50% OFF" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="dark:text-slate-300">Badge Style</Label>
                        <Select value={formData.offer_badge_style} onValueChange={(val: any) => setFormData({ ...formData, offer_badge_style: val })}>
                          <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                            <SelectItem value="pill">Pill Shape</SelectItem>
                            <SelectItem value="ribbon">Ribbon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="schedule" className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300 mb-4">
                    Scheduling allows you to automate when this banner appears. Leave blank to activate manually immediately.
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">Start Date & Time</Label>
                      <Input type="datetime-local" value={formData.start_date || ""} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">End Date & Time</Label>
                      <Input type="datetime-local" value={formData.end_date || ""} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                    <Label className="dark:text-slate-300">Manually Activate Banner</Label>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  <div className="space-y-4">
                    <Label className="dark:text-slate-300">CTA Style</Label>
                    <div className="flex gap-2">
                      {(['primary', 'secondary', 'outline'] as const).map(style => (
                        <div key={style}
                          onClick={() => setFormData({ ...formData, cta_style: style })}
                          className={`cursor-pointer px-4 py-2 rounded border capitalize ${formData.cta_style === style ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black' : 'bg-white text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                          {style}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t dark:border-slate-700">
                    <Label className="dark:text-slate-300">Targeting (Who sees this?)</Label>
                    <Select value={formData.audience} onValueChange={(val: any) => setFormData({ ...formData, audience: val })}>
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <SelectItem value="all">Every Visitor</SelectItem>
                        <SelectItem value="logged_in">Logged-in Users Only</SelectItem>
                        <SelectItem value="admin_only">Admins Only (Draft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel: Live Preview */}
            {/* Right Panel: Live Preview */}
            <div className="w-1/2 bg-slate-900 p-8 flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 z-10">
                <div className="text-white/50 text-xs uppercase tracking-widest">Live Preview</div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-1 flex border border-white/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={viewMode === 'desktop' ? 'bg-white/20 text-white' : 'text-slate-400'}
                    onClick={() => setViewMode('desktop')}>
                    <Monitor className="h-4 w-4 mr-2" /> Desktop
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={viewMode === 'mobile' ? 'bg-white/20 text-white' : 'text-slate-400'}
                    onClick={() => setViewMode('mobile')}>
                    <Smartphone className="h-4 w-4 mr-2" /> Mobile
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
                <div className={viewMode === 'mobile' ? "w-full max-w-[375px]" : "w-full max-w-4xl"}>
                  <BannerPreview
                    data={{
                      ...formData,
                      type: formData.type === 'hero_offer' ? 'offer' : formData.type,
                      desktop_image_url: previewDesktop || formData.desktop_image_url,
                      mobile_image_url: previewMobile || formData.mobile_image_url,
                      image_url: previewDesktop || formData.image_url
                    } as any}
                    viewMode={viewMode}
                    className="w-full shadow-xl"
                  />
                  <div className="mt-8 text-center text-xs text-slate-500">
                    Preview reflects approximate appearance. Actual rendering may vary based on user screen size.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHeroBanners;