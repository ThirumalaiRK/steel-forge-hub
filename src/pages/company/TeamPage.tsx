
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Linkedin, Mail, Award, Users, Lightbulb, Target } from "lucide-react";
import Footer from "@/components/Footer";

const TeamPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* 1. Hero Section */}
            <section className="relative py-24 bg-slate-50 overflow-hidden">
                <div className="container px-4 mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl mx-auto"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold tracking-widest uppercase mb-6">
                            Leadership & Culture
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight font-heading">
                            The People Behind <span className="text-brand-orange">AIRS</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed font-light">
                            Driven by engineering excellence, decades of experience, and a commitment to integrity. We are more than manufacturers; we are your partners in growth.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 2. Founder Section */}
            <section className="py-24 bg-white">
                <div className="container px-4 mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="relative">
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop"
                                        alt="Founder"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl -z-10" />
                                <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -z-10" />
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <span className="text-brand-orange font-bold uppercase tracking-widest text-sm mb-2 block">Founder & Managing Director</span>
                            <h2 className="text-4xl font-bold text-slate-900 mb-6 font-heading">Rajesh Kumar</h2>
                            <div className="prose prose-lg text-slate-600 mb-8">
                                <p>
                                    "I started AIRS with a simple vision: to bring world-class precision engineering to the Indian manufacturing sector. Over the last 15 years, we have evolved from a small fabrication shop to a leader in industrial metal solutions."
                                </p>
                                <p>
                                    "Our philosophy is simple – never compromise on quality. Whether it's a simple workbench or a complex automated storage system, if it bears the AIRS name, it stands for durability."
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Linkedin className="w-5 h-5 text-brand-blue" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Mail className="w-5 h-5 text-slate-600" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Leadership Team */}
            <section className="py-24 bg-slate-50">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 font-heading">Our Core Leadership</h2>
                        <p className="text-slate-600 mt-2">The experts ensuring every project is delivered to perfection.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            { name: "Amit Singh", role: "Head of Operations", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800" },
                            { name: "Priya Sharma", role: "Design Lead", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800" },
                            { name: "Vikram Malhotra", role: "Chief Engineer", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800" },
                        ].map((member, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100"
                            >
                                <div className="aspect-square rounded-xl overflow-hidden mb-6 bg-slate-100">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 text-center">{member.name}</h3>
                                <p className="text-brand-orange text-center font-medium text-sm mt-1 uppercase tracking-wide">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Culture & Values */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="container px-4 mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 font-heading">Our DNA</h2>
                            <p className="text-slate-300 text-lg mb-8">
                                We believe that great products are built by happy, empowered teams. Our culture focuses on safety, continuous learning, and pride in craftsmanship.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: Target, title: "Precision", desc: "We measure twice, cut once. Accuracy is non-negotiable." },
                                    { icon: Users, title: "Human First", desc: "Safety of our workforce and satisfaction of our clients drive us." },
                                    { icon: Lightbulb, title: "Innovation", desc: "Constantly upgrading our machinery and methods." },
                                ].map((val, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                            <val.icon className="text-brand-orange" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{val.title}</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed">{val.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600" className="rounded-2xl w-full h-64 object-cover md:mt-12" alt="Factory Worker" />
                            <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600" className="rounded-2xl w-full h-64 object-cover" alt="Engineering Team" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-brand-orange text-white text-center">
                <div className="container px-4 mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Partner with a team that builds to last</h2>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" variant="secondary" className="font-bold text-brand-orange hover:bg-white" asChild>
                            <Link to="/contact">Talk to Leadership</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 font-bold" asChild>
                            <Link to="/company/manufacturing">View Factory</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default TeamPage;
