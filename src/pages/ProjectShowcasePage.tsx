import React, { useState } from "react";
import { ArrowUpRight, Play, MapPin, Building2, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Mock Data for Projects
const PROJECTS = [
    {
        id: 1,
        title: "Tesla Gigafactory Texas Welding Line",
        category: "Automotive",
        location: "Austin, USA",
        year: "2024",
        image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&q=80",
        stats: { output: "+200%", efficiency: "99.9%", roi: "8 Months" },
        description: "Complete automated welding line overhaul using AiRS heavy-duty robotic arms with real-time seam tracking vision systems."
    },
    {
        id: 2,
        title: "Samsung Semi-Conductor Clean Room",
        category: "Electronics",
        location: "Suwon, South Korea",
        year: "2023",
        image: "https://images.unsplash.com/photo-1581093588401-fbb07366f955?w=800&q=80",
        stats: { precision: "0.01mm", yield: "+15%", downtime: "-40%" },
        description: "Deployment of ultra-precise pick-and-place robots for wafer handling in ISO Class 1 clean room environments."
    },
    {
        id: 3,
        title: "Foxconn Assembly Automation",
        category: "Consumer Tech",
        location: "Shenzhen, China",
        year: "2024",
        image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
        stats: { speed: "2x Faster", labor: "-60%", defects: "Near Zero" },
        description: "Vision-guided high-speed assembly cells for smartphone component integration."
    },
    {
        id: 4,
        title: "Airbus Wing Assembly Wingman",
        category: "Aerospace",
        location: "Toulouse, France",
        year: "2023",
        image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&q=80",
        stats: { safety: "100%", quality: "Perfect", load: "500kg" },
        description: "Collaborative robots (Cobots) assisting human technicians in handling heavy aerospace composites."
    },
    {
        id: 5,
        title: "Coca-Cola Bottling Logistics",
        category: "FMCG",
        location: "Atlanta, USA",
        year: "2022",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
        stats: { throughput: "+300%", storage: "+50%", errors: "0%" },
        description: "Autonomous Mobile Robots (AMRs) for pallet movement and smart warehousing optimization."
    },
    {
        id: 6,
        title: "Pfizer Vaccine Vial Inspection",
        category: "Pharma",
        location: "Puurs, Belgium",
        year: "2021",
        image: "https://images.unsplash.com/photo-1579165466741-7f35a4755657?w=800&q=80",
        stats: { speed: "1000/min", accuracy: "99.999%", compliance: "FDA" },
        description: "Deep learning vision systems detecting microscopic glass defects at high production speeds."
    }
];

const ProjectCard = ({ project }: { project: any }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
        <div className="relative h-64 overflow-hidden">
            <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            <Badge className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20">
                {project.category}
            </Badge>
        </div>

        <div className="p-6">
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1"><MapPin size={12} /> {project.location}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {project.year}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-orange transition-colors">
                {project.title}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2 mb-6">
                {project.description}
            </p>

            <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-100 bg-slate-50/50 -mx-6 px-6">
                {Object.entries(project.stats).map(([key, value]: any) => (
                    <div key={key} className="text-center">
                        <p className="text-lg font-black text-slate-900">{value}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{key}</p>
                    </div>
                ))}
            </div>
        </div>

        <button className="absolute bottom-6 right-6 w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
            <ArrowUpRight size={20} />
        </button>
    </div>
);

const ProjectShowcasePage = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-20 font-sans">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&q=80')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Badge variant="outline" className="mb-6 text-brand-orange border-brand-orange/50 uppercase tracking-widest px-4 py-1">
                        Global Impact
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                        POWERED BY <span className="text-brand-orange">AiRS</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        From Gigafactories to Clean Rooms. See how the world's leading manufacturers transform their assembly lines with our intelligent robotics.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-8 py-6 rounded-full">
                            Schedule a Demo
                        </Button>
                        <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800 px-8 py-6 rounded-full">
                            <Play size={16} className="mr-2 fill-current" /> Watch Showreel
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-brand-orange py-12 text-white">
                <div className="container mx-auto px-4 flex flex-wrap justify-center md:justify-around gap-8 text-center">
                    <div>
                        <div className="text-4xl font-black mb-1">500+</div>
                        <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Factories Automated</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-1">$2B+</div>
                        <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Value Created</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-1">24/7</div>
                        <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Uptime Guaranteed</div>
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Selected Case Studies</h2>
                        <p className="text-slate-500">Explore our recent deployment success stories.</p>
                    </div>
                    <Button variant="ghost" className="hidden md:flex text-slate-900">
                        View All Projects <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {PROJECTS.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>

                <div className="mt-20 bg-slate-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <Building2 size={48} className="mx-auto mb-6 text-brand-orange" />
                        <h2 className="text-3xl font-bold mb-4">Ready to automate your facility?</h2>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                            Join the ranks of industry leaders. We design custom solutions tailored to your unique production challenges.
                        </p>
                        <Button className="bg-brand-orange hover:bg-orange-600 font-bold px-8 py-6 rounded-full text-lg shadow-xl shadow-orange-500/20">
                            Start Your Transformation
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectShowcasePage;
