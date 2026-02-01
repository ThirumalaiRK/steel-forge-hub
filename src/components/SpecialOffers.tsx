import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Offer = Tables<"offers">;

const OfferCard = ({
  offer,
  isLarge = false,
}: {
  offer: Offer;
  isLarge?: boolean;
}) => {
  const cardClasses = `relative rounded-xl overflow-hidden group h-full shadow-lg hover:shadow-xl transition-shadow duration-300`;

  const imageUrl = offer.image_url?.startsWith('http')
    ? offer.image_url
    : supabase.storage.from('product-images').getPublicUrl(offer.image_url || '').data.publicUrl;

  return (
    <div className={cardClasses}>
      <img
        src={imageUrl || "https://via.placeholder.com/800x600"}
        alt={offer.title}
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 text-center">
        {offer.category_label && (
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {offer.category_label}
          </span>
        )}
        <h3
          className={`font-bold tracking-tight ${
            isLarge ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
          }`}
        >
          {offer.title}
        </h3>
        {offer.discount_text && (
          <p className="mt-2 text-lg">{offer.discount_text}</p>
        )}
        <Button
          asChild
          className="mt-6 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-8 py-3 rounded-lg"
        >
          <Link to={offer.cta_link || "#"}>
            {offer.cta_text || "Shop Now"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

const SpecialOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching offers:", error);
        return;
      }
      setOffers(data);
    };

    fetchOffers();
  }, []);

  if (offers.length === 0) {
    return null;
  }

  const primaryOffer = offers[0];
  const secondaryOffers = offers.slice(1, 3);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">
            Special Offers
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Limited-time deals curated for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Primary Offer */}
          {primaryOffer && (
            <div
              className={`lg:row-span-2 ${
                secondaryOffers.length === 0 ? "lg:col-span-2" : ""
              }`}
            >
              <div
                className={`h-full ${
                  secondaryOffers.length > 0 ? "min-h-[400px] md:min-h-[500px]" : "min-h-[300px]"
                }`}
              >
                <OfferCard offer={primaryOffer} isLarge />
              </div>
            </div>
          )}

          {/* Secondary Offers */}
          {secondaryOffers.map((offer) => (
            <div key={offer.id} className="min-h-[240px] md:min-h-0">
              <OfferCard offer={offer} />
            </div>
          ))}
        </div>  
      </div>
    </section>
  );
};

export default SpecialOffers;