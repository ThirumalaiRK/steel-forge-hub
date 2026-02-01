import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Phone, MessageCircle, ChevronRight, Settings, Truck, Coffee, Building2, GraduationCap, Stethoscope, Hotel, Store, Calendar, Landmark } from 'lucide-react';
import Footer from "@/components/Footer";

// Icon mapping for industries to add visual interest
const IndustryIcons = {
  'Industrial & Manufacturing': Settings,
  'Warehousing & Logistics': Truck,
  'Restaurants & Cafés': Coffee,
  'Corporate Offices': Building2,
  'Educational Institutions': GraduationCap,
  'Healthcare & Labs': Stethoscope,
  'Hospitality (Hotels & Resorts)': Hotel,
  'Retail & Showrooms': Store,
  'Events & Exhibitions': Calendar,
  'Government & Institutions': Landmark
};

// Final, complete data for all industries. This will be fetched from your admin panel.
const industriesData = [
  {
    name: 'Industrial & Manufacturing',
    slug: 'industrial-manufacturing',
    image: '/placeholder-industrial.jpg',
    description: 'Industrial environments demand furniture and fabrication solutions that can withstand heavy loads, continuous usage, vibration, and harsh operating conditions.',
    solutions: ['Industrial metal chairs & workstations', 'Heavy-duty storage racks', 'Factory seating systems', 'Custom MS / SS fabrication'],
    benefits: ['High load-bearing capacity', 'Long lifecycle & durability', 'Custom fabrication support', 'Safety & compliance ready'],
  },
  {
    name: 'Warehousing & Logistics',
    slug: 'warehousing-logistics',
    image: '/placeholder-warehousing.jpg',
    description: 'High-traffic warehouses require robust, space-efficient storage and handling solutions to maximize efficiency and ensure operational safety.',
    solutions: ['Heavy-duty pallet racks', 'Mezzanine structures', 'Security cages & partitions', 'Packing & sorting stations'],
    benefits: ['Maximizes storage density', 'Improves workflow efficiency', 'Withstands forklift impact', 'Scalable & modular designs'],
  },
  {
    name: 'Restaurants & Cafés',
    slug: 'restaurants-cafes',
    image: '/placeholder-restaurant.jpg',
    description: 'Hospitality spaces need furniture that is aesthetically pleasing, easy to maintain, and durable enough for high customer turnover.',
    solutions: ['Metal dining tables', 'Bar stools & high chairs', 'Outdoor seating systems', 'Decorative metal fixtures'],
    benefits: ['Commercial-grade durability', 'Easy to clean & sanitize', 'Weather-resistant options', 'Custom design flexibility'],
  },
  {
    name: 'Corporate Offices',
    slug: 'corporate-offices',
    image: '/placeholder-office.jpg',
    description: 'Modern offices require functional, ergonomic, and visually appealing furniture that supports productivity and brand identity.',
    solutions: ['Metal office desks & workstations', 'Conference tables', 'Storage & filing units', 'Reception furniture'],
    benefits: ['Clean, professional aesthetics', 'Long-term durability', 'Custom layouts & finishes', 'Optimized for daily use'],
  },
  {
    name: 'Educational Institutions',
    slug: 'educational-institutions',
    image: '/placeholder-education.jpg',
    description: 'Schools and colleges need safe, durable, and cost-effective furniture designed for continuous daily use by students and staff.',
    solutions: ['Student desks & benches', 'Laboratory furniture', 'Library racks', 'Hostel furniture'],
    benefits: ['Heavy-use durability', 'Safe, rounded-edge designs', 'Easy maintenance', 'Institutional compliance ready'],
  },
  {
    name: 'Healthcare & Labs',
    slug: 'healthcare-labs',
    image: '/placeholder-healthcare.jpg',
    description: 'Healthcare and laboratory environments demand hygienic, corrosion-resistant, and precision-engineered metal solutions.',
    solutions: ['SS lab tables & workstations', 'Storage cabinets', 'Equipment stands', 'Custom lab fabrication'],
    benefits: ['Corrosion-resistant materials', 'Easy sterilization', 'Precision fabrication', 'High safety standards'],
  },
  {
    name: 'Hospitality (Hotels & Resorts)',
    slug: 'hospitality',
    image: '/placeholder-hospitality.jpg',
    description: 'Hotels and resorts require furniture that combines durability with premium aesthetics across indoor and outdoor spaces.',
    solutions: ['Metal beds & seating', 'Outdoor furniture systems', 'Decorative partitions', 'Custom hospitality furniture'],
    benefits: ['Premium finishes', 'Weather-resistant designs', 'Long service life', 'Custom branding options'],
  },
  {
    name: 'Retail & Showrooms',
    slug: 'retail-showrooms',
    image: '/placeholder-retail.jpg',
    description: 'Retail spaces need strong, modular furniture that enhances product display while handling high footfall.',
    solutions: ['Display racks & shelves', 'Checkout counters', 'Storage systems', 'Custom metal fixtures'],
    benefits: ['Modular & scalable', 'Strong visual appeal', 'High load capacity', 'Custom fabrication support'],
  },
  {
    name: 'Events & Exhibitions',
    slug: 'events-exhibitions',
    image: '/placeholder-events.jpg',
    description: 'Temporary and recurring events require modular, portable, and reusable metal furniture systems.',
    solutions: ['Event seating systems', 'Modular stages', 'Display stands', 'Rental-ready furniture (FaaS)'],
    benefits: ['Quick installation & dismantling', 'Reusable & scalable', 'Strong yet lightweight', 'Rental-friendly designs'],
  },
  {
    name: 'Government & Institutions',
    slug: 'government-institutions',
    image: '/placeholder-government.jpg',
    description: 'Government projects demand reliable, compliant, and long-lasting metal furniture and fabrication solutions.',
    solutions: ['Institutional seating', 'Public infrastructure furniture', 'Storage & filing systems', 'Custom fabrication projects'],
    benefits: ['Compliance-ready manufacturing', 'Long lifecycle', 'High durability', 'Proven institutional experience'],
  },
];

const IndustrySection = ({ industry, index }) => {
  const isReversed = index % 2 !== 0;
  // Get icon for the industry, default to Settings if not found
  const Icon = IndustryIcons[industry.name] || Settings;

  return (
    <section className={`py-16 md:py-24 relative overflow-hidden ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>

      {/* Decorative background element for subtle depth */}
      {index % 2 !== 0 && (
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`flex flex-col md:flex-row gap-12 lg:gap-20 items-center ${isReversed ? 'md:flex-row-reverse' : ''}`}>

          {/* Visual Side */}
          <motion.div
            className="w-full md:w-1/2 relative group"
            initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="h-[300px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl relative">
              {/* Image Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60" />

              <img
                src={industry.image}
                alt={industry.name}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />

              {/* Badge Over Image */}
              <div className="absolute bottom-6 left-6 z-20">
                <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg inline-flex items-center gap-3">
                  <div className="bg-brand-orange/10 p-2 rounded-lg">
                    <Icon className="text-brand-orange w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-800 pr-2">Industry Standard</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            className="w-full md:w-1/2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-brand-orange" />
              <span className="text-brand-orange font-bold uppercase tracking-wider text-sm">Tailored Solutions</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">{industry.name}</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">{industry.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
              {/* Solutions List */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-brand-blue" />
                  Our Solutions
                </h3>
                <ul className="space-y-3">
                  {industry.solutions.map((solution, i) => (
                    <li key={i} className="flex items-start group/item">
                      <ChevronRight className="h-4 w-4 text-brand-orange mr-2 mt-1 shrink-0 group-hover/item:translate-x-1 transition-transform" />
                      <span className="text-slate-600 text-sm">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why it works */}
              <div className="bg-brand-blue/5 p-6 rounded-xl border border-brand-blue/10">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Why Choose Us
                </h3>
                <ul className="space-y-3">
                  {industry.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-blue mt-2 mr-2 shrink-0" />
                      <span className="text-slate-700 text-sm font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={`/industries/${industry.slug}`}
                className="inline-flex items-center justify-center bg-brand-blue text-white font-bold py-3.5 px-8 rounded-xl text-center shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 hover:-translate-y-0.5 transition-all"
              >
                View Industry Solutions
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center bg-transparent text-slate-700 font-bold py-3.5 px-8 rounded-xl text-center border-2 border-slate-200 hover:border-brand-orange hover:text-brand-orange transition-all"
              >
                Get Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const IndustriesPage = () => {
  return (
    <>
      {/* 1. Page Hero - Enhanced */}
      <header className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-slate-900 text-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900 z-0" />

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold text-xs uppercase tracking-widest mb-6">
              Industry Expertise
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Solutions for <span className="text-brand-blue-300">Every Industry</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We design and manufacture durable metal furniture and fabrication solutions tailored to the strict operational demands of diverse sectors.
          </motion.p>
        </div>
      </header>

      {/* 2. Industry Sections (Zig-Zag) */}
      <main className="bg-slate-50">
        {industriesData.map((industry, index) => (
          <IndustrySection key={industry.slug} industry={industry} index={index} />
        ))}
      </main>

      {/* 3. Final CTA Section - High Conversion */}
      <section className="py-24 bg-brand-orange relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 pattern-grid-lg opacity-10" />

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading leading-tight">
            Need a Custom Metal Solution?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Our engineering team is ready to partner with you. Let’s discuss your project requirements and build a solution that lasts.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/contact" className="inline-flex items-center justify-center bg-white text-brand-orange font-bold py-4 px-10 rounded-xl text-xl shadow-xl hover:bg-slate-50 transform hover:-translate-y-1 transition-all">
              <Phone className="mr-3 h-6 w-6" />
              Get Custom Quote
            </Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-green-600 text-white font-bold py-4 px-10 rounded-xl text-xl border-2 border-white/20 hover:bg-green-700 transform hover:-translate-y-1 transition-all shadow-lg">
              <MessageCircle className="mr-3 h-6 w-6" />
              WhatsApp Us
            </a>
          </div>

          <p className="mt-8 text-white/60 text-sm font-medium tracking-wide">
            TRUSTED BY 500+ ENTERPRISES ACROSS INDIA
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default IndustriesPage;