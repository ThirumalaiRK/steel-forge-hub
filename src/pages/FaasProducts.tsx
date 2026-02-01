import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Calendar, Zap, Shield, TrendingUp, ArrowRight, CheckCircle, Sparkles } from "lucide-react";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_faas_enabled: boolean | null;
    category_id: string | null;
    metal_type: string | null;
    product_images: Array<{ image_url: string; alt_text: string | null }>;
}

const FaasProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFaasProducts();
    }, []);

    const fetchFaasProducts = async () => {
        try {
            const { data, error } = await (supabase
                .from("products")
                .select(`
          id,
          name,
          slug,
          description,
          is_faas_enabled,
          category_id,
          metal_type,
          product_images (image_url, alt_text)
        `)
                .eq("is_active", true)
                .eq("is_faas_enabled", true)
                .order("display_order", { ascending: true }) as any);

            if (error) throw error;
            setProducts((data as Product[]) || []);
        } catch (error) {
            console.error("Error fetching FaaS products:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <Navigation />

            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-slate-700">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(251, 146, 60, 0.15) 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="container mx-auto px-4 py-24 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
                            <Sparkles size={16} />
                            <span>Furniture as a Service</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
                            Scale Without <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-orange-500">Ownership</span>
                        </h1>

                        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Enterprise-grade industrial furniture on flexible rental terms. Zero upfront cost, full maintenance included.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                            {[
                                { icon: Calendar, label: 'Flexible Terms', value: '1-36 Months' },
                                { icon: Shield, label: 'Maintenance', value: 'Included' },
                                { icon: TrendingUp, label: 'Upgrade', value: 'Anytime' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4"
                                >
                                    <stat.icon className="w-6 h-6 text-brand-orange mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-auto">
                        <path
                            fill="rgb(15, 23, 42)"
                            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                        />
                    </svg>
                </div>
            </div>

            {/* Benefits Bar */}
            <div className="bg-slate-900 border-b border-slate-800 py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-8 text-sm">
                        {[
                            { icon: CheckCircle, text: 'Zero Upfront Cost' },
                            { icon: Shield, text: 'Full Maintenance Included' },
                            { icon: Zap, text: 'Quick Deployment' },
                            { icon: TrendingUp, text: 'Upgrade Anytime' }
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-slate-300">
                                <benefit.icon size={16} className="text-brand-orange" />
                                <span className="font-medium">{benefit.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="bg-slate-900 py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2">Available on FaaS</h2>
                        <p className="text-slate-400">Choose from our enterprise-grade furniture collection</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-64 w-full rounded-xl bg-slate-800" />
                                    <Skeleton className="h-6 w-3/4 bg-slate-800" />
                                    <Skeleton className="h-4 w-full bg-slate-800" />
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700">
                            <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No FaaS Products Available</h3>
                            <p className="text-slate-400">Check back soon for new additions to our rental catalog.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                >
                                    <Link to={`/faas/products/${product.slug}`}>
                                        <Card className="group h-full bg-slate-800 border-slate-700 hover:border-brand-orange/50 hover:shadow-2xl hover:shadow-brand-orange/10 transition-all duration-500 overflow-hidden">
                                            {/* Image */}
                                            <div className="relative h-56 overflow-hidden bg-slate-700">
                                                {product.product_images?.[0] ? (
                                                    <motion.img
                                                        src={product.product_images[0].image_url}
                                                        alt={product.product_images[0].alt_text || product.name}
                                                        className="w-full h-full object-cover"
                                                        whileHover={{ scale: 1.05 }}
                                                        transition={{ duration: 0.6 }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                        No Image
                                                    </div>
                                                )}

                                                {/* Gradient overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                {/* FaaS Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-brand-orange text-white border-none shadow-lg">
                                                        <Zap size={12} className="mr-1" />
                                                        FaaS Enabled
                                                    </Badge>
                                                </div>

                                                {/* Monthly Rental Badge */}
                                                <div className="absolute top-4 right-4">
                                                    <Badge className="bg-slate-900/90 backdrop-blur-sm text-white border-slate-700">
                                                        <Calendar size={12} className="mr-1" />
                                                        Monthly Rental
                                                    </Badge>
                                                </div>
                                            </div>

                                            <CardContent className="p-6">
                                                <div className="mb-3">
                                                    <p className="text-xs text-brand-orange uppercase tracking-wider font-bold mb-2">
                                                        {product.metal_type || 'Industrial Grade'}
                                                    </p>
                                                    <h3 className="font-bold text-white text-lg leading-tight group-hover:text-brand-orange transition-colors line-clamp-2">
                                                        {product.name}
                                                    </h3>
                                                </div>

                                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                                    {product.description || 'Available for flexible rental terms with full maintenance support.'}
                                                </p>

                                                {/* CTA */}
                                                <div className="pt-4 border-t border-slate-700">
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full group/btn text-brand-orange hover:text-white hover:bg-brand-orange transition-all"
                                                    >
                                                        <span className="flex items-center justify-center gap-2 font-semibold">
                                                            View FaaS Plan
                                                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                        </span>
                                                    </Button>
                                                </div>
                                            </CardContent>

                                            {/* Bottom accent line */}
                                            <motion.div
                                                className="h-1 bg-gradient-to-r from-brand-orange to-orange-600"
                                                initial={{ scaleX: 0 }}
                                                whileHover={{ scaleX: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Need a Custom FaaS Solution?</h2>
                    <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                        Our team can design a tailored rental package for your specific requirements.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button size="lg" className="bg-brand-orange hover:bg-brand-orange-dark text-white" asChild>
                            <Link to="/contact">Talk to FaaS Expert</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800" asChild>
                            <Link to="/faas">Learn About FaaS</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default FaasProducts;
