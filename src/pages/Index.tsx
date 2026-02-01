import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Factory, Shield, Clock, Wrench, Award, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-metal.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import categoryIndustrial from "@/assets/category-industrial-generated.png";
import categoryRestaurant from "@/assets/category-restaurant-metal-generated.png";
import categoryInstitutional from "@/assets/category-school-institutional-generated.png";
import { OffersSection } from "@/components/OffersSection";
import { IndustriesSection } from "@/components/home/IndustriesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { LeadConversionSection } from "@/components/home/LeadConversionSection";
import { StatCard } from "@/components/home/StatCard";

type HeroBanner = any;
type Offer = any;

const Index = () => {
    const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
    const [heroCarouselApi, setHeroCarouselApi] = useState<CarouselApi | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [homeCategories, setHomeCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Loading
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Load Hero Banners
                const { data: bannerData } = await supabase
                    .from("hero_banners")
                    .select("*")
                    .eq('type', 'banner') // Explicitly exclude offers
                    .eq('is_active', true)
                    .order("display_order", { ascending: true });

                const validBanners = (bannerData as any[]) || [];
                // If no banners, we will use a hardcoded fallback in the render, but keeping state empty is fine if we handle it.
                // However, let's push a default one if empty to make logic easier.
                if (validBanners.length === 0) {
                    setHeroBanners([{
                        id: 'default-hero',
                        title_text: "Precision Metal Furniture\nfor Industrial-Grade Spaces", // Fallback title
                        subtitle_text: "Engineered metal and steel systems for factories, offices, institutions, and high-traffic environments.",
                        image_url: heroImage,
                        cta_text: "Get Project Quote",
                        cta_link: "/contact"
                    }]);
                } else {
                    setHeroBanners(validBanners);
                }

                // 2. Load Offers
                const today = new Date().toISOString();
                const { data: offerData } = await supabase
                    .from("hero_banners")
                    .select("*")
                    .eq('type', 'offer')
                    .eq('is_active', true)
                    .or(`start_date.is.null,start_date.lte.${today}`)
                    .or(`end_date.is.null,end_date.gte.${today}`)
                    .order("display_order", { ascending: true });

                const pertinentOffers = (offerData as any[])?.filter((o: any) => !o.target_page || ['home', 'both'].includes(o.target_page)) ?? [];

                if (pertinentOffers.length === 0) {
                    // Default Fallback Offers to ensure section is never empty
                    setOffers([
                        {
                            id: "default-1",
                            title: "Industrial Grade Innovation",
                            subtitle: "Explore our latest heavy-duty workbenches designed for maximum durability and efficiency.",
                            image_url: categoryIndustrial,
                            desktop_image_url: categoryIndustrial,
                            mobile_image_url: categoryIndustrial,
                            layout_type: "large",
                            target_page: "home",
                            is_active: true,
                            display_order: 1,
                            cta_text: "View Collection",
                            cta_link: "/products?category=industrial-furniture",
                            badge_text: "Premium Quality",
                            overlay_strength: "medium",
                            text_alignment: "left"
                        },
                        {
                            id: "default-2",
                            title: "Institutional Solutions",
                            subtitle: "Durable furniture for schools & colleges.",
                            image_url: categoryInstitutional,
                            desktop_image_url: categoryInstitutional,
                            mobile_image_url: categoryInstitutional,
                            layout_type: "small",
                            target_page: "home",
                            is_active: true,
                            display_order: 2,
                            cta_text: "Learn More",
                            cta_link: "/industries/educational-institutes",
                            badge_text: "Bulk Orders",
                            overlay_strength: "dark",
                            text_alignment: "left"
                        },
                        {
                            id: "default-3",
                            title: "Restaurant Ambience",
                            subtitle: "Stylish metal seating for modern cafes.",
                            image_url: categoryRestaurant,
                            desktop_image_url: categoryRestaurant,
                            mobile_image_url: categoryRestaurant,
                            layout_type: "small",
                            target_page: "home",
                            is_active: true,
                            display_order: 3,
                            cta_text: "Browse Designs",
                            cta_link: "/products?category=restaurant-cafe",
                            badge_text: "New Designs",
                            overlay_strength: "medium",
                            text_alignment: "left"
                        }
                    ]);
                } else {
                    setOffers(pertinentOffers);
                }

                // 3. Load Categories
                // Try fetching show_on_home first
                let { data: catData } = await supabase
                    .from("categories")
                    .select("*")
                    .eq("is_active", true)
                    .eq("show_on_home", true)
                    .order("display_order", { ascending: true });

                // If not enough categories found, fetch any active categories to fill the gap
                if (!catData || catData.length < 4) {
                    const { data: allCatData } = await supabase
                        .from("categories")
                        .select("*")
                        .eq("is_active", true)
                        .order("display_order", { ascending: true })
                        .limit(4);

                    if (allCatData && allCatData.length > 0) {
                        // Merge and dedup if needed, or just use allCatData if catData was empty
                        if (!catData || catData.length === 0) {
                            catData = allCatData;
                        }
                    }
                }

                setHomeCategories(catData || []);

            } catch (error) {
                console.error("Error loading homepage data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Auto-scroll hero carousel
    useEffect(() => {
        if (!heroCarouselApi) return;
        const interval = setInterval(() => {
            if (!heroCarouselApi) return;
            if (!heroCarouselApi.canScrollNext()) {
                heroCarouselApi.scrollTo(0);
            } else {
                heroCarouselApi.scrollNext();
            }
        }, 7000);
        return () => clearInterval(interval);
    }, [heroCarouselApi]);

    // Features Data
    const features = [
        {
            icon: Factory,
            title: "100% Metal & Steel Focus",
            description: "Specialized in durable metal furniture manufacturing for industrial needs.",
        },
        {
            icon: Wrench,
            title: "Custom Fabrication",
            description: "We don't just sell; we build solutions tailored to your specific spatial requirements.",
        },
        {
            icon: Shield,
            title: "High Load Capacity",
            description: "Engineered designs built to withstand heavy industrial usage and loads.",
        },
        {
            icon: Clock,
            title: "On-Time Delivery",
            description: "Reliable production timelines ensuring your project stays on schedule.",
        },
    ];

    // Palette for cycling colors for categories
    const categoryPalette = [
        { accent: "text-brand-orange", bar: "bg-brand-orange" },
        { accent: "text-brand-yellow", bar: "bg-brand-yellow" },
        { accent: "text-brand-blue", bar: "bg-brand-blue" },
        { accent: "text-brand-magenta", bar: "bg-brand-magenta" },
    ];

    const displayCategories = homeCategories.map((cat, index) => {
        const style = categoryPalette[index % categoryPalette.length];
        return {
            id: cat.id,
            title: cat.name,
            image: cat.image_url || cat.mobile_image_url || categoryIndustrial, // Fallback
            path: `/products?category=${cat.slug}`,
            accentClass: style.accent,
            barClass: style.bar,
            productCount: "Explore", // Static text instead of random number
            description: cat.description || "Explore our collection.",
        };
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            {/* 1. Hero Section */}
            {heroBanners.length > 0 ? (
                <Carousel
                    className="relative w-full min-h-screen overflow-hidden gradient-hero transition-all duration-500"
                    opts={{ loop: true }}
                    setApi={setHeroCarouselApi}
                >
                    <CarouselContent>
                        {heroBanners.map((banner, index) => (
                            <CarouselItem key={banner.id || index} className="min-h-screen w-full">
                                <section className="relative w-full min-h-screen flex items-end pb-24 md:items-center md:pb-0">
                                    {/* Background Image */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center md:hidden"
                                        style={{ backgroundImage: `url(${banner.mobile_image_url || banner.image_url || heroImage})` }}
                                    />
                                    <div
                                        className="absolute inset-0 hidden bg-cover bg-[center_30%] md:block"
                                        style={{ backgroundImage: `url(${banner.desktop_image_url || banner.image_url || heroImage})` }}
                                    />

                                    {/* Overlay: Gradient from dark left (for text) to transparent right (for image visibility) */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />

                                    {/* Content */}
                                    <div className="relative z-10 container mx-auto px-4 md:px-6">
                                        <motion.div
                                            initial={{ opacity: 0, y: 32 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8 }}
                                            className="max-w-xl md:max-w-3xl"
                                        >
                                            <motion.div className="mb-8 flex flex-col items-start gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                                                <span className="inline-block font-brand-script text-5xl md:text-6xl text-white tracking-tight leading-none drop-shadow-lg">AiRS</span>
                                                <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-brand-sky/20 bg-slate-900/60 backdrop-blur-md text-[10px] md:text-xs font-medium uppercase tracking-[0.25em] text-brand-sky/90 shadow-sm ring-1 ring-white/5">
                                                    Ai ROBO FAB SOLUTIONS
                                                </div>
                                            </motion.div>
                                            <motion.h1
                                                className="text-white mb-6 font-heading text-4xl md:text-6xl lg:text-7xl leading-tight"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                {banner.title || (
                                                    <>Precision Metal Furniture<br />for <span className="text-brand-yellow">Industrial-Grade Spaces</span></>
                                                )}
                                            </motion.h1>
                                            <motion.p
                                                className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl font-light leading-relaxed"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                {banner.subtitle || "Engineered metal and steel systems for factories, offices, institutions, and high-traffic environments."}
                                            </motion.p>

                                            <motion.div className="flex flex-col sm:flex-row gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                                <Button size="lg" asChild className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-lg px-10 py-7 h-auto rounded-[10px] shadow-lg hover:shadow-xl hover:scale-105 transition-all group">
                                                    <Link to={banner.cta_link || "/contact"}>
                                                        {banner.cta_text || "Get Project Quote"}
                                                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={24} />
                                                    </Link>
                                                </Button>
                                                <Button size="lg" variant="outline" asChild className="border-2 border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-charcoal font-bold text-lg px-10 py-7 h-auto rounded-[10px] transition-all hover:scale-105 group backdrop-blur-sm bg-black/20">
                                                    <Link to="/products">
                                                        <Sparkles className="mr-2 group-hover:rotate-12 transition-transform" size={24} />
                                                        View Metal Collections
                                                    </Link>
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </section>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 border-white/30 bg-black/20 text-white hover:bg-black/40 hover:text-white hover:border-white transition-all disabled:opacity-0" />
                    <CarouselNext className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 border-white/30 bg-black/20 text-white hover:bg-black/40 hover:text-white hover:border-white transition-all disabled:opacity-0" />
                </Carousel>
            ) : (
                // Safe Fallback if completely empty (should rarely happen due to default pushed in loadData)
                <div className="h-screen w-full bg-slate-900 flex items-center justify-center text-white">
                    <p>Loading Experience...</p>
                </div>
            )}

            {/* 2. Offers Section (High Priority - Stable) */}
            <OffersSection offers={offers} />

            {/* 3. Trust & Credibility Section */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4 md:px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="text-brand-orange font-bold tracking-wider uppercase text-sm mb-2 block">Trusted Excellence</span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 font-heading text-charcoal">Leading Metal Fabrication in India</h2>
                        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                            Trusted by factories, offices, institutions, and commercial brands across India for superior quality and durability.
                        </p>
                    </motion.div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                        <StatCard end={15} suffix="+" label="Years Experience" icon={Award} delay={0} />
                        <StatCard end={500} suffix="+" label="Projects Delivered" icon={Factory} delay={0.1} />
                        <StatCard end={100} suffix="%" label="Metal & Steel Focus" icon={Shield} delay={0.2} />
                        <StatCard end={98} suffix="%" label="On-Time Delivery" icon={Clock} delay={0.3} />
                    </div>
                </div>
            </section>

            {/* Manufacturing Strength Teaser */}
            <section className="py-20 bg-slate-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565043589221-1a51f3f28f44?q=80&w=2000')] bg-cover bg-center opacity-20" />
                <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div>
                        <span className="text-brand-orange font-bold uppercase tracking-wider text-sm mb-2 block">Inside AIRS</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">Our Manufacturing Strength</h2>
                        <p className="text-slate-300 max-w-xl text-lg">
                            Explore our state-of-the-art facility equipped with CNC Laser cutting, robotic welding, and automated powder coating lines.
                        </p>
                    </div>
                    <Button size="lg" className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold h-12 px-8 shrink-0" asChild>
                        <Link to="/company/manufacturing">View Facility</Link>
                    </Button>
                </div>
            </section>

            {/* 4. Industries Section (New) */}
            <IndustriesSection />

            {/* 5. Engineered Metal Categories */}
            <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
                <div className="container mx-auto px-4 md:px-6">
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="mb-4 text-3xl md:text-4xl font-bold font-heading text-charcoal">Explore Our Collections</h2>
                        <p className="text-muted-foreground text-lg">
                            Precision-built metal furniture lines designed for functionality and aesthetics.
                        </p>
                    </motion.div>

                    {displayCategories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {displayCategories.map((category, index) => (
                                <motion.div key={category.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
                                    <Link to={category.path} className="block h-full group">
                                        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col group-hover:-translate-y-2 border border-gray-100">
                                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                                                <img
                                                    src={category.image}
                                                    alt={category.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = categoryIndustrial; // Fallback
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                                <motion.div className={`absolute bottom-0 left-0 h-1.5 ${category.barClass}`} initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }} />
                                            </div>
                                            <div className="flex-1 p-6 flex flex-col relative">
                                                {/* Negative margin to pull text up over image slightly or just styling */}
                                                <div className="absolute -top-10 left-6 right-6">
                                                    <div className="bg-white/95 backdrop-blur rounded-lg px-4 py-3 shadow-md">
                                                        <h3 className={`text-xl font-bold ${category.accentClass} line-clamp-1 text-center`}>{category.title}</h3>
                                                    </div>
                                                </div>
                                                <div className="mt-6">
                                                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 text-center">{category.description}</p>
                                                    <div className="flex items-center justify-center pt-4 border-t border-gray-100">
                                                        <span className="text-sm font-bold text-brand-orange uppercase tracking-wide group-hover:mr-2 transition-all">Explore Collection</span>
                                                        <ArrowRight className="text-brand-orange ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <p className="text-muted-foreground">Collections are being curated. Contact us for custom solutions.</p>
                            <Button variant="link" asChild className="mt-2 text-brand-orange"><Link to="/contact">Contact Sales</Link></Button>
                        </div>
                    )}
                </div>
            </section>

            {/* 6. Why Choose AIRS */}
            <section className="py-24 bg-white relative">
                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-slate-50 -z-10 hidden lg:block" />
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <span className="text-brand-orange font-bold uppercase tracking-wider text-sm mb-4 block">The AIRS Advantage</span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading text-charcoal leading-tight">Why Industry Leaders Choose Us</h2>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                We go beyond standard manufacturing. Our integrated approach ensures that every piece of furniture is precision-engineered for safety, durability, and operational efficiency.
                            </p>
                            <Button size="lg" asChild className="bg-charcoal hover:bg-black text-white px-8 h-12">
                                <Link to="/about">About Our Factory</Link>
                            </Button>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center mb-4">
                                        <feature.icon className="text-brand-orange" size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 text-charcoal">{feature.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. How It Works (New) */}
            <HowItWorksSection />

            {/* 8. FaaS Section */}
            <section className="py-24 bg-charcoal text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-overlay" />
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden border border-slate-700/50"
                    >
                        {/* Decor Circles - More Subtle */}
                        <div className="absolute top-0 right-0 -mt-32 -mr-32 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                            {/* Left Content */}
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue-300 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
                                    Smart Business Model
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 font-heading tracking-tight text-white">
                                    Furniture as a <span className="text-brand-blue-300">Service</span> (FaaS)
                                </h2>
                                <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                                    Shift your CapEx to OpEx with enterprise-grade metal furniture rentals — <br className="hidden md:block" />
                                    built for offices, events, and scalable deployments.
                                </p>

                                {/* Key Benefits Row */}
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 sm:gap-8 mb-4">
                                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                                        <Award className="text-brand-yellow w-5 h-5 shrink-0" />
                                        <span className="font-semibold text-sm text-slate-200">No Upfront Cost</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                                        <Wrench className="text-brand-blue-300 w-5 h-5 shrink-0" />
                                        <span className="font-semibold text-sm text-slate-200">Free Maintenance</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                                        <Sparkles className="text-emerald-400 w-5 h-5 shrink-0" />
                                        <span className="font-semibold text-sm text-slate-200">Easy Upgrades</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex flex-col gap-4 w-full sm:w-auto min-w-[240px]">
                                <Button size="lg" asChild className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-lg px-8 h-14 rounded-xl shadow-lg shadow-brand-blue/20 transition-all hover:-translate-y-0.5 w-full">
                                    <Link to="/faas">Explore FaaS Model</Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-medium text-lg px-8 h-14 rounded-xl hover:border-slate-500 transition-all w-full">
                                    <Link to="/contact">Talk to Sales</Link>
                                </Button>

                                {/* Micro Trust Hints */}
                                <div className="mt-2 flex flex-col items-center gap-1.5 opacity-60">
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Ideal for Enterprises & Startups</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 9. Lead Conversion Section (New) */}
            <LeadConversionSection />

            <Footer />
        </div>
    );
};

export default Index;
