
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Factory, GraduationCap, X, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Mock Data
const projects = [
    {
        id: 1,
        title: "Mega-scale Warehouse Racking",
        client: "Global E-Commerce Giant",
        category: "Industrial",
        categoryIcon: Factory,
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200",
        challenge: "Client needed storage for 50,000+ SKUs with load capacity of 2000kg per rack, to be installed in 14 days.",
        solution: "Deployed 20-member install team. Used our Heavy-Duty Titan Series racks with reinforced bracing.",
        outcome: "Project completed in 12 days. 30% increase in storage density achieved.",
        tags: ["Heavy Duty", "Logistics", "Speed"]
    },
    {
        id: 2,
        title: "Ergonomic Assembly Lines",
        client: "Leading Auto Manufacturer",
        category: "Corporate",
        categoryIcon: Building2,
        image: "https://images.unsplash.com/photo-1622378832049-5f3333630f5d?q=80&w=1200", // similar to factory
        challenge: "Worker fatigue was high due to static bench heights. Need for adjustable, ESD-safe workstations.",
        solution: "Designed custom 'Flexi-Benches' with hydraulic height adjustment and integrated ESD grounding.",
        outcome: "Worker efficiency improved by 15%. Complaints of back strain reduced by 40%.",
        tags: ["Ergonomics", "Custom Fabrication", "Automotive"]
    },
    {
        id: 3,
        title: "University Library System",
        client: "Top Technical Institute",
        category: "Institutional",
        categoryIcon: GraduationCap,
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200",
        challenge: "Need for aesthetic yet durable book storage for a new 5-story library complex.",
        solution: "Matte-black powder coated steel shelving with wood-grain accents for accurate aesthetic match.",
        outcome: "Installed 500+ units. Zero defects reported during final inspection.",
        tags: ["Aesthetics", "Durability", "Education"]
    }
];

const CaseStudiesPage = () => {
    const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

    return (
        <div className="min-h-screen bg-white">
            {/* 1. Hero Section */}
            <section className="relative py-24 bg-slate-950 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay" />
                <div className="container px-4 mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl mx-auto"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
                            Our Portfolio
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading text-white">
                            Proven Results. <span className="text-brand-orange">Real Projects.</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-0 leading-relaxed font-light">
                            See how we solve complex industrial challenges for forward-thinking companies.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 2. Projects Grid */}
            <section className="py-24 bg-slate-50">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                                onClick={() => setSelectedProject(project)}
                            >
                                <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
                                        <project.categoryIcon size={12} className="text-brand-orange" />
                                        {project.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-orange transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">{project.client}</p>
                                    <p className="text-slate-600 line-clamp-2 text-sm mb-6">
                                        {project.challenge}
                                    </p>
                                    <div className="flex items-center text-brand-orange font-bold text-sm tracking-wide gap-2">
                                        Case Study <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. CTA */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="container px-4 mx-auto text-center max-w-2xl">
                    <h2 className="text-3xl font-bold mb-6 font-heading text-slate-900">Have a similar requirement?</h2>
                    <p className="text-slate-600 mb-8">
                        Our engineering team is ready to design a solution tailored to your specific needs.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold h-12 px-8" asChild>
                            <Link to="/contact">Get Custom Quote</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Project Detail Modal */}
            <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
                <DialogContent className="max-w-3xl overflow-hidden p-0 gap-0">
                    {selectedProject && (
                        <>
                            <div className="relative h-64 bg-slate-100">
                                <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <Badge className="bg-brand-orange hover:bg-brand-orange mb-3 border-none">{selectedProject.category}</Badge>
                                    <DialogTitle className="text-3xl font-bold text-white">{selectedProject.title}</DialogTitle>
                                    <p className="text-slate-300">{selectedProject.client}</p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => setSelectedProject(null)}
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                                <div>
                                    <h4 className="text-sm font-bold text-brand-orange uppercase tracking-wider mb-2">The Challenge</h4>
                                    <p className="text-slate-700 leading-relaxed">{selectedProject.challenge}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-brand-orange uppercase tracking-wider mb-2">Our Solution</h4>
                                    <p className="text-slate-700 leading-relaxed">{selectedProject.solution}</p>
                                </div>
                                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                                    <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <CheckCircle2 size={16} /> Key Outcomes
                                    </h4>
                                    <p className="text-slate-700 font-medium">{selectedProject.outcome}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setSelectedProject(null)}>Close</Button>
                                <Button className="bg-brand-orange hover:bg-brand-orange-dark text-white" asChild>
                                    <Link to="/contact">Request Similar Solution</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CaseStudiesPage;
