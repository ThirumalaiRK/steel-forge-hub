import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSiteSettings, type SiteSettings } from "@/hooks/use-site-settings";
import { Facebook, Instagram, Linkedin, Youtube, Save, Globe, Phone, Mail, MapPin, LayoutTemplate, Palette, Info, Check, BellRing } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

interface SocialLink {
  url: string;
  enabled: boolean;
}

interface SocialLinksState {
  facebook: SocialLink;
  instagram: SocialLink;
  linkedin: SocialLink;
  youtube: SocialLink;
  [key: string]: SocialLink;
}

const AdminSettings = () => {
  const { settings, isLoading } = useSiteSettings();
  const { createNotification } = useNotifications();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  // Form State
  // Form State - Using local type to avoid conflicts with DB types during schema evolution
  const [formData, setFormData] = useState<{
    phone_number?: string;
    whatsapp_number?: string;
    email?: string;
    address?: string;
    meta_title?: string;
    meta_description?: string;
    social_links: SocialLinksState;
    business_tagline?: string;
    default_country?: string;
    timezone?: string;
    business_type?: string;
    sales_email?: string;
    business_hours?: string;
    footer_about_text?: string;
    footer_copyright_text?: string;
    logo_light?: string;
    logo_dark?: string;
    favicon?: string;
    primary_color?: string;
    [key: string]: any; // Allow flexibility
  }>({
    social_links: {
      facebook: { url: "", enabled: false },
      instagram: { url: "", enabled: false },
      linkedin: { url: "", enabled: false },
      youtube: { url: "", enabled: false },
    }
  });

  useEffect(() => {
    if (settings) {
      // Parse social links safely
      const parseSocial = (links: any): SocialLinksState => {
        const defaults = {
          facebook: { url: "", enabled: false },
          instagram: { url: "", enabled: false },
          linkedin: { url: "", enabled: false },
          youtube: { url: "", enabled: false },
        };

        if (!links) return defaults;

        // Handle legacy format (simple key-value strings)
        const newLinks = { ...defaults };
        Object.keys(links).forEach(key => {
          if (typeof links[key] === 'string') {
            newLinks[key] = { url: links[key], enabled: !!links[key] };
          } else if (typeof links[key] === 'object') {
            newLinks[key] = links[key];
          }
        });
        return newLinks;
      };

      setFormData({
        ...settings,
        phone_number: settings.phone_number ?? "",
        whatsapp_number: settings.whatsapp_number ?? "",
        email: settings.email ?? "",
        address: settings.address ?? "Arasur, Coimbatore, Tamil Nadu, India",
        meta_title: settings.meta_title ?? "",
        meta_description: settings.meta_description ?? "",
        social_links: parseSocial(settings.social_links),
        // New fields might be accessed via index signature if not yet in types
        business_tagline: (settings as any).business_tagline ?? "",
        default_country: (settings as any).default_country ?? "India",
        timezone: (settings as any).timezone ?? "IST",
        business_type: (settings as any).business_type ?? "Industrial",
        sales_email: (settings as any).sales_email ?? "",
        business_hours: (settings as any).business_hours ?? "Mon - Sat: 9:00 AM - 6:00 PM",
        footer_about_text: (settings as any).footer_about_text ?? "Precision metal furniture and fabrication solutions for industrial, commercial, and institutional environments.",
        footer_copyright_text: (settings as any).footer_copyright_text ?? `© ${new Date().getFullYear()} AiRS - Ai Robo Fab Solutions. All rights reserved.`,
        logo_light: (settings as any).logo_light ?? "",
        logo_dark: (settings as any).logo_dark ?? "",
        favicon: (settings as any).favicon ?? "",
        primary_color: (settings as any).primary_color ?? "#F97316",
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: string, field: 'url' | 'enabled', value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: {
          ...prev.social_links[platform],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      // Prepare payload - ensure we don't send extra fields if using strict typing, 
      // but assuming Supabase client handles extra fields or we cast.
      const payload = {
        phone_number: formData.phone_number,
        whatsapp_number: formData.whatsapp_number,
        email: formData.email,
        address: formData.address,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        social_links: formData.social_links,
        // New fields
        business_tagline: formData.business_tagline,
        default_country: formData.default_country,
        timezone: formData.timezone,
        business_type: formData.business_type,
        sales_email: formData.sales_email,
        business_hours: formData.business_hours,
        footer_about_text: formData.footer_about_text,
        footer_copyright_text: formData.footer_copyright_text,
        logo_light: formData.logo_light,
        logo_dark: formData.logo_dark,
        favicon: formData.favicon,
        primary_color: formData.primary_color,
      };

      let error;

      if (settings?.id) {
        const { error: updateError } = await supabase
          .from("site_settings")
          .update(payload as any) // Cast to any to bypass type check for new columns until codegen updates
          .eq("id", settings.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("site_settings")
          .insert(payload as any);
        error = insertError;
      }

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["site_settings"] });

      toast({
        title: "Settings saved successfully",
        description: "Your changes have been applied to the website.",
      });
    } catch (err) {
      console.error("Error saving site settings", err);
      toast({
        title: "Error saving settings",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Site Settings</h1>
          <p className="text-muted-foreground dark:text-slate-400">Manage your website identity, contact info, and global configurations.</p>
        </div>
        <Button
          size="lg"
          onClick={() => handleSubmit()}
          disabled={saving}
          className="shadow-lg bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg px-6 h-12"
        >
          {saving ? (
            <div className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</div>
          ) : (
            <div className="flex items-center gap-2"><Save className="w-5 h-5" /> Save Changes</div>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-1 h-auto grid grid-cols-2 md:grid-cols-6 w-full justify-start rounded-lg shadow-sm">
          <TabsTrigger value="general" className="py-2.5 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white dark:text-slate-400"><Globe className="w-4 h-4 mr-2" /> General</TabsTrigger>
          <TabsTrigger value="contact" className="py-2.5 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white dark:text-slate-400"><Phone className="w-4 h-4 mr-2" /> Contact</TabsTrigger>
          <TabsTrigger value="footer" className="py-2.5 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white dark:text-slate-400"><LayoutTemplate className="w-4 h-4 mr-2" /> Footer</TabsTrigger>
          <TabsTrigger value="seo" className="py-2.5 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white dark:text-slate-400"><Globe className="w-4 h-4 mr-2" /> SEO</TabsTrigger>
          <TabsTrigger value="branding" className="py-2.5 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white dark:text-slate-400"><Palette className="w-4 h-4 mr-2" /> Branding</TabsTrigger>
          <TabsTrigger value="system" className="py-2.5 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white dark:text-slate-400"><Info className="w-4 h-4 mr-2" /> System</TabsTrigger>
        </TabsList>

        {/* --- 1. GENERAL SETTINGS --- */}
        <TabsContent value="general">
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">General Information</CardTitle>
              <CardDescription className="dark:text-slate-400">High-level site identity and business configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">Website Name</Label>
                  <Input value="AiRS - Ai Robo Fab Solutions" disabled className="bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400" />
                  <p className="text-xs text-muted-foreground">Site name is hardcoded for branding consistency.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline" className="dark:text-slate-300">Business Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.business_tagline ?? ''}
                    onChange={(e) => handleChange('business_tagline', e.target.value)}
                    placeholder="e.g. Precision Metal Furniture"
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">Default Country</Label>
                  <Input value={formData.default_country ?? ''} onChange={(e) => handleChange('default_country', e.target.value)} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">Timezone</Label>
                  <Input value={formData.timezone ?? ''} onChange={(e) => handleChange('timezone', e.target.value)} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">Business Type</Label>
                  <Input value={formData.business_type ?? ''} onChange={(e) => handleChange('business_type', e.target.value)} placeholder="Industrial / Commercial" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 2. CONTACT INFORMATION --- */}
        <TabsContent value="contact">
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Contact Information</CardTitle>
              <CardDescription className="dark:text-slate-400">Central source for headers, footers, and contact pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 dark:text-slate-300"><Phone className="w-4 h-4" /> Primary Phone</Label>
                  <Input value={formData.phone_number ?? ''} onChange={(e) => handleChange('phone_number', e.target.value)} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-green-600 dark:text-green-400"><Phone className="w-4 h-4" /> WhatsApp Business</Label>
                  <Input value={formData.whatsapp_number ?? ''} onChange={(e) => handleChange('whatsapp_number', e.target.value)} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 dark:text-slate-300"><Mail className="w-4 h-4" /> Support Email</Label>
                  <Input value={formData.email ?? ''} onChange={(e) => handleChange('email', e.target.value)} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 dark:text-slate-300"><Mail className="w-4 h-4" /> Sales Email (Optional)</Label>
                  <Input value={formData.sales_email ?? ''} onChange={(e) => handleChange('sales_email', e.target.value)} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                </div>
              </div>

              <Separator className="dark:bg-slate-700" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 dark:text-slate-300"><MapPin className="w-4 h-4" /> Physical Address</Label>
                  <Textarea
                    value={formData.address ?? ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={4}
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">Business Hours</Label>
                  <Textarea
                    value={formData.business_hours ?? ''}
                    onChange={(e) => handleChange('business_hours', e.target.value)}
                    rows={4}
                    placeholder="Mon - Sat: 9:00 AM - 6:00 PM"
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 3. FOOTER & SOCIAL --- */}
        <TabsContent value="footer">
          <div className="grid gap-6">
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Social Media Links</CardTitle>
                <CardDescription className="dark:text-slate-400">Manage social links. Toggle to show/hide in footer.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(['facebook', 'instagram', 'linkedin', 'youtube'] as const).map((platform) => (
                    <div key={platform} className="p-4 border rounded-lg flex items-start gap-4 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700">
                      <Switch
                        checked={formData.social_links[platform]?.enabled}
                        onCheckedChange={(checked) => handleSocialChange(platform, 'enabled', checked)}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          {platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                          {platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-600 dark:text-pink-400" />}
                          {platform === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-700 dark:text-blue-400" />}
                          {platform === 'youtube' && <Youtube className="w-4 h-4 text-red-600 dark:text-red-400" />}
                          <Label className="capitalize dark:text-slate-300">{platform}</Label>
                        </div>
                        <Input
                          placeholder={`${platform} profile URL`}
                          value={formData.social_links[platform]?.url || ''}
                          onChange={(e) => handleSocialChange(platform, 'url', e.target.value)}
                          disabled={!formData.social_links[platform]?.enabled}
                          className="h-8 text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Footer Content</CardTitle>
                <CardDescription className="dark:text-slate-400">Customize the text that appears in the global website footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">About Text (Footer)</Label>
                  <Textarea
                    value={formData.footer_about_text ?? ''}
                    onChange={(e) => handleChange('footer_about_text', e.target.value)}
                    maxLength={250}
                    rows={3}
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <p className="text-xs text-muted-foreground text-right">{formData.footer_about_text?.length || 0}/250</p>
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">Copyright Text</Label>
                  <Input
                    value={formData.footer_copyright_text ?? ''}
                    onChange={(e) => handleChange('footer_copyright_text', e.target.value)}
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- 4. SEO DEFAULTS --- */}
        <TabsContent value="seo">
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">SEO Defaults</CardTitle>
              <CardDescription className="dark:text-slate-400">Fallback metadata when page-specific SEO is missing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Default Page Title</Label>
                <Input
                  value={formData.meta_title ?? ''}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  placeholder="e.g. AiRS | Industrial Metal Furniture Manufacturer"
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
                <p className="text-xs text-muted-foreground text-right">{formData.meta_title?.length || 0}/60 (Recommended)</p>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Default Meta Description</Label>
                <Textarea
                  value={formData.meta_description ?? ''}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  rows={4}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
                <p className="text-xs text-muted-foreground text-right">{formData.meta_description?.length || 0}/160 (Recommended)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 5. BRANDING --- */}
        <TabsContent value="branding">
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Branding Assets</CardTitle>
              <CardDescription className="dark:text-slate-400">Manage logos and colors (Coming Soon).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-lg text-center border border-dashed dark:border-slate-700">
                <Palette className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-muted-foreground dark:text-slate-400">Advanced branding settings (Logo upload, Color picker) will be available in the next update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 6. SYSTEM INFO --- */}
        <TabsContent value="system">
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">System Information</CardTitle>
              <CardDescription className="dark:text-slate-400">Read-only environment details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b dark:border-slate-800 pb-4">
                  <span className="text-sm font-medium text-muted-foreground dark:text-slate-400">App Version</span>
                  <span className="text-sm dark:text-slate-200">v2.1.0</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b dark:border-slate-800 pb-4">
                  <span className="text-sm font-medium text-muted-foreground dark:text-slate-400">Environment</span>
                  <span className="text-sm dark:text-slate-200 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Production</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <span className="text-sm font-medium text-muted-foreground dark:text-slate-400">Last Deployed</span>
                  <span className="text-sm dark:text-slate-200">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t dark:border-slate-800">
                <h3 className="text-md font-semibold mb-4 text-red-600 flex items-center gap-2">⚠️ Data Management (Testing Zone)</h3>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300 mb-4">
                    <strong>Reset Order Sequence:</strong> This will delete ALL orders from the database.
                    This is intended for development/testing only. After resetting, the next order will start from #0001.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm("CRITICAL WARNING: This will permanently delete ALL orders. Are you sure?")) return;
                      const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
                      if (error) {
                        toast({ title: "Failed to reset", description: error.message, variant: "destructive" });
                      } else {
                        toast({ title: "System Reset", description: "All orders have been deleted. Next ID will be 0001." });
                      }
                    }}
                  >
                    Reset & Delete All Orders
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
  );
};

export default AdminSettings;
