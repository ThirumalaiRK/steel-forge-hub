import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Smartphone, Monitor } from "lucide-react";

interface ExtendedHeroBanner {
    title: string;
    subtitle: string;
    image_url: string; // legacy support if needed
    desktop_image_url: string;
    mobile_image_url: string;
    cta_text: string;
    cta_link: string;
    is_active: boolean;
    type: "standard" | "offer" | "announcement" | "campaign";
    placement: string;
    discount_text?: string;
    offer_badge_style?: "pill" | "ribbon" | "corner";
    cta_style?: "primary" | "secondary" | "outline";
    cta_action_type?: "internal" | "external" | "whatsapp" | "scroll";
}

interface BannerPreviewProps {
    data: Partial<ExtendedHeroBanner>;
    viewMode: "desktop" | "mobile";
    className?: string;
}

export const BannerPreview = ({ data, viewMode, className }: BannerPreviewProps) => {
    const isMobile = viewMode === "mobile";

    // Resolve image to show
    const bgImage = isMobile
        ? (data.mobile_image_url || data.desktop_image_url)
        : (data.desktop_image_url || data.image_url);

    // Default placeholder if no image
    const displayImage = bgImage || "https://placehold.co/1920x1080/e2e8f0/94a3b8?text=No+Image";

    return (
        <div className={cn("relative overflow-hidden rounded-lg border border-slate-200 shadow-sm bg-slate-900 transition-all duration-300", className)}>
            {/* Container aspect ratio simulation */}
            <div
                className={cn(
                    "relative w-full transition-all duration-500",
                    isMobile ? "max-w-[375px] mx-auto h-[600px]" : "w-full min-h-[400px] aspect-[16/6]"
                )}
            >
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
                    style={{ backgroundImage: `url(${displayImage})` }}
                />

                {/* Overlay gradient - matching site style */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

                {/* Content */}
                <div className={cn("relative z-10 h-full flex flex-col", isMobile ? "justify-end p-6 pb-16" : "justify-center p-12 pl-16")}>

                    {/* Discount/Offer Badge */}
                    {data.type === "offer" && data.discount_text && (
                        <div className={cn("mb-4 animate-in fade-in slide-in-from-left-4 duration-500")}>
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "bg-brand-orange text-white border-none px-3 py-1 font-bold tracking-wider uppercase",
                                    data.offer_badge_style === "ribbon" && "rounded-none",
                                    data.offer_badge_style === "pill" && "rounded-full",
                                    // Corner tag logic would require absolute positioning
                                )}
                            >
                                {data.discount_text}
                            </Badge>
                        </div>
                    )}

                    {/* Announcement Label */}
                    {data.type === "announcement" && (
                        <div className="mb-4">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                Announcement
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className={cn(
                        "font-extrabold text-white leading-tight mb-2 drop-shadow-lg",
                        isMobile ? "text-3xl" : "text-4xl lg:text-5xl max-w-2xl"
                    )}>
                        {data.title || "Banner Title"}
                    </h1>

                    {/* Subtitle */}
                    <p className={cn(
                        "text-slate-200 font-light mb-6 drop-shadow-md",
                        isMobile ? "text-sm" : "text-lg max-w-xl",
                        (!data.subtitle) && "opacity-50 italic"
                    )}>
                        {data.subtitle || "Banner subtitle goes here..."}
                    </p>

                    {/* CTA Button */}
                    {data.type !== "announcement" && data.cta_text && (
                        <div className="flex gap-4">
                            <Button
                                variant={data.cta_style === 'outline' ? 'outline' : 'default'}
                                className={cn(
                                    "font-semibold transition-transform hover:scale-105",
                                    data.cta_style === 'primary' || !data.cta_style ? "bg-brand-orange hover:bg-brand-orange/90 text-white border-none" : "",
                                    data.cta_style === 'secondary' ? "bg-white text-slate-900 hover:bg-slate-100" : "",
                                    data.cta_style === 'outline' ? "border-white text-white hover:bg-white/20" : "",
                                    "min-w-[120px]"
                                )}
                            >
                                {data.cta_text}
                            </Button>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};
