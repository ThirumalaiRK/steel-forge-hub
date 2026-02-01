import React, { useState, useEffect } from "react";
import { FileText, Download, Lock, Search, BookOpen, ShieldCheck, ChevronRight, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// Resource interface matching database schema
interface Resource {
    id: string;
    title: string;
    category: string;
    format: string;
    size: string;
    image: string;
    summary: string;
    file_url: string;
    is_gated: boolean;
}

const ResourceCard = ({ resource, onAccess, index }: { resource: Resource, onAccess: (r: Resource) => void, index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-900/10 hover:border-brand-orange/50 transition-all duration-500 flex flex-col h-full"
    >
        {/* Thumbnail with zoom effect */}
        <div className="h-56 overflow-hidden relative bg-gradient-to-br from-slate-100 to-slate-50">
            <motion.img
                src={resource.image}
                alt={resource.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Format badge with animation */}
            <motion.div
                className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase flex items-center gap-1.5 shadow-lg"
                whileHover={{ scale: 1.05 }}
            >
                <FileText size={12} />
                {resource.format}
            </motion.div>

            {/* Gated badge with pulse */}
            {resource.is_gated && (
                <motion.div
                    className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase flex items-center gap-1.5 shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                    <Lock size={12} /> Premium
                </motion.div>
            )}
        </div>

        {/* Content section */}
        <div className="p-6 flex flex-col flex-grow">
            <motion.p
                className="text-xs font-bold text-brand-orange uppercase mb-2 tracking-wider"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                {resource.category}
            </motion.p>

            <motion.h3
                className="font-bold text-slate-900 text-xl leading-tight mb-3 group-hover:text-brand-orange transition-colors duration-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {resource.title}
            </motion.h3>

            <p className="text-sm text-slate-600 mb-4 flex-grow line-clamp-3 leading-relaxed">
                {resource.summary}
            </p>

            {/* File size indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    {resource.size}
                </div>
            </div>

            {/* CTA Button with morph animation */}
            <div className="pt-4 border-t border-slate-100 mt-auto">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        variant={resource.is_gated ? "default" : "outline"}
                        className={`w-full group/btn relative overflow-hidden ${resource.is_gated
                                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20'
                                : 'text-slate-700 border-2 border-slate-300 hover:border-brand-orange hover:text-brand-orange hover:bg-orange-50'
                            } transition-all duration-300`}
                        onClick={() => onAccess(resource)}
                    >
                        {/* Animated background on hover */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-brand-orange to-orange-600"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: resource.is_gated ? 0 : '-100%' }}
                            transition={{ duration: 0.3 }}
                        />

                        <span className="relative flex items-center justify-center gap-2 font-semibold">
                            {resource.is_gated ? (
                                <>
                                    <Lock size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                    Get Access
                                </>
                            ) : (
                                <>
                                    <Download size={16} className="group-hover/btn:translate-y-0.5 transition-transform" />
                                    Free Download
                                </>
                            )}
                        </span>
                    </Button>
                </motion.div>
            </div>
        </div>

        {/* Hover indicator line */}
        <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange to-orange-600"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
        />
    </motion.div>
);

const ResourceLibraryPage = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [email, setEmail] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const { data, error } = await supabase
                .from("resources")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching resources:", error);
                toast.error("Failed to load resources", {
                    description: "Please check your database connection",
                });
                return;
            }

            setResources((data as Resource[]) || []);
        } catch (err) {
            console.error("Error:", err);
            toast.error("An error occurred while loading resources", {
                description: "Please try again later",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAccess = (resource: Resource) => {
        if (!resource.is_gated) {
            toast.success(`Downloading ${resource.title}...`, {
                description: "Your document is being prepared",
                icon: <Download className="text-green-600" size={20} />,
            });
            if (resource.file_url) {
                window.open(resource.file_url, '_blank');
            }
        } else {
            setSelectedResource(resource);
        }
    };

    const handleGateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success(`Access Link sent to ${email}`, {
            description: "Check your inbox for the download link",
            icon: <CheckCircle className="text-green-600" size={20} />,
        });
        setSelectedResource(null);
        setEmail("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-20 font-sans overflow-hidden">

            {/* Animated background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-20 right-20 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </div>

            {/* Hero Section with animations */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 overflow-hidden">
                {/* Animated grid pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                                         linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="container mx-auto px-4 py-20 text-center relative z-10">
                    {/* Badge with animation */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-wider mb-6 backdrop-blur-sm"
                    >
                        <BookOpen size={16} />
                        <span>Knowledge Hub</span>
                        <motion.div
                            className="w-2 h-2 rounded-full bg-blue-400"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.div>

                    {/* Main heading with stagger animation */}
                    <motion.h1
                        className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        TECHNICAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-orange-500">RESOURCES</span>
                    </motion.h1>

                    <motion.p
                        className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Expert insights, technical manuals, and industry reports to help you engineer the future of automation.
                    </motion.p>

                    {/* Enhanced search bar */}
                    <motion.div
                        className="max-w-2xl mx-auto relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <motion.div
                            animate={searchFocused ? {
                                boxShadow: "0 0 0 4px rgba(251, 146, 60, 0.2), 0 20px 40px rgba(0,0,0,0.3)"
                            } : {
                                boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                            }}
                            transition={{ duration: 0.3 }}
                            className="relative rounded-2xl overflow-hidden"
                        >
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={22} />
                            <Input
                                className="pl-14 pr-6 h-16 rounded-2xl border-2 border-slate-600 bg-white/95 backdrop-blur-sm text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-orange focus:ring-0 transition-all duration-300"
                                placeholder="Search datasheets, whitepapers, guides..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                            />

                            {/* Animated search suggestions */}
                            <AnimatePresence>
                                {searchFocused && !searchTerm && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-20"
                                    >
                                        <p className="text-xs text-slate-500 mb-2 font-semibold">POPULAR SEARCHES</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Robotics', 'AI Vision', 'Automation', 'Safety Standards'].map((term, i) => (
                                                <motion.button
                                                    key={term}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => setSearchTerm(term)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-brand-orange hover:text-white rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    {term}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Bottom wave decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-auto">
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            fill="rgb(248, 250, 252)"
                            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                        />
                    </svg>
                </div>
            </div>

            {/* Stats bar with counter animation */}
            <motion.div
                className="container mx-auto px-4 -mt-8 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                        {[
                            { label: 'Documents', value: resources.length, icon: FileText },
                            { label: 'Categories', value: new Set(resources.map(r => r.category)).size, icon: BookOpen },
                            { label: 'Downloads', value: '12K+', icon: TrendingUp }
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.9 + i * 0.1 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <stat.icon className="text-brand-orange" size={24} />
                                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Resources Grid */}
            <div className="container mx-auto px-4 py-16">
                <motion.div
                    className="flex justify-between items-center mb-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <div>
                        <h2 className="font-bold text-slate-900 text-2xl mb-1">Latest Publications</h2>
                        <motion.div
                            className="h-1 bg-gradient-to-r from-brand-orange to-transparent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: 120 }}
                            transition={{ duration: 0.8, delay: 1.2 }}
                        />
                    </div>
                    <motion.span
                        className="text-sm text-slate-500 font-medium bg-slate-100 px-4 py-2 rounded-full"
                        key={filteredResources.length}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        {filteredResources.length} {filteredResources.length === 1 ? 'Document' : 'Documents'} found
                    </motion.span>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="space-y-4"
                            >
                                <Skeleton className="h-56 w-full rounded-2xl" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </motion.div>
                        ))}
                    </div>
                ) : filteredResources.length === 0 ? (
                    <motion.div
                        className="text-center py-24"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <Search className="w-12 h-12 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No resources found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your search terms or browse all categories</p>
                        <Button
                            variant="outline"
                            onClick={() => setSearchTerm("")}
                            className="border-2 border-slate-300 hover:border-brand-orange hover:text-brand-orange"
                        >
                            Clear Search
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredResources.map((res, index) => (
                            <ResourceCard key={res.id} resource={res} onAccess={handleAccess} index={index} />
                        ))}
                    </div>
                )}
            </div>

            {/* Lead Gen Dialog with animations */}
            <AnimatePresence>
                {selectedResource && (
                    <Dialog open={!!selectedResource} onOpenChange={(v) => !v && setSelectedResource(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-xl">
                                    <motion.div
                                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Lock className="text-brand-orange" size={24} />
                                    </motion.div>
                                    Unlock Premium Content
                                </DialogTitle>
                                <DialogDescription>
                                    Enter your professional email to download <strong className="text-slate-900">{selectedResource?.title}</strong> instantly.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleGateSubmit} className="space-y-5 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-semibold">Work Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 border-2 focus:border-brand-orange"
                                    />
                                </div>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm text-slate-700 flex gap-3">
                                    <ShieldCheck className="flex-shrink-0 text-blue-600 mt-0.5" size={20} />
                                    <p>We respect your privacy. No spam, just technical updates. Unsubscribe anytime.</p>
                                </div>
                                <DialogFooter>
                                    <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-base font-semibold">
                                            Send Download Link
                                            <ChevronRight className="ml-2" size={18} />
                                        </Button>
                                    </motion.div>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResourceLibraryPage;
