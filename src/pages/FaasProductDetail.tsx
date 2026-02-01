import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
    Zap,
    Calendar,
    Shield,
    TrendingUp,
    CheckCircle,
    Phone,
    Mail,
    ArrowRight,
    Package,
    Wrench,
    RotateCcw,
    Building2,
    Factory,
    Home
} from "lucide-react";
import { toast } from "sonner";
import { FaasQuoteRequestDialog } from "@/components/faas/FaasQuoteRequestDialog";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_faas_enabled: boolean | null;
    metal_type: string | null;
    product_images: Array<{ image_url: string; alt_text: string | null }>;
}

const FaasProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDuration, setSelectedDuration] = useState("monthly");
    const [selectedQuantity, setSelectedQuantity] = useState("1");
    const [selectedUsage, setSelectedUsage] = useState("office");
    const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    const fetchProduct = async () => {
        try {
            // First check if product exists at all
            const { data: productCheck, error: checkError } = await (supabase
                .from("products")
                .select("id, name, is_faas_enabled, is_active")
                .eq("slug", slug)
                .maybeSingle() as any);

            if (checkError) throw checkError;

            if (!productCheck) {
                toast.error("Product not found");
                setLoading(false);
                return;
            }

            if (!productCheck.is_active) {
                toast.error("This product is not currently available");
                setLoading(false);
                return;
            }

            if (!productCheck.is_faas_enabled) {
                toast.error("This product is not available for FaaS rental. Please check our standard products page.", {
                    duration: 5000,
                });
                setLoading(false);
                return;
            }

            // Now fetch full product details (only existing columns)
            const { data, error } = await (supabase
                .from("products")
                .select(`
          id,
          name,
          slug,
          description,
          is_faas_enabled,
          metal_type,
          product_images (image_url, alt_text)
        `)
                .eq("slug", slug)
                .eq("is_active", true)
                .eq("is_faas_enabled", true)
                .single() as any);

            if (error) throw error;
            setProduct(data as Product);
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Product not found or not available for FaaS");
        } finally {
            setLoading(false);
        }
    };

    const handleGetQuote = () => {
        setQuoteDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900">
                <Navigation />
                <div className="container mx-auto px-4 py-20 text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
                    <p className="mt-4">Loading product...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-900">
                <Navigation />
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <h1 className="text-3xl font-bold text-white mb-4">Product Not Available for FaaS</h1>

                            <p className="text-slate-400 mb-8">
                                This product exists but is not currently available for FaaS rental.
                                It may be available for purchase on our standard products page.
                            </p>

                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-8 text-left">
                                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Why am I seeing this?
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange mt-1">•</span>
                                        <span>The product hasn't been enabled for FaaS rental yet</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange mt-1">•</span>
                                        <span>It may be a new product that's only available for purchase</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange mt-1">•</span>
                                        <span>Some products are not suitable for rental programs</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="bg-brand-orange hover:bg-brand-orange-dark text-white"
                                    asChild
                                >
                                    <Link to="/faas/products">Browse FaaS Products</Link>
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-slate-600 text-white hover:bg-slate-800"
                                    asChild
                                >
                                    <Link to="/products">View All Products</Link>
                                </Button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-700">
                                <p className="text-sm text-slate-500 mb-4">
                                    Looking for this specific product on FaaS?
                                </p>
                                <Button
                                    variant="ghost"
                                    className="text-brand-orange hover:text-white hover:bg-slate-700"
                                    asChild
                                >
                                    <Link to="/contact">Contact Our FaaS Team</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <Navigation />

            {/* Hero Section */}
            <div className="bg-slate-900 border-b border-slate-700 pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Product Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                                {product.product_images?.[0] ? (
                                    <img
                                        src={product.product_images[0].image_url}
                                        alt={product.product_images[0].alt_text || product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                        No Image Available
                                    </div>
                                )}
                            </div>

                            {/* FaaS Badge */}
                            <div className="absolute top-4 left-4">
                                <Badge className="bg-brand-orange text-white border-none shadow-lg text-base px-4 py-2">
                                    <Zap size={16} className="mr-2" />
                                    Available on FaaS
                                </Badge>
                            </div>
                        </motion.div>

                        {/* Product Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <p className="text-brand-orange font-bold uppercase tracking-wider text-sm mb-3">
                                {product.metal_type || 'Industrial Grade'}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-xl text-slate-300 mb-8">
                                {product.description || 'Premium industrial furniture available on flexible rental terms.'}
                            </p>

                            {/* Quick CTAs */}
                            <div className="flex gap-4 mb-8">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1"
                                >
                                    <Button
                                        size="lg"
                                        onClick={handleGetQuote}
                                        className="w-full bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-brand-orange text-white font-black h-14 text-base shadow-2xl shadow-brand-orange/30 hover:shadow-brand-orange/50 transition-all border-2 border-white/10"
                                    >
                                        <Mail className="mr-2" size={20} />
                                        Get Rental Quote
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-2 border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-white hover:text-white hover:border-brand-orange font-bold h-14 px-6 backdrop-blur-sm transition-all shadow-lg"
                                        asChild
                                    >
                                        <Link to="/contact">
                                            <Phone className="mr-2" size={20} />
                                            Talk to Expert
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { icon: Calendar, label: 'Flexible Terms' },
                                    { icon: Shield, label: 'Maintenance Included' },
                                    { icon: TrendingUp, label: 'Upgrade Anytime' }
                                ].map((stat) => (
                                    <div key={stat.label} className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <stat.icon className="w-5 h-5 text-brand-orange mx-auto mb-1" />
                                        <p className="text-xs text-slate-400">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* FaaS Benefits */}
            <div className="bg-slate-900 py-16 border-b border-slate-800">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-10 text-center">Why Choose FaaS?</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Package,
                                title: 'Zero Upfront Cost',
                                description: 'No capital expenditure required. Start using immediately with monthly payments.'
                            },
                            {
                                icon: Wrench,
                                title: 'Maintenance Included',
                                description: 'Full maintenance and repairs covered. No unexpected costs or downtime.'
                            },
                            {
                                icon: RotateCcw,
                                title: 'Upgrade Anytime',
                                description: 'Scale up or down as your business needs change. Complete flexibility.'
                            },
                            {
                                icon: Shield,
                                title: 'Replacement Support',
                                description: 'Quick replacement in case of damage. Minimize business disruption.'
                            }
                        ].map((benefit, i) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="h-full bg-slate-800 border-slate-700 hover:border-brand-orange/50 transition-all">
                                    <CardContent className="p-6">
                                        <benefit.icon className="w-10 h-10 text-brand-orange mb-4" />
                                        <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                                        <p className="text-sm text-slate-400">{benefit.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rental Configuration */}
            <div className="bg-slate-800/50 py-16 border-b border-slate-700">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-2 text-center">Configure Your Rental</h2>
                        <p className="text-slate-400 mb-10 text-center">Customize your rental plan to match your needs</p>

                        <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-8">
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Duration */}
                                    <div className="space-y-2">
                                        <Label className="text-white flex items-center gap-2">
                                            <Calendar size={16} className="text-brand-orange" />
                                            Rental Duration
                                        </Label>
                                        <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                                            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="quarterly">Quarterly (3 Months)</SelectItem>
                                                <SelectItem value="annual">Annual (12 Months)</SelectItem>
                                                <SelectItem value="custom">Custom Duration</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Quantity */}
                                    <div className="space-y-2">
                                        <Label className="text-white flex items-center gap-2">
                                            <Package size={16} className="text-brand-orange" />
                                            Quantity
                                        </Label>
                                        <Select value={selectedQuantity} onValueChange={setSelectedQuantity}>
                                            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 5, 10, 20, 50].map(num => (
                                                    <SelectItem key={num} value={num.toString()}>{num} Units</SelectItem>
                                                ))}
                                                <SelectItem value="custom">Custom Quantity</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Usage Context */}
                                    <div className="space-y-2">
                                        <Label className="text-white flex items-center gap-2">
                                            <Building2 size={16} className="text-brand-orange" />
                                            Usage Context
                                        </Label>
                                        <Select value={selectedUsage} onValueChange={setSelectedUsage}>
                                            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="office">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 size={14} /> Office
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="factory">
                                                    <div className="flex items-center gap-2">
                                                        <Factory size={14} /> Factory / Site
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="home">
                                                    <div className="flex items-center gap-2">
                                                        <Home size={14} /> Home Office
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator className="my-6 bg-slate-700" />

                                <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
                                    <h3 className="text-white font-bold mb-4">Your Configuration:</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Product:</span>
                                            <span className="text-white font-semibold">{product.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Duration:</span>
                                            <span className="text-white font-semibold capitalize">{selectedDuration}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Quantity:</span>
                                            <span className="text-white font-semibold">{selectedQuantity} Units</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Usage:</span>
                                            <span className="text-white font-semibold capitalize">{selectedUsage}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    onClick={handleGetQuote}
                                    className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white"
                                >
                                    Get Custom Quote
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>

                                <p className="text-xs text-slate-500 text-center mt-4">
                                    Our team will contact you within 24 hours with a personalized quote
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Product Specifications */}
            {product.metal_type && (
                <div className="bg-slate-900 py-16 border-b border-slate-800">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-white mb-10 text-center">Product Specifications</h2>
                        <div className="max-w-3xl mx-auto">
                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-8">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Material</p>
                                            <p className="text-white font-semibold">{product.metal_type}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Grade</p>
                                            <p className="text-white font-semibold">Industrial Grade</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* Buy vs FaaS Comparison */}
            <div className="bg-slate-900 py-20 border-y border-slate-800 relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(251, 146, 60, 0.3) 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl font-black text-white mb-4 tracking-tight">
                            Buy vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-orange-500">FaaS</span>
                        </h2>
                        <p className="text-slate-300 text-xl">Compare traditional purchase with our flexible rental model</p>
                    </motion.div>

                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
                        {/* Traditional Purchase - 3D Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -50, rotateY: -15 }}
                            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, type: "spring" }}
                            whileHover={{ scale: 1.02, rotateY: 2 }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <Card className="h-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 hover:border-red-500/30 transition-all duration-500 overflow-hidden shadow-2xl hover:shadow-red-500/10">
                                {/* 3D Header with gradient */}
                                <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-8 border-b border-slate-600 relative">
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12" />

                                    <div className="flex items-center gap-4 relative z-10">
                                        <motion.div
                                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center shadow-lg"
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </motion.div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white mb-1">Traditional Purchase</h3>
                                            <p className="text-slate-400 text-base font-medium">One-time ownership model</p>
                                        </div>
                                    </div>
                                </div>

                                <CardContent className="p-8 bg-gradient-to-b from-slate-800/50 to-slate-900">
                                    <ul className="space-y-5">
                                        {[
                                            { text: 'High upfront capital cost', emoji: '💰' },
                                            { text: 'Asset depreciation over time', emoji: '📉' },
                                            { text: 'Maintenance costs extra', emoji: '🔧' },
                                            { text: 'Stuck with outdated equipment', emoji: '⏳' },
                                            { text: 'Disposal challenges', emoji: '🗑️' }
                                        ].map((item, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                                whileHover={{ x: 5, scale: 1.02 }}
                                                className="flex items-center gap-4 group cursor-default"
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 group-hover:bg-red-500/30 transition-all">
                                                    <span className="text-red-400 text-xl font-bold">✗</span>
                                                </div>
                                                <span className="text-slate-200 text-lg font-medium leading-relaxed group-hover:text-white transition-colors">
                                                    {item.text}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    <div className="mt-10 pt-8 border-t border-slate-700">
                                        <div className="text-center bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                            <p className="text-red-400 text-base font-bold uppercase tracking-wider">❌ Not Recommended</p>
                                            <p className="text-slate-500 text-sm mt-2">High cost, low flexibility</p>
                                        </div>
                                    </div>
                                </CardContent>

                                {/* 3D Shadow effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </Card>
                        </motion.div>

                        {/* FaaS Model - 3D Card with Glow */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotateY: 15 }}
                            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, type: "spring" }}
                            whileHover={{ scale: 1.05, rotateY: -2, z: 50 }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <Card className="h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-2 border-brand-orange hover:border-brand-orange/80 transition-all duration-500 overflow-hidden shadow-2xl shadow-brand-orange/20 hover:shadow-brand-orange/40 relative">
                                {/* Animated Recommended Badge */}
                                <motion.div
                                    className="absolute top-0 right-0 bg-gradient-to-r from-brand-orange to-orange-600 text-white text-sm font-black px-6 py-2 rounded-bl-2xl shadow-xl z-20"
                                    initial={{ scale: 0, rotate: -45 }}
                                    whileInView={{ scale: 1, rotate: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    ⭐ RECOMMENDED
                                </motion.div>

                                {/* 3D Header with vibrant gradient */}
                                <div className="bg-gradient-to-r from-brand-orange via-orange-500 to-brand-orange p-8 border-b border-orange-400/30 relative overflow-hidden">
                                    {/* Animated shine effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
                                        animate={{ x: ['-200%', '200%'] }}
                                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                    />

                                    <div className="flex items-center gap-4 relative z-10">
                                        <motion.div
                                            className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-2xl border-2 border-white/50"
                                            whileHover={{ rotate: 360, scale: 1.1 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <Zap className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={3} />
                                        </motion.div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white mb-1 drop-shadow-lg">FaaS Model</h3>
                                            <p className="text-white/95 text-base font-bold">Flexible subscription service</p>
                                        </div>
                                    </div>
                                </div>

                                <CardContent className="p-8 bg-gradient-to-b from-slate-800 to-slate-900">
                                    <ul className="space-y-5">
                                        {[
                                            { text: 'Zero upfront investment', emoji: '🎯' },
                                            { text: 'Predictable monthly costs', emoji: '📊' },
                                            { text: 'Full maintenance included', emoji: '✨' },
                                            { text: 'Upgrade to latest models', emoji: '🚀' },
                                            { text: 'Hassle-free returns', emoji: '♻️' }
                                        ].map((item, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                                whileHover={{ x: -5, scale: 1.02 }}
                                                className="flex items-center gap-4 group cursor-default"
                                            >
                                                <motion.div
                                                    className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-orange/30 flex items-center justify-center border-2 border-brand-orange group-hover:bg-brand-orange group-hover:scale-110 transition-all"
                                                    whileHover={{ rotate: 360 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <CheckCircle className="w-5 h-5 text-white" strokeWidth={3} />
                                                </motion.div>
                                                <span className="text-white text-lg font-bold leading-relaxed group-hover:text-brand-orange transition-colors">
                                                    {item.text}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    <div className="mt-10 pt-8 border-t border-brand-orange/30">
                                        <motion.div
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                onClick={handleGetQuote}
                                                className="w-full bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-brand-orange text-white font-black h-14 text-lg shadow-2xl shadow-brand-orange/50 hover:shadow-brand-orange/70 transition-all border-2 border-white/20"
                                            >
                                                <Zap className="mr-2" size={22} />
                                                Switch to FaaS Now
                                                <ArrowRight className="ml-2" size={22} />
                                            </Button>
                                        </motion.div>
                                        <motion.p
                                            className="text-center text-brand-orange text-sm mt-4 font-bold"
                                            animate={{ opacity: [0.7, 1, 0.7] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            💰 Save up to 60% on total cost of ownership
                                        </motion.p>
                                    </div>
                                </CardContent>

                                {/* Animated glow effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-t from-brand-orange/10 via-transparent to-transparent pointer-events-none"
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                            </Card>
                        </motion.div>
                    </div>

                    {/* Additional Benefits Bar with 3D effect */}
                    <motion.div
                        className="mt-16 max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-2 border-slate-700 rounded-2xl p-8 shadow-2xl">
                            <div className="grid md:grid-cols-3 gap-8 text-center">
                                {[
                                    { icon: '💡', label: 'Smart Choice', value: '90% of clients prefer FaaS' },
                                    { icon: '⚡', label: 'Quick Setup', value: 'Deploy in 48 hours' },
                                    { icon: '🎯', label: 'Zero Risk', value: 'Cancel anytime' }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        className="space-y-3 group cursor-default"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.2, duration: 0.5 }}
                                        whileHover={{ scale: 1.1, y: -5 }}
                                    >
                                        <motion.div
                                            className="text-5xl"
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            {stat.icon}
                                        </motion.div>
                                        <div className="text-brand-orange font-black text-base uppercase tracking-wider group-hover:text-white transition-colors">
                                            {stat.label}
                                        </div>
                                        <div className="text-white text-base font-medium group-hover:text-brand-orange transition-colors">
                                            {stat.value}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Support & SLA */}
            <div className="bg-slate-900 py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-10 text-center">What's Included</h2>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Package,
                                title: 'Installation Included',
                                description: 'Professional setup and installation at your location'
                            },
                            {
                                icon: Wrench,
                                title: 'Maintenance Covered',
                                description: 'Regular maintenance and repairs at no extra cost'
                            },
                            {
                                icon: RotateCcw,
                                title: 'Replacement Support',
                                description: 'Quick replacement in case of damage or malfunction'
                            }
                        ].map((service) => (
                            <Card key={service.title} className="bg-slate-800 border-slate-700 text-center">
                                <CardContent className="p-6">
                                    <service.icon className="w-12 h-12 text-brand-orange mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                                    <p className="text-sm text-slate-400">{service.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-brand-orange to-orange-600 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
                    <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                        Get a personalized quote for {product.name} rental today
                    </p>
                    <Button
                        size="lg"
                        onClick={handleGetQuote}
                        className="bg-white text-brand-orange hover:bg-slate-100"
                    >
                        Get Your Custom Quote
                        <ArrowRight className="ml-2" size={20} />
                    </Button>
                </div>
            </div>

            {product && (
                <FaasQuoteRequestDialog
                    open={quoteDialogOpen}
                    onOpenChange={setQuoteDialogOpen}
                    productId={product.id}
                    productName={product.name}
                    metalType={product.metal_type}
                    prefilledData={{
                        duration: selectedDuration,
                        quantity: selectedQuantity,
                        usage: selectedUsage
                    }}
                />
            )}

            <Footer />
        </div>
    );
};

export default FaasProductDetail;
