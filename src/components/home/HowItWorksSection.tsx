import { motion } from "framer-motion";
import { MessageSquare, PenTool, Hammer, Truck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
    {
        icon: MessageSquare,
        title: "Consultation & Scope",
        description: "We analyze your space, operational needs, and load requirements to define the perfect solution.",
        color: "bg-blue-50 text-blue-600 border-blue-200"
    },
    {
        icon: PenTool,
        title: "Design & Engineering",
        description: "Our engineers create CAD models and detailed specs to ensure safety, durability, and fit.",
        color: "bg-indigo-50 text-indigo-600 border-indigo-200"
    },
    {
        icon: Hammer,
        title: "Precision Fabrication",
        description: "Manufacturing happens in our state-of-the-art facility using heavy-gauge steel and precision tools.",
        color: "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
    },
    {
        icon: Truck,
        title: "Delivery & Installation",
        description: "Our logistics team handles safe transport and professional on-site installation at your facility.",
        color: "bg-emerald-50 text-emerald-600 border-emerald-200"
    }
];

export const HowItWorksSection = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '32px 32px' }}
            />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="text-brand-orange font-bold uppercase tracking-wider text-sm mb-3 block">Our Process</span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 font-heading text-charcoal">From Concept to Reality</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        A streamlined, transparent workflow designed to deliver industrial-grade results on time and within budget.
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[3rem] left-0 w-full h-[2px] bg-slate-200 -z-10" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="group relative flex flex-col items-center text-center"
                            >
                                {/* Step Number Indicator */}
                                <div className="hidden md:flex absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col items-center">
                                    <span className="text-4xl font-black text-slate-100">0{index + 1}</span>
                                </div>

                                {/* Icon Container with Pulse Effect */}
                                <div className="relative mb-8">
                                    <div className={cn(
                                        "w-24 h-24 rounded-2xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 shadow-xl border-2",
                                        "bg-white z-20 relative",
                                        step.color
                                    )}>
                                        <step.icon size={36} strokeWidth={1.5} />

                                        {/* Corner Accents */}
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current opacity-20" />
                                        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-current opacity-20" />
                                    </div>

                                    {/* Mobile Step Badge */}
                                    <div className="absolute -top-3 -right-3 md:hidden w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center border-2 border-white shadow-md z-30">
                                        {index + 1}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-brand-orange transition-colors duration-300">{step.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm px-2">{step.description}</p>

                                {/* Hover Checkmark */}
                                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                                    <CheckCircle2 className="text-green-500 w-6 h-6" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
