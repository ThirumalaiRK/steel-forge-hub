import { motion } from "framer-motion";
import { OfferCard } from "@/components/OfferCard";
import { cn } from "@/lib/utils";

interface OffersSectionProps {
    offers: any[];
    className?: string;
}

export const OffersSection: React.FC<OffersSectionProps> = ({ offers, className }) => {
    if (!offers || offers.length === 0) return null;

    const activeOffers = offers.slice(0, 3);

    let content;

    if (activeOffers.length === 1) {
        content = (
            <div className="w-full max-w-5xl mx-auto">
                <OfferCard offer={activeOffers[0]} variant="large" />
            </div>
        );
    } else if (activeOffers.length === 2) {
        content = (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <OfferCard offer={activeOffers[0]} variant="medium" />
                <OfferCard offer={activeOffers[1]} variant="medium" />
            </div>
        );
    } else {
        // 3 Offers - Aligned Layout
        const largeOffer = activeOffers.find(o => o.layout_type === 'large') || activeOffers[0];
        const sideOffers = activeOffers.filter(o => o.id !== largeOffer.id).slice(0, 2);

        content = (
            // Grid with items-stretch to force height match
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch">
                {/* Main Area (2/3 width) - Fills height naturally */}
                <motion.div
                    className="lg:col-span-2 w-full h-full"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    {/* Pass h-full to the card so it expands to match the sidebar */}
                    <OfferCard offer={largeOffer} variant="large" className="h-full" />
                </motion.div>

                {/* Sidebar (1/3 width) - Two stacked cards determining the total height */}
                <div className="lg:col-span-1 flex flex-col gap-4 lg:gap-6 w-full">
                    {sideOffers.map((offer, i) => (
                        <motion.div
                            key={offer.id}
                            className="w-full flex-1"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i }}
                        >
                            <OfferCard offer={offer} variant="small" className="h-full" />
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <section className={cn("py-8 md:py-12 bg-white relative z-20", className)}>
            <div className="container mx-auto px-4 md:px-6">
                {content}
            </div>
        </section>
    );
};
