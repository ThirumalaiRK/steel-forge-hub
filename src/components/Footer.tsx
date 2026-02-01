import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, MessageCircle, Clock, Send, CheckCircle, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from '@/hooks/use-site-settings';

const footerCategories = [
  { name: 'Industrial Metal Furniture', slug: 'industrial-metal-furniture' },
  { name: 'Restaurant & Café', slug: 'restaurant-cafe-furniture' },
  { name: 'Institutional', slug: 'institutional-furniture' },
  { name: 'Metal Wall Art', slug: 'metal-wall-art' },
];

const quickLinks = [
  { name: 'Products', path: '/products' },
  { name: 'FaaS', path: '/faas' },
  { name: 'Industries', path: '/industries' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubscribed(true);
    setIsSubmitting(false);
    setEmail('');

    // Reset after 5 seconds
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  return (
    <footer className="bg-slate-900 text-white border-t border-white/10">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Column 1: About & Logo */}
          <div className="space-y-6 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3">
              <img className="h-12 w-auto" src="/airs_log.png" alt="AIRS Logo" />
              <div>
                <span className="block font-bold text-white uppercase text-lg tracking-wider">AiRS</span>
                <span className="block text-xs text-white/80 font-light tracking-widest">Ai ROBO FAB SOLUTIONS</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              {(settings as any)?.footer_about_text || "Precision metal furniture and fabrication solutions for industrial, commercial, and institutional environments."}
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {(() => {
                const sl = (settings?.social_links as any) || {};
                const platforms = [
                  { key: 'facebook', icon: Facebook, color: 'hover:bg-[#1877F2]' },
                  { key: 'instagram', icon: Instagram, color: 'hover:bg-[#E4405F]' },
                  { key: 'linkedin', icon: Linkedin, color: 'hover:bg-[#0A66C2]' },
                  { key: 'youtube', icon: Youtube, color: 'hover:bg-[#FF0000]' } // Added Youtube support
                ];

                return platforms.map(({ key, icon: Icon, color }) => {
                  const link = sl[key];
                  const url = typeof link === 'string' ? link : link?.url;
                  const enabled = typeof link === 'string' ? !!link : link?.enabled;

                  if (!enabled || !url) return null;

                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full bg-white/10 ${color} hover:text-white flex items-center justify-center transition-all hover:scale-110`}
                    >
                      <Icon size={18} />
                    </a>
                  );
                });
              })()}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-brand-orange transition-colors flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-brand-orange group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Product Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase mb-6">Categories</h3>
            <ul className="space-y-3">
              {footerCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/products/${category.slug}`}
                    className="text-sm text-white/60 hover:text-brand-orange transition-colors flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-brand-orange group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start group">
                <Phone className="flex-shrink-0 h-5 w-5 text-brand-orange mt-0.5" />
                <div className="ml-3">
                  <a
                    href={`tel:${settings?.phone_number || '+1234567890'}`}
                    className="text-sm text-white/60 hover:text-white transition-colors block"
                  >
                    {settings?.phone_number || '+1 (234) 567-890'}
                  </a>
                  <span className="text-xs text-white/40">Click to call</span>
                </div>
              </li>

              <li className="flex items-start group">
                <MessageCircle className="flex-shrink-0 h-5 w-5 text-brand-orange mt-0.5" />
                <div className="ml-3">
                  <a
                    href={`https://wa.me/${(settings?.whatsapp_number || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:text-white transition-colors block"
                  >
                    WhatsApp Chat
                  </a>
                  <span className="text-xs text-white/40">Quick response</span>
                </div>
              </li>

              <li className="flex items-start group">
                <Mail className="flex-shrink-0 h-5 w-5 text-brand-orange mt-0.5" />
                <div className="ml-3">
                  <a
                    href={`mailto:${settings?.email || 'sales@airs-solutions.com'}`}
                    className="text-sm text-white/60 hover:text-white transition-colors block"
                  >
                    {settings?.email || 'sales@airs-solutions.com'}
                  </a>
                  <span className="text-xs text-white/40">Email us</span>
                </div>
              </li>

              <li className="flex items-start group">
                <MapPin className="flex-shrink-0 h-5 w-5 text-brand-orange mt-0.5" />
                <div className="ml-3">
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:text-white transition-colors block whitespace-pre-line"
                  >
                    {settings?.address || '123 Industrial Way, Metalburg'}
                  </a>
                  <span className="text-xs text-white/40">View on map</span>
                </div>
              </li>

              <li className="flex items-start">
                <Clock className="flex-shrink-0 h-5 w-5 text-brand-orange mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-white/60 whitespace-pre-line">{(settings as any)?.business_hours || "Mon - Sat: 9:00 AM - 6:00 PM"}</p>
                  <span className="text-xs text-white/40">Sunday Closed</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase mb-6">Newsletter</h3>
            <p className="text-sm text-white/60 mb-4">
              Subscribe to get special offers, updates and industry insights.
            </p>

            <AnimatePresence mode="wait">
              {!isSubscribed ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleNewsletterSubmit}
                  className="space-y-3"
                >
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-brand-orange pr-12"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting}
                      className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-orange hover:bg-brand-orange/90 h-8 w-8 p-0"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send size={16} />
                        </motion.div>
                      ) : (
                        <Send size={16} />
                      )}
                    </Button>
                  </div>

                  <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg p-3">
                    <p className="text-xs text-brand-yellow font-semibold">🎁 Get 10% off your first order!</p>
                  </div>

                  <p className="text-xs text-white/40">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  </motion.div>
                  <p className="text-sm font-semibold text-green-500 mb-1">Successfully Subscribed!</p>
                  <p className="text-xs text-white/60">Check your email for the discount code.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60 text-center md:text-left">
              {(settings as any)?.footer_copyright_text || `© ${currentYear} AiRS - Ai ROBO FAB SOLUTIONS. All rights reserved.`}
            </p>
            <div className="flex gap-6 text-sm text-white/60">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;