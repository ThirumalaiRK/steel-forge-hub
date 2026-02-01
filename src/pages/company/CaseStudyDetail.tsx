
import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Building2, CheckCircle2, Share2 } from "lucide-react";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

// Mock data (shared structure with Admin)
const MOCK_PROJECT = {
    title: "Mega-scale Warehouse Racking",
    client: "Global E-Commerce Giant",
    industry: "Logistics",
    location: "Bhiwandi, Mumbai",
    duration: "4 Months",
    date: "2024-03-15",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000",
    overview: "The client required a massive storage overhaul for their new distribution center in Western India. The facility needed to handle over 50,000 SKUs with a mix of heavy-duty pallet racking and multi-tier shelving systems.",
    challenges: "Strict timeline of 4 months for a 500,000 sq ft facility. The floor load capacity varied across zones, requiring custom base-plate designs to distribute weight effectively.",
    solution: "We deployed our 'Titan Series' heavy-duty racking with reinforced cross-bracing. A dedicated team of 40 installers worked in shifts to meet the deadline. We also implemented a custom color-coding system for aisle identification.",
    materials: ["High-Grade SS 304", "Heavy Duty Mild Steel", "Epoxy Powder Coating"],
    processes: ["CNC Cutting", "Robotic Welding", "Automated Painting"],
    results: [
        "Storage capacity increased by 300%",
        "Retrieval time reduced by 40%",
        "Zero safety incidents during installation",
        "project delivered 1 week ahead of schedule"
    ]
};

import { supabase } from "@/integrations/supabase/client";

const CaseStudyDetail = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const previewId = searchParams.get('preview');
    const [project, setProject] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);
            try {
                // @ts-ignore
                let query = supabase.from('case_studies').select('*');

                if (previewId) {
                    query = query.eq('id', previewId);
                } else if (slug) {
                    query = query.eq('slug', slug);
                } else {
                    setLoading(false);
                    return;
                }

                const { data, error } = await query.single();

                if (error) {
                    // Fallback to mock if not found (optional, but good for demo continuity if DB is empty)
                    // console.error("Error fetching project:", error);
                    // For now, if error, we set null. content handles Not Found.
                    setProject(null);
                } else if (data) {
                    const row: any = data;
                    const mappedProject = {
                        title: row.title,
                        client: row.client_name,
                        industry: row.industry,
                        location: row.location,
                        duration: row.duration,
                        date: new Date(row.created_at).toLocaleDateString(),
                        image: row.featured_image || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000",
                        overview: row.overview,
                        challenges: row.challenges,
                        solution: row.solution,
                        materials: (row.materials || []),
                        processes: (row.processes || []),
                        results: (row.key_results || [])
                    };
                    setProject(mappedProject);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [slug, previewId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!project) {
        // Use the mock project as a generic fallback if DB is empty, or show Not Found
        // For strict user requirements, let's show Not Found but formatted nicely.
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Project Not Found</h2>
                <Button asChild><Link to="/company/case-studies">Back to Case Studies</Link></Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative h-[60vh] min-h-[500px] flex items-end pb-20 overflow-hidden bg-slate-900 text-white">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
                    style={{ backgroundImage: `url(${project.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                <div className="container relative z-10 px-4">
                    <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 mb-8 backdrop-blur-sm" asChild>
                        <Link to="/company/case-studies"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects</Link>
                    </Button>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex flex-wrap gap-3 mb-6">
                            <Badge className="bg-brand-orange hover:bg-brand-orange text-lg px-4 py-1">{project.industry}</Badge>
                            <Badge variant="outline" className="text-white border-white/30 text-lg px-4 py-1 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> {project.location}
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4 leading-tight">{project.title}</h1>
                        <p className="text-xl text-slate-300 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-brand-orange" /> Client: <span className="text-white font-medium">{project.client}</span>
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-20">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Content */}
                        <div className="lg:col-span-2 space-y-12">
                            <div>
                                <h3 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">The Challenge</h3>
                                <p className="text-lg text-slate-700 leading-relaxed">{project.challenges}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">Our Solution</h3>
                                <p className="text-lg text-slate-700 leading-relaxed">{project.overview}</p>
                                <p className="text-lg text-slate-700 leading-relaxed mt-4">{project.solution}</p>
                            </div>

                            {project.results && project.results.length > 0 && (
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6 font-heading">Key Results</h3>
                                    <ul className="space-y-4">
                                        {project.results.map((res: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="mt-1 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                                <span className="text-lg text-slate-700">{res}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <div className="p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                                <h4 className="font-bold text-slate-900 mb-6 text-lg">Project Details</h4>
                                <div className="space-y-4">
                                    <div className="pb-4 border-b border-slate-100">
                                        <span className="block text-sm text-slate-500 mb-1">Duration</span>
                                        <span className="font-medium text-slate-900 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-brand-orange" /> {project.duration}
                                        </span>
                                    </div>
                                    <div className="pb-4 border-b border-slate-100">
                                        <span className="block text-sm text-slate-500 mb-1">Materials</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {project.materials?.map((m: string) => (
                                                <Badge key={m} variant="secondary" className="bg-slate-100">{m}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pb-4 border-b border-slate-100">
                                        <span className="block text-sm text-slate-500 mb-1">Processes</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {project.processes?.map((p: string) => (
                                                <Badge key={p} variant="secondary" className="bg-slate-100">{p}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" size="lg" asChild>
                                        <Link to="/contact">Discuss a Similar Project</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CaseStudyDetail;
