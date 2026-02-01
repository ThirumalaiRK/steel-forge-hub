import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, FileText } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Link } from "react-router-dom";

export const LeadConversionSection = () => {
    const { settings } = useSiteSettings();
    const whatsappNumber = settings?.whatsapp_number ? `https://wa.me/${(settings.whatsapp_number).replace(/\D/g, "")}` : "https://wa.me/919876543210";

    return (
        <section className="py-20 bg-brand-orange relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

            <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white font-heading">Ready to Transform Your Space?</h2>
                    <p className="text-white/90 mb-10 text-lg md:text-xl font-medium">
                        Get expert guidance, custom quotes, and premium metal furniture solutions tailored to your needs. No obligation.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                        <Button size="lg" asChild className="w-full sm:w-auto bg-white text-brand-orange hover:bg-white/90 font-bold text-base md:text-lg h-14 px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            <Link to="/contact">
                                <FileText className="mr-2.5 h-5 w-5" />
                                Request a Quote
                            </Link>
                        </Button>

                        <Button size="lg" asChild className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white border-none font-bold text-base md:text-lg h-14 px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            <a href={whatsappNumber} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2.5 h-5 w-5" />
                                WhatsApp Us
                            </a>
                        </Button>

                        <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-2 border-white/40 text-white bg-transparent hover:bg-white/10 font-bold text-base md:text-lg h-14 px-8 hover:scale-105 transition-all">
                            <Link to="/contact">
                                <Phone className="mr-2.5 h-5 w-5" />
                                Schedule Call
                            </Link>
                        </Button>
                    </div>

                    <p className="mt-6 text-white/60 text-sm font-medium">
                        Response time: Typically within 2 hours during business days.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
