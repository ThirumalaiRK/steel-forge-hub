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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MoveUp, MoveDown, Image as ImageIcon, Smartphone, Monitor, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OfferPreview } from "@/components/admin/offers/OfferPreview";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Offer {
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
  start_date: string | null;
  end_date: string | null;
  type: 'offer'; // Fixed
  // Extended fields
  layout_type: 'large' | 'medium' | 'small';
  offer_position: 'left' | 'right' | 'auto'; // mapped to 'placement' in DB ideally, or new col
  badge_text: string; // mapped to 'discount_text' in DB ideally
  text_alignment: 'left' | 'center' | 'right';
  overlay_strength: 'light' | 'medium' | 'dark';
  target_page: 'home' | 'products' | 'both';
}

const AdminOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // File states
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [previewDesktop, setPreviewDesktop] = useState<string | null>(null);
  const [previewMobile, setPreviewMobile] = useState<string | null>(null);

  // Category helper
  const [categories, setCategories] = useState<any[]>([]);

  const initialFormState: Omit<Offer, "id"> = {
    title: "",
    subtitle: "",
    image_url: "",
    desktop_image_url: "",
    mobile_image_url: "",
    cta_text: "Shop Now",
    cta_link: "/products",
    is_active: true,
    display_order: 0,
    start_date: null,
    end_date: null,
    type: 'offer',
    layout_type: 'medium',
    offer_position: 'auto',
    badge_text: "",
    text_alignment: 'left',
    overlay_strength: 'medium',
    target_page: 'home',
  };

  const [formData, setFormData] = useState<Omit<Offer, "id">>(initialFormState);

  useEffect(() => {
    fetchOffers();
    fetchCategories();
  }, []);

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .eq('type', 'offer')
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Error fetching offers: " + error.message);
    } else {
      setOffers((data as any) || []);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, slug');
    if (data) setCategories(data);
  }

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setDesktopFile(null);
    setMobileFile(null);
    setPreviewDesktop(null);
    setPreviewMobile(null);
    setActiveTab("basic");
  };

  const handleEdit = (offer: Offer) => {
    setEditingId(offer.id);
    setFormData({
      ...initialFormState,
      ...offer,
      // Map potential DB column mismatch if using different names
      badge_text: (offer as any).discount_text || offer.badge_text || "",
      offer_position: (offer as any).placement || offer.offer_position || "auto",
    });
    setPreviewDesktop(offer.desktop_image_url);
    setPreviewMobile(offer.mobile_image_url);
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
    const bucket = 'offers';
    const path = `offers/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!formData.title) return toast.error("Title is required");
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
        image_url: desktopUrl, // fallback
        // Map to DB columns
        discount_text: formData.badge_text, // Map badge to discount_text column
        placement: formData.offer_position, // Map position to placement column
      };

      if (editingId) {
        const { error } = await supabase.from("hero_banners").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Offer updated");
      } else {
        const { error } = await supabase.from("hero_banners").insert([payload]);
        if (error) throw error;
        toast.success("Offer created");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchOffers();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Delete this offer?")) return;
    const { error } = await supabase.from("hero_banners").delete().eq("id", id);
    if (!error) {
      toast.success("Offer deleted");
      fetchOffers();
    }
  };

  const handleReorder = async (id: any, direction: "up" | "down") => {
    const index = offers.findIndex(o => o.id === id);
    if (index === -1) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= offers.length) return;

    // Optimistic swap
    const other = offers[newIndex];

    try {
      const { error } = await supabase.rpc('swap_hero_banner_order' as any, {
        banner1_id: id,
        banner2_id: other.id
      });
      if (error) throw error;
      fetchOffers();
    } catch {
      // Manual fallback
      const o1 = offers[index];
      const o2 = offers[newIndex];
      await supabase.from("hero_banners").update({ display_order: o2.display_order }).eq("id", o1.id);
      await supabase.from("hero_banners").update({ display_order: o1.display_order }).eq("id", o2.id);
      fetchOffers();
    }
  };

  // Helper to link category
  const applyCategoryLink = (slug: string) => {
    setFormData({ ...formData, cta_link: `/products/${slug}` });
    toast.info(`Linked to category: ${slug}`);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Offers Manager</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage promotional offers and banners.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-brand-orange hover:bg-brand-orange/90">
          <Plus className="mr-2 h-4 w-4" /> Add New Offer
        </Button>
      </div>

      <div className="border rounded-lg bg-white dark:bg-slate-900 shadow-sm overflow-hidden dark:border-slate-700">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800">
            <TableRow className="dark:border-slate-800 hover:bg-transparent dark:hover:bg-transparent">
              <TableHead className="w-[80px] dark:text-slate-300">Order</TableHead>
              <TableHead className="w-[120px] dark:text-slate-300">Preview</TableHead>
              <TableHead className="dark:text-slate-300">Title & Layout</TableHead>
              <TableHead className="dark:text-slate-300">Targeting</TableHead>
              <TableHead className="dark:text-slate-300">Status</TableHead>
              <TableHead className="text-right dark:text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer, index) => {
              const isExpired = offer.end_date && new Date(offer.end_date) < new Date();
              return (
                <TableRow key={offer.id} className={`${isExpired ? "bg-slate-50/50 dark:bg-slate-800/20 opacity-70" : ""} hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:border-slate-800`}>
                  <TableCell className="font-mono text-slate-500 dark:text-slate-400">{offer.display_order}</TableCell>
                  <TableCell>
                    <div className="h-16 w-24 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden border relative dark:border-slate-700">
                      <img src={offer.desktop_image_url || offer.image_url} className="h-full w-full object-cover" />
                      {offer.badge_text && <div className="absolute top-1 left-1 bg-brand-orange text-white text-[8px] px-1 rounded">{offer.badge_text}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900 dark:text-white">{offer.title}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs uppercase bg-white dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600">{offer.layout_type}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-sm text-slate-600 dark:text-slate-400">
                    {offer.target_page} • {offer.offer_position}
                  </TableCell>
                  <TableCell>
                    {isExpired ? (
                      <Badge variant="destructive" className="dark:bg-red-900/30 dark:text-red-300">Expired</Badge>
                    ) : (
                      <Badge className={offer.is_active ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300" : "bg-slate-100 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400"}>
                        {offer.is_active ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => handleReorder(offer.id, "up")} className="hover:bg-slate-100 dark:hover:bg-slate-800"><MoveUp className="h-4 w-4 text-slate-400" /></Button>
                      <Button variant="ghost" size="icon" disabled={index === offers.length - 1} onClick={() => handleReorder(offer.id, "down")} className="hover:bg-slate-100 dark:hover:bg-slate-800"><MoveDown className="h-4 w-4 text-slate-400" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)} className="hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="h-4 w-4 text-blue-500 dark:text-blue-400" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id)} className="text-red-500 hover:text-red-600 dark:hover:bg-red-900/20 dark:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {offers.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No offers found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 [&>button]:hidden">
          <div className="p-6 border-b bg-white dark:bg-slate-900 flex justify-between items-center dark:border-slate-800">
            <DialogTitle className="text-xl dark:text-white">{editingId ? "Edit Offer" : "Create New Offer"}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700">Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-brand-orange hover:bg-brand-orange/90">
                {isSubmitting ? "Saving..." : "Save Offer"}
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel: Form */}
            <div className="w-1/2 overflow-y-auto p-6 bg-white dark:bg-slate-900 border-r dark:border-slate-800">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="basic" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">Basic Info</TabsTrigger>
                  <TabsTrigger value="appearance" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">Appearance</TabsTrigger>
                  <TabsTrigger value="scheduling" className="dark:data-[state=active]:bg-slate-900 dark:text-slate-400 dark:data-[state=active]:text-white">Scheduling</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="space-y-4">
                    <Label className="dark:text-slate-300">Title & Subtitle</Label>
                    <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Offer Title (e.g. FLASH SALE)" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    <Textarea value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Subtitle (details)..." className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="dark:text-slate-300">Desktop Image</Label>
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
                      <Label className="dark:text-slate-300">Mobile Image</Label>
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
                      <Input value={formData.cta_text} onChange={e => setFormData({ ...formData, cta_text: e.target.value })} placeholder="Shop Now" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">CTA Link</Label>
                      <Input value={formData.cta_link} onChange={e => setFormData({ ...formData, cta_link: e.target.value })} placeholder="/products/..." className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t dark:border-slate-700">
                    <Label className="text-xs text-slate-400 uppercase">Quick Link from Category</Label>
                    <Select onValueChange={applyCategoryLink}>
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"><SelectValue placeholder="Select a Category to auto-fill link" /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                  <div className="space-y-4">
                    <Label className="dark:text-slate-300">Offer Layout Type <span className="text-slate-400 font-normal text-xs ml-2">(Determines size on grid)</span></Label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['large', 'medium', 'small'] as const).map(type => (
                        <div key={type}
                          onClick={() => setFormData({ ...formData, layout_type: type })}
                          className={`cursor-pointer border rounded-lg p-4 text-center hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 ${formData.layout_type === type ? 'ring-2 ring-brand-orange bg-orange-50 dark:bg-slate-800' : 'dark:bg-slate-900'}`}>
                          <div className="font-semibold capitalize dark:text-white">{type}</div>
                          <div className="text-xs text-slate-500 mt-1">{type === 'large' ? 'Primary (2/3)' : 'Secondary (1/3)'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="dark:text-slate-300">Badge Text</Label>
                      <Input value={formData.badge_text} onChange={e => setFormData({ ...formData, badge_text: e.target.value })} placeholder="e.g. 50% OFF" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="space-y-3">
                      <Label className="dark:text-slate-300">Overlay Strength</Label>
                      <Select value={formData.overlay_strength} onValueChange={(v: any) => setFormData({ ...formData, overlay_strength: v })}>
                        <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="dark:text-slate-300">Text Alignment</Label>
                    <RadioGroup value={formData.text_alignment} onValueChange={(v: any) => setFormData({ ...formData, text_alignment: v })} className="flex space-x-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="left" id="align-left" className="dark:border-slate-500 dark:text-brand-orange" /><Label htmlFor="align-left" className="dark:text-slate-300">Left</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="center" id="align-center" className="dark:border-slate-500 dark:text-brand-orange" /><Label htmlFor="align-center" className="dark:text-slate-300">Center</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="right" id="align-right" className="dark:border-slate-500 dark:text-brand-orange" /><Label htmlFor="align-right" className="dark:text-slate-300">Right</Label></div>
                    </RadioGroup>
                  </div>
                </TabsContent>

                <TabsContent value="scheduling" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">Start Date</Label>
                      <Input type="datetime-local" value={formData.start_date || ""} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">End Date</Label>
                      <Input type="datetime-local" value={formData.end_date || ""} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t dark:border-slate-700">
                    <Label className="dark:text-slate-300">Target Page</Label>
                    <Select value={formData.target_page} onValueChange={(v: any) => setFormData({ ...formData, target_page: v })}>
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <SelectItem value="home">Home Page Only</SelectItem>
                        <SelectItem value="products">Products Page Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <Switch checked={formData.is_active} onCheckedChange={checked => setFormData({ ...formData, is_active: checked })} />
                    <Label className="dark:text-slate-300">Active Status</Label>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel: Preview */}
            <div className="w-1/2 bg-slate-900 p-8 flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 z-10">
                <div className="text-white/50 text-xs uppercase tracking-widest">Live Preview</div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-1 flex border border-white/20">
                  <Button variant="ghost" size="sm" className={viewMode === 'desktop' ? 'bg-white/20 text-white' : 'text-slate-400'} onClick={() => setViewMode('desktop')}><Monitor className="h-4 w-4 mr-2" /> Desktop</Button>
                  <Button variant="ghost" size="sm" className={viewMode === 'mobile' ? 'bg-white/20 text-white' : 'text-slate-400'} onClick={() => setViewMode('mobile')}><Smartphone className="h-4 w-4 mr-2" /> Mobile</Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
                <div className={viewMode === 'mobile' ? "w-full max-w-[375px]" : "w-full max-w-4xl"}>
                  <OfferPreview
                    data={{
                      ...formData,
                      desktop_image_url: previewDesktop || formData.desktop_image_url,
                      mobile_image_url: previewMobile || formData.mobile_image_url
                    }}
                    viewMode={viewMode}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOffers;