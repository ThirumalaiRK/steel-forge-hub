
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Monitor } from "lucide-react";

interface OfferPreviewProps {
    data: any;
    viewMode: "desktop" | "mobile";
    className?: string;
}

export const OfferPreview = ({ data, viewMode, className }: OfferPreviewProps) => {
    const isMobile = viewMode === "mobile";

    // Simplified aspect ratio mocking for preview context
    const aspectRatio = data.layout_type === 'large' ? 'aspect-[2/1]' : 'aspect-square';

    const bgImage = isMobile ? (data.mobile_image_url || data.desktop_image_url) : (data.desktop_image_url || data.mobile_image_url);
    const displayImage = bgImage || "https://placehold.co/800x600/1e293b/cbd5e1?text=Offer+Image";

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl shadow-md group cursor-pointer border border-slate-700/50 bg-slate-900",
            isMobile ? "w-[300px] mx-auto min-h-[300px]" : "w-full",
            !isMobile && aspectRatio,
            className
        )}>
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${displayImage})` }}
            />

            {/* Overlay */}
            <div className={cn(
                "absolute inset-0 transition-opacity duration-300",
                data.overlay_strength === 'light' && "bg-black/20",
                (data.overlay_strength === 'medium' || !data.overlay_strength) && "bg-black/40",
                data.overlay_strength === 'dark' && "bg-black/60",
                "group-hover:bg-black/30"
            )} />

            {/* Content */}
            <div className={cn(
                "absolute inset-0 p-6 flex flex-col h-full",
                isMobile ? "justify-end pb-12" : "justify-between",
                data.text_alignment === 'center' && "items-center text-center",
                data.text_alignment === 'right' && "items-end text-right",
                (!data.text_alignment || data.text_alignment === 'left') && "items-start text-left"
            )}>
                {/* Badge */}
                <div className="w-full pointer-events-none">
                    {data.badge_text && (
                        <Badge className="bg-brand-orange text-white hover:bg-brand-orange/90 mb-2 border-none px-3 py-1 uppercase tracking-wider text-xs shadow-sm">
                            {data.badge_text}
                        </Badge>
                    )}
                </div>

                <div className="space-y-3 w-full pointer-events-none">
                    {/* Title */}
                    <h3 className={cn(
                        "font-extrabold text-white leading-none tracking-tight drop-shadow-xl uppercase",
                        data.layout_type === 'large' ? "text-4xl lg:text-5xl" : "text-3xl"
                    )}>
                        {data.title || "OFFER TITLE"}
                    </h3>

                    {/* Subtitle */}
                    {data.subtitle && (
                        <p className="text-slate-100 text-sm md:text-base opacity-90 font-medium drop-shadow-md">
                            {data.subtitle}
                        </p>
                    )}

                    {/* CTA */}
                    <div className="pt-2 pointer-events-auto">
                        <Button
                            size="sm"
                            className={cn(
                                "bg-brand-orange text-white border-none rounded-full px-6 font-bold transition-all duration-300",
                                "hover:bg-brand-orange/100 hover:scale-105 shadow-lg"
                            )}>
                            {data.cta_text || "Shop Now"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Helper for admin to see boundaries */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/10 pointer-events-none transition-colors rounded-2xl" />
        </div>
    )
}
