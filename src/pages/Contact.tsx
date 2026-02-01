import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Factory, Clock, ShieldCheck, Loader2, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { cn } from "@/lib/utils";

const Contact = () => {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("enquiries").insert([formData]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Message Sent Successfully",
        description: "We have received your enquiry and will get back to you shortly.",
        duration: 5000,
      });

      // Reset form after delay
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          message: "",
        });
      }, 3000);

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was a problem sending your message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-brand-orange/20">
      <Navigation />

      {/* SECTION 1: HERO */}
      <section className="bg-white pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Contact Us
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-brand-orange to-orange-400 mx-auto rounded-full mb-8" />
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Let’s discuss your requirements and build the perfect metal solution.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: MAIN CONTACT AREA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-start">

            {/* LEFT COLUMN: FORM */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="shadow-xl shadow-slate-200/50 bg-white border-0 rounded-2xl overflow-hidden h-full ring-1 ring-slate-100">
                <CardContent className="p-8 md:p-10">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      Send Us a Message
                    </h2>
                    <p className="text-slate-500 mt-2">Fill out the form below and we'll get back to you within 24 hours.</p>
                  </div>

                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-100 rounded-xl p-8 text-center"
                    >
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                      <p className="text-green-700">Thanks! Our team will contact you shortly.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">

                      {/* Personal Info Group */}
                      <div className="space-y-5">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                          Personal Details
                        </h3>

                        <FloatingInput
                          id="name"
                          label="Your Name *"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          activeField={activeField}
                          setActiveField={setActiveField}
                        />

                        <FloatingInput
                          id="email"
                          type="email"
                          label="Email Address *"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          activeField={activeField}
                          setActiveField={setActiveField}
                        />

                        <FloatingInput
                          id="phone"
                          type="tel"
                          label="Phone Number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          activeField={activeField}
                          setActiveField={setActiveField}
                        />
                      </div>

                      <div className="h-px bg-slate-100 my-6" />

                      {/* Business Info Group */}
                      <div className="space-y-5">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                          Business Details
                        </h3>

                        <FloatingInput
                          id="company"
                          label="Company Name"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          activeField={activeField}
                          setActiveField={setActiveField}
                        />

                        <div className="relative group">
                          <Textarea
                            id="message"
                            placeholder=" "
                            rows={5}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            onFocus={() => setActiveField('message')}
                            onBlur={() => setActiveField(null)}
                            required
                            className={cn(
                              "block px-4 py-4 w-full text-base bg-slate-50 border-slate-200 rounded-lg focus:ring-brand-orange/20 focus:border-brand-orange peer pt-6 min-h-[120px] resize-y transition-all duration-200",
                              activeField === 'message' && "ring-4 ring-brand-orange/10 bg-white"
                            )}
                          />
                          <label
                            htmlFor="message"
                            className="absolute text-slate-500 duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-brand-orange"
                          >
                            Your Message *
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-14 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-orange/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* RIGHT COLUMN: INFO + MAP */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-8"
            >
              {/* CONTACT INFO CARD */}
              <Card className="shadow-lg shadow-slate-200/50 bg-white border-0 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-8">
                    <ContactInfoItem
                      icon={<Phone className="text-brand-orange w-5 h-5" />}
                      label="Phone"
                      value={settings?.phone_number ?? "+91-9876543210"}
                      link={settings?.phone_number ? `tel:${settings.phone_number}` : undefined}
                    />
                    <ContactInfoItem
                      icon={<Mail className="text-brand-orange w-5 h-5" />}
                      label="Email"
                      value={settings?.email ?? "info@metalforge.com"}
                      link={settings?.email ? `mailto:${settings.email}` : undefined}
                    />
                    <ContactInfoItem
                      icon={<MapPin className="text-brand-orange w-5 h-5" />}
                      label="Address"
                      value={settings?.address ?? "AiRS - Ai Robo Fab Solutions\nArasur, Coimbatore, Tamil Nadu, India"}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* MAP VISUAL */}
              <Card className="shadow-lg shadow-slate-200/50 bg-white border-0 rounded-2xl overflow-hidden relative min-h-[300px] flex flex-col">
                <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Map className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Loading Map...</p>
                  </div>
                </div>

                {/* Map Iframe */}
                <iframe
                  src="https://maps.google.com/maps?q=AIRS%20AI%20Robo%20Fab%20Solutions%20Arasur%20Coimbatore&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  className={cn("absolute inset-0 w-full h-full border-0 transition-opacity duration-500", mapLoaded ? "opacity-100" : "opacity-0")}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setMapLoaded(true)}
                />

                {/* Map Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-100/50 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">AiRS – Ai Robo Fab Solutions</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{settings?.address ?? "Arasur, Coimbatore, India"}</p>
                    </div>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-xs font-semibold text-brand-orange bg-brand-orange/5 px-3 py-1.5 rounded-full hover:bg-brand-orange/10 transition-colors"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              </Card>

              {/* WHATSAPP CTA - ENHANCED */}
              <Card className="shadow-lg border-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#25D366] via-[#128C7E] to-[#075E54] text-white relative group">
                <div className="absolute top-[-20%] right-[-10%] p-8 opacity-20 transition-transform duration-700 group-hover:rotate-12">
                  <MessageCircle className="w-48 h-48" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-white">Prefer WhatsApp?</h3>
                      <p className="text-green-50/90 font-medium text-sm leading-relaxed max-w-[260px]">
                        Chat with our team for instant support & faster quotes.
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner animate-pulse">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <Button
                    size="lg"
                    asChild
                    className="w-full h-12 bg-white text-[#128C7E] hover:bg-green-50 font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] group-hover:shadow-xl"
                  >
                    <a
                      href={settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}` : "https://wa.me/919876543210"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5 fill-current" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* TRUST BADGES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <TrustBadge icon={<Clock />} text="24h Response" />
                <TrustBadge icon={<Factory />} text="Industrial Grade" />
                <TrustBadge icon={<ShieldCheck />} text="Secure Data" />
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Helper Components
const FloatingInput = ({ id, label, activeField, setActiveField, className, ...props }: any) => {
  return (
    <div className="relative">
      <Input
        id={id}
        placeholder=" "
        onFocus={() => setActiveField(id)}
        onBlur={() => setActiveField(null)}
        className={cn(
          "block px-4 py-4 w-full text-base bg-slate-50 border-slate-200 rounded-lg focus:ring-brand-orange/20 focus:border-brand-orange peer pt-6 h-14 transition-all duration-200",
          activeField === id && "ring-4 ring-brand-orange/10 bg-white",
          className
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute text-slate-500 duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-brand-orange pointer-events-none"
      >
        {label}
      </label>
    </div>
  )
}

const ContactInfoItem = ({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: string }) => (
  <div className="flex items-start gap-4 group">
    <div className="shrink-0 w-10 h-10 rounded-full bg-brand-orange/10 group-hover:bg-brand-orange/20 transition-colors flex items-center justify-center mt-1">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-sm text-slate-900 mb-0.5">{label}</h4>
      {link ? (
        <a href={link} className="text-slate-600 hover:text-brand-orange transition-colors whitespace-pre-line text-base block font-medium">
          {value}
        </a>
      ) : (
        <p className="text-slate-600 whitespace-pre-line text-base leading-relaxed font-medium">{value}</p>
      )}
    </div>
  </div>
);

const TrustBadge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100 text-center hover:bg-white hover:shadow-sm transition-all">
    <div className="text-slate-400 mb-2 w-5 h-5 [&>svg]:w-full [&>svg]:h-full">{icon}</div>
    <span className="text-xs font-semibold text-slate-600">{text}</span>
  </div>
)

export default Contact;