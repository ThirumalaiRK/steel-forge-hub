import { motion } from "framer-motion";
import { Factory, Building2, UtensilsCrossed, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const industries = [
    {
        icon: Factory,
        title: "Industrial & Manufacturing",
        description: "Heavy-duty workbenches, storage racks, and custom fabrication for factory floors.",
        link: "/products/industrial-furniture",
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        icon: Building2,
        title: "Corporate Offices",
        description: "Ergonomic workstations, conference tables, and modular office systems.",
        link: "/products/office-furniture",
        color: "text-slate-700",
        bg: "bg-slate-50"
    },
    {
        icon: UtensilsCrossed,
        title: "Restaurants & Cafes",
        description: "Stylish, durable metal seating and tables for high-traffic dining spaces.",
        link: "/products/restaurant-cafe",
        color: "text-orange-600",
        bg: "bg-orange-50"
    },
    {
        icon: GraduationCap,
        title: "Educational Institutions",
        description: "Robust furniture for classrooms, labs, and libraries designed for longevity.",
        link: "/industries/educational-institutes",
        color: "text-green-600",
        bg: "bg-green-50"
    }
];

export const IndustriesSection = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 max-w-2xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-charcoal">Industries We Serve</h2>
                    <p className="text-muted-foreground text-lg">Specialized metal fabrication solutions tailored for diverse sectors.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {industries.map((industry, index) => (
                        <motion.div
                            key={industry.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={industry.link} className="block h-full group">
                                <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white hover:-translate-y-1">
                                    <CardContent className="p-8 flex flex-col items-center text-center h-full">
                                        <div className={`w-16 h-16 rounded-2xl ${industry.bg} ${industry.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <industry.icon size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-charcoal group-hover:text-brand-orange transition-colors">{industry.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{industry.description}</p>
                                        <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-semibold text-brand-orange flex items-center">
                                            Learn More <span className="ml-2">→</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
