import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface SiteSettings {
  id: string;
  created_at: string;
  updated_at: string;
  phone_number: string | null;
  whatsapp_number: string | null;
  email: string | null;
  sales_email: string | null;
  address: string | null;
  business_hours: string | null;
  social_links: Json | null;
  meta_title: string | null;
  meta_description: string | null;

  // New fields
  business_tagline: string | null;
  default_country: string | null;
  timezone: string | null;
  business_type: string | null;
  footer_about_text: string | null;
  footer_copyright_text: string | null;
  default_og_image: string | null;
  logo_light: string | null;
  logo_dark: string | null;
  favicon: string | null;
  primary_color: string | null;
}

const fetchSiteSettings = async (): Promise<SiteSettings | null> => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error loading site settings", error);
    return null;
  }

  return data as unknown as SiteSettings;
};

export const useSiteSettings = () => {
  const query = useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60 * 1000,
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
