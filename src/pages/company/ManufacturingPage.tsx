
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Factory, Cog, Wrench, ShieldCheck, Ruler, Truck, ArrowRight, Gauge, CheckCircle2, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";

const ManufacturingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* 1. Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-slate-950">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1565043589221-1a51f3f28f44?q=80&w=2600&auto=format&fit=crop')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                <div className="container relative z-10 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-sm font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
                            World-Class Facility
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight font-heading">
                            Where Precision Meets <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-yellow">Industrial Scale</span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                            Our state-of-the-art manufacturing unit delivers high-strength, precision-engineered metal solutions with automated consistency.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-orange-500/25 transition-all duration-300" asChild>
                                <Link to="/contact">Request Factory Visit</Link>
                            </Button>
                            <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100 font-bold h-14 px-8 text-lg rounded-full shadow-lg transition-all duration-300" asChild>
                                <Link to="/contact">Get a Quote</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Manufacturing Overview (Metrics) */}
            <section className="py-20 bg-slate-950 text-white border-b border-white/5">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { label: "Factory Area", value: "50,000+", suffix: "Sq. Ft.", icon: Factory },
                            { label: "Production Capacity", value: "10,000", suffix: "Units/Mo", icon: Gauge },
                            { label: "Heavy Machinery", value: "25+", suffix: "Units", icon: Cog },
                            { label: "Skilled Workforce", value: "150+", suffix: "Experts", icon: ShieldCheck },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-colors"
                            >
                                <div className="w-12 h-12 bg-brand-orange/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand-orange group-hover:scale-110 transition-transform">
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-4xl font-bold text-white mb-1 group-hover:text-brand-orange transition-colors">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium text-brand-orange mb-1 uppercase tracking-wider">{stat.suffix}</div>
                                <div className="text-slate-400 text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Machinery & Capabilities */}
            <section className="py-24 bg-white">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-brand-orange font-bold tracking-wider uppercase text-sm mb-2 block">Our Arsenal</span>
                        <h2 className="text-4xl font-bold text-slate-900 mb-4 font-heading">Advanced Machinery & Capabilities</h2>
                        <p className="text-lg text-slate-600">From automated cutting to robotic welding, we invest in the best technology.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "CNC Laser Cutting", desc: "High-precision cutting for complex geometries with minimal waste.", image: "https://images.unsplash.com/photo-1622378832049-5f3333630f5d?q=80&w=800" },
                            { title: "CNC Bending", desc: "Automated folding for consistent angles and structural integrity.", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800" },
                            { title: "Robotic Welding", desc: "Seamless joins for maximum durability and load capacity.", image: "https://images.unsplash.com/photo-1563205096-72c6b4478174?q=80&w=800" },
                            { title: "Powder Coating", desc: "Premium finishing line for weather-resistant, durable surfaces.", image: "https://images.unsplash.com/photo-1621252179027-94459d27d3ee?q=80&w=800" },
                            { title: "Assembly Line", desc: "Streamlined assembly stations for rapid turnaround times.", image: "https://images.unsplash.com/photo-1565043589221-1a51f3f28f44?q=80&w=800" },
                            { title: "Quality Lab", desc: "Comprehensive testing for load, tensile strength, and finish.", image: "https://images.unsplash.com/photo-1581093588401-fbb0736d9138?q=80&w=800" }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="aspect-video bg-slate-100 overflow-hidden relative">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <span className="text-white font-bold flex items-center gap-2">Explore <ArrowRight className="w-4 h-4" /></span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Process Flow */}
            <section className="py-24 bg-slate-50">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4 font-heading">The Production Process</h2>
                        <p className="text-slate-600">Efficiency and quality control at every step.</p>
                    </div>

                    <div className="relative">
                        {/* Connector Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-slate-200" />

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                            {[
                                { step: "01", title: "Design", icon: Ruler },
                                { step: "02", title: "Engineer", icon: Cog },
                                { step: "03", title: "Fabricate", icon: Factory },
                                { step: "04", title: "Finish", icon: Sparkles },
                                { step: "05", title: "Dispatch", icon: Truck },
                            ].map((process, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-lg flex items-center justify-center mb-6 relative group">
                                        <div className="text-brand-orange group-hover:scale-110 transition-transform duration-300">
                                            {/* Using dynamic check for icon if needed, but passing components is cleaner */}
                                            <process.icon size={32} />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                                            {process.step}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{process.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Quality & CTA */}
            <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-top-right" />
                <div className="container px-4 mx-auto relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6 font-heading text-white">Built to Last. <br /><span className="text-brand-orange">Guaranteed.</span></h2>
                            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                                We adhere to strict ISO quality standards. Every product undergoes rigorous testing for structural integrity, load-bearing capacity, and finish durability before it leaves our floor.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-brand-orange" />
                                    <span className="font-medium">ISO Certified Processes</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-brand-orange" />
                                    <span className="font-medium">Industrial Grade Steel</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-brand-orange" />
                                    <span className="font-medium">Load Tested Designs</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-brand-orange" />
                                    <span className="font-medium">5-Year Warranty</span>
                                </div>
                            </div>
                            <Button size="lg" className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold h-14 px-10 rounded-full" asChild>
                                <Link to="/contact">Get Custom Quote</Link>
                            </Button>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                <img src="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=1200" alt="Quality Standard" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-10 -left-10 bg-white text-slate-900 p-8 rounded-xl shadow-xl hidden md:block max-w-xs">
                                <p className="font-heading font-bold text-2xl mb-2">99.8%</p>
                                <p className="text-slate-600 leading-tight">Defect-free production rate maintained over the last 12 months.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ManufacturingPage;
