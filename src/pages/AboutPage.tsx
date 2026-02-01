import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import {
  Building,
  Check,
  ChevronRight,
  Factory,
  HeartHandshake,
  Hotel,
  Monitor,
  Recycle,
  School,
  ShoppingCart,
  Users,
  Warehouse,
  Wrench,
  Zap
} from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

// Animation Helper
const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const AboutPage = () => {
  const capabilities = [
    {
      icon: <Wrench className="w-8 h-8 text-brand-orange" />,
      title: "Metal Furniture Manufacturing",
      desc: "Robust, ergonomic, and long-lasting furniture for modern industrial workspaces.",
    },
    {
      icon: <Factory className="w-8 h-8 text-brand-orange" />,
      title: "Custom MS / SS Fabrication",
      desc: "Tailored metal fabrication solutions designed to meet your precise specifications.",
    },
    {
      icon: <Warehouse className="w-8 h-8 text-brand-orange" />,
      title: "Heavy-Duty Storage Systems",
      desc: "Optimize your warehouse with our durable, high-load racking solutions.",
    },
    {
      icon: <Hotel className="w-8 h-8 text-brand-orange" />,
      title: "Hospitality & Institutional",
      desc: "Premium, aesthetic furniture designed for hotels, schools, and campuses.",
    },
    {
      icon: <Monitor className="w-8 h-8 text-brand-orange" />,
      title: "Metal Wall Art & Decor",
      desc: "Creative architectural elements that enhance spaces with metal elegance.",
    },
    {
      icon: <Recycle className="w-8 h-8 text-brand-orange" />,
      title: "Furniture as a Service (FaaS)",
      desc: "Flexible rental and leasing options for scalable business needs.",
    },
  ];

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 selection:bg-brand-orange/30">
      <Navigation />

      {/* 1. HERO SECTION */}
      <section className="relative bg-[#0B1120] text-white pt-40 pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-orange/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/30 rounded-full blur-[120px]" />
        </div>

        <div className="container relative mx-auto px-4 text-center z-10">
          <FadeIn>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-white">
              About AiRS – <span className="text-brand-orange">Ai Robo Fab</span> Solutions
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
              Engineering precision metal furniture and fabrication solutions for industrial, commercial, and institutional environments.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg bg-brand-orange hover:bg-brand-orange-dark text-white rounded-full shadow-lg shadow-brand-orange/20 transition-transform hover:scale-105">
                <Link to="/contact">Get a Quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-slate-600 text-white hover:bg-white/10 hover:border-white rounded-full transition-all">
                <Link to="/products">View Solutions</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2. ENGINEERING EXCELLENCE (Intro) */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
              Engineering Excellence in Metal Solutions
            </h2>
            <div className="text-lg text-slate-600 space-y-6 leading-relaxed">
              <p>
                AiRS (Ai Robo Fab Solutions) is a pioneer in precision-driven metal furniture and fabrication. We specialize in high-strength MS & SS solutions tailored for industries that demand durability and performance.
              </p>
              <p>
                From custom industrial structures to aesthetic institutional furniture, we design, fabricate, and deliver products built for the real world.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16">
              {['Build Strong', 'Build Smart', 'Build to Last'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 font-semibold text-xl text-slate-800">
                  <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-brand-orange" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 3. CAPABILITIES GRID */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Our Capabilities</h2>
              <div className="h-1 w-20 bg-brand-orange mx-auto mt-6 rounded-full" />
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {capabilities.map((cap, i) => (
              <FadeIn key={i} delay={i * 0.1} className="h-full">
                <div className="group h-full p-8 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-brand-orange/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-brand-orange/10 flex items-center justify-center mb-6 transition-colors">
                    {cap.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-orange transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE AIRS */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
              Why Clients Choose AiRS
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
              {[
                "100% Metal & Steel Specialization",
                "Custom Fabrication Expertise",
                "High Load-Bearing Quality",
                "Precision Manufacturing Standards",
                "Long Lifecycle & Low Maintenance",
                "On-Time Delivery Logic",
                "Scalable Production Capacity",
                "Solutions for Real-World Usage"
              ].map((reason, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <Check className="w-6 h-6 text-brand-orange shrink-0" />
                  <span className="text-lg font-medium text-slate-700">{reason}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 5. PROCESS TIMELINE (Dark) - ENHANCED VISIBILITY */}
      <section className="py-24 bg-[#1E293B] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-sm">Our Proven Process</h2>
              <p className="text-slate-200 text-lg max-w-2xl mx-auto">From concept to durable reality - a transparent journey.</p>
            </div>
          </FadeIn>

          <div className="relative max-w-6xl mx-auto pt-10">
            {/* Desktop Line */}
            <div className="hidden md:block absolute top-[5rem] left-0 w-full h-1 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 rounded-full opacity-30" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative z-10">
              {[
                { step: "1", title: "Analyze", desc: "Understanding needs & site conditions" },
                { step: "2", title: "Design", desc: "Engineering strength & aesthetics" },
                { step: "3", title: "Fabricate", desc: "Precision manufacturing with MS/SS" },
                { step: "4", title: "QC Check", desc: "Rigorous quality & load testing" },
                { step: "5", title: "Deliver", desc: "On-time shipping & support" },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.15}>
                  <div className="flex flex-col items-center text-center group cursor-default">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-brand-orange rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                      <div className="w-20 h-20 rounded-full bg-brand-orange text-white font-bold text-2xl flex items-center justify-center border-4 border-[#1E293B] shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ring-4 ring-transparent group-hover:ring-brand-orange/30">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-orange transition-colors">{item.title}</h3>
                    <p className="text-sm text-slate-300 px-2 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. INDUSTRIES GRID */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Industries We Serve</h2>
            <div className="h-1 w-20 bg-brand-orange mx-auto mt-6 mb-16 rounded-full" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
              {[
                { name: "Manufacturing", icon: Factory },
                { name: "Warehousing", icon: Warehouse },
                { name: "Hospitality", icon: ShoppingCart },
                { name: "Corporate", icon: Building },
                { name: "Education", icon: School },
                { name: "Healthcare", icon: HeartHandshake },
                { name: "Retail", icon: Monitor },
                { name: "Events", icon: Users },
                { name: "Government", icon: Hotel },
                { name: "Institutions", icon: Recycle }, // Placeholder icon choice
              ].map((ind, i) => (
                <div key={i} className="flex flex-col items-center group cursor-default">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 group-hover:bg-brand-orange/5 flex items-center justify-center mb-4 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg">
                    <ind.icon className="w-10 h-10 text-slate-400 group-hover:text-brand-orange transition-colors" />
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-slate-900">{ind.name}</span>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <Button asChild variant="outline" className="rounded-full px-8 border-slate-300 text-slate-600 hover:text-brand-orange hover:border-brand-orange">
                <Link to="/industries">View All Industries</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 7. VISION & MISSION (Dark Split) */}
      <section className="bg-[#111827] text-white py-24 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16">
            <FadeIn>
              <div>
                <h3 className="text-3xl font-bold mb-6 text-white border-l-4 border-brand-orange pl-4">Vision & Mission</h3>
                <div className="space-y-12">
                  <div>
                    <h4 className="text-xl font-semibold text-brand-orange mb-2">Our Vision</h4>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      To become a trusted global leader in industrial metal furniture, setting benchmarks for <span className="text-white font-medium">quality, durability, and innovation</span>.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-brand-orange mb-2">Our Mission</h4>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      To empower businesses with <span className="text-white font-medium">smart, strong, and scalable</span> metal solutions that enhance operational efficiency.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-[#1F2937] p-10 rounded-3xl border border-slate-700">
                <h3 className="text-2xl font-bold mb-8">Our Core Values</h3>
                <ul className="space-y-6">
                  {["Quality First", "Precision Engineering", "Customer-Centric Design", "Reliability & Transparency", "Long-Term Partnerships"].map((v, i) => (
                    <li key={i} className="flex items-center gap-4 text-lg text-slate-300">
                      <Zap className="w-5 h-5 text-brand-orange fill-brand-orange" />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 8. FOOTER CTA */}
      <section className="py-24 bg-brand-orange relative overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10 background-grid-pattern pointer-events-none" />

        <div className="container relative mx-auto px-4 text-center z-10">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Looking for a Reliable Metal Partner?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Let's build something durable together. Get a custom quote for your project today.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button asChild size="lg" className="h-14 px-10 text-lg bg-[#0F172A] text-white hover:bg-slate-800 rounded-full shadow-xl">
                <Link to="/contact">Get Custom Quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-10 text-lg bg-white/10 text-white border-white/40 hover:bg-white hover:text-brand-orange rounded-full backdrop-blur-sm">
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;