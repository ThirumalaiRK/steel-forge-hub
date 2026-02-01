import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageOff } from "lucide-react";

interface OfferCardProps {
    offer: any;
    className?: string;
    variant?: 'large' | 'medium' | 'small';
}

export const OfferCard = ({ offer, className, variant = 'small' }: OfferCardProps) => {
    if (!offer || !offer.is_active) return null;

    const imageUrl = offer.desktop_image_url || offer.image_url;

    // Alignment & Layout Logic
    // Large: Video ratio on mobile, fills height on desktop (lg:h-full) to match stack
    // Small: Video ratio always (consistent 16:9)
    const isLarge = variant === 'large';

    return (
        <Link
            to={offer.cta_link || "/products"}
            className={cn(
                "group relative block overflow-hidden rounded-xl bg-slate-900 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-brand-orange/40 w-full",
                isLarge ? "aspect-video lg:aspect-auto lg:h-full" : "aspect-video",
                className
            )}
        >
            {/* Background Image */}
            {imageUrl ? (
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-600">
                    <ImageOff className="h-12 w-12 opacity-20" />
                </div>
            )}

            {/* Gradient Overlay - Stronger for text readability */}
            <div className={cn(
                "absolute inset-0 transition-opacity duration-300",
                "bg-gradient-to-t from-black/90 via-black/40 to-transparent",
                offer.overlay_strength === 'light' && "opacity-60",
                offer.overlay_strength === 'medium' && "opacity-80",
                offer.overlay_strength === 'dark' && "opacity-95",
                "group-hover:opacity-90"
            )} />

            {/* Content Container */}
            <div className={cn(
                "absolute inset-0 flex flex-col justify-between z-10",
                isLarge ? "p-8 md:p-10" : "p-6",
                offer.text_alignment === 'center' ? "items-center text-center" :
                    offer.text_alignment === 'right' ? "items-end text-right" : "items-start text-left"
            )}>

                {/* Top Badge */}
                <div className="w-full flex justify-start">
                    {(offer.badge_text || offer.discount_text) && (
                        <Badge className="bg-brand-orange text-white hover:bg-brand-orange border-none px-3 py-1 uppercase tracking-wider text-[10px] md:text-xs font-bold shadow-sm mb-2 scale-100 group-hover:scale-105 transition-transform">
                            {offer.badge_text || offer.discount_text}
                        </Badge>
                    )}
                </div>

                {/* Text & CTA */}
                <div className="space-y-3 w-full max-w-2xl">
                    <h3 className={cn(
                        "font-bold text-white leading-tight tracking-tight drop-shadow-lg",
                        isLarge ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
                    )}>
                        <span className="line-clamp-2">{offer.title}</span>
                    </h3>

                    {offer.subtitle && (
                        <p className={cn(
                            "text-slate-200 font-medium drop-shadow-md opacity-90 line-clamp-2",
                            isLarge ? "text-base md:text-lg block" : "text-sm hidden md:block" // Hide subtitle on small cards to save space
                        )}>
                            {offer.subtitle}
                        </p>
                    )}

                    {offer.cta_text && (
                        <div className="pt-2">
                            <Button
                                size={isLarge ? 'default' : 'sm'}
                                className={cn(
                                    "bg-brand-orange text-white border-none rounded-lg font-semibold transition-all duration-300",
                                    "hover:bg-brand-orange/90 hover:scale-105 hover:translate-x-1 shadow-lg",
                                    isLarge ? "px-6 py-5 text-base" : "px-4 h-9 text-xs"
                                )}
                            >
                                {offer.cta_text}
                                <ArrowRight className={cn("ml-2", isLarge ? "h-5 w-5" : "h-3 w-3")} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};
