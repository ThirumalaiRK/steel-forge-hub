import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Phone, MessageCircle } from 'lucide-react';

// Placeholder data structure and fetch function
const getIndustryData = async (slug) => {
  // In a real application, this would be an API call to your backend/CMS
  const industriesData = {
    'industrial-manufacturing': {
      name: 'Industrial & Manufacturing',
      valueProposition: 'Metal Furniture Solutions for Industrial & Manufacturing Facilities',
      heroImage: '/placeholder-industrial-hero.jpg',
      gallery: ['/placeholder-industrial-1.jpg', '/placeholder-industrial-2.jpg', '/placeholder-industrial-3.jpg'],
      solutions: ['Industrial Metal Chairs', 'Workstations (MS / SS)', 'Heavy-Duty Storage Racks', 'Factory Seating Systems', 'Custom Fabrication'],
      benefits: ['High Load Capacity', 'Extreme Durability & Longevity', 'Compliance-Ready Designs', 'Custom Manufacturing for Specific Needs', 'Low Maintenance Lifecycle'],
      faas: true,
    },
    'warehousing-logistics': {
        name: 'Warehousing & Logistics',
        valueProposition: 'Robust Metal Solutions for High-Traffic Warehousing',
        heroImage: '/placeholder-warehousing-hero.jpg',
        gallery: ['/placeholder-warehousing-1.jpg', '/placeholder-warehousing-2.jpg', '/placeholder-warehousing-3.jpg'],
        solutions: ['Heavy-Duty Pallet Racks', 'Mezzanine Floors', 'Security Cages', 'Packing Stations'],
        benefits: ['Maximizes Storage Density', 'Withstands Forklift Impact', 'Improves Workflow Efficiency', 'Scalable & Modular'],
        faas: true,
    },
    // ... add placeholder data for all other industries
  };
  
  // Simulate API call delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(industriesData[slug] || null);
    }, 300);
  });
};

const IndustryPage = () => {
  const { industrySlug } = useParams();
  const [industry, setIndustry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndustry = async () => {
      setLoading(true);
      const data = await getIndustryData(industrySlug);
      setIndustry(data);
      setLoading(false);
    };

    if (industrySlug) {
      fetchIndustry();
    }
  }, [industrySlug]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!industry) {
    return (
      <div className="text-center py-40">
        <h1 className="text-4xl font-bold">Industry Not Found</h1>
        <p className="mt-2 text-lg text-gray-600">The industry you are looking for does not exist.</p>
        <Link to="/industries" className="mt-6 inline-block bg-gray-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors">
          Back to Industries
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <motion.section
        className="relative h-[70vh] min-h-[500px] flex items-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${industry.heroImage})` }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <motion.h1 
              className="text-4xl md:text-6xl font-extrabold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {industry.name}
            </motion.h1>
            <motion.p 
              className="mt-4 text-xl md:text-2xl text-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {industry.valueProposition}
            </motion.p>
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Link to="/contact?source=industry-quote" className="inline-block bg-amber-500 text-gray-900 font-bold py-3 px-8 rounded-lg text-lg hover:bg-amber-600 transition-colors">
                Get Industry Quote
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 2. Industry Visual Showcase */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
            Proven in the {industry.name} Environment
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {industry.gallery.map((image, index) => (
              <motion.div
                key={index}
                className="overflow-hidden rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img src={image} alt={`${industry.name} showcase ${index + 1}`} className="w-full h-80 object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Solutions We Provide */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
            Solutions We Provide for {industry.name}
          </h2>
          <div className="mt-12 max-w-4xl mx-auto">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {industry.solutions.map((solution, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Check className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-lg text-gray-700">{solution}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Why Our Solutions Work */}
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Why Our Solutions Work for {industry.name}
          </h2>
          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
            {industry.benefits.map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-bold text-amber-400">{benefit}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FaaS Section (Conditional) */}
      {industry.faas && (
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Furniture as a Service Available</h2>
            <p className="mt-4 text-lg text-gray-600">
              Flexible rental, corporate leasing, and project-based supply options are available for the {industry.name} sector. Conserve capital while getting the high-quality equipment you need.
            </p>
            <Link to="/faas" className="mt-8 inline-flex items-center font-semibold text-blue-600 hover:text-blue-800">
              Learn More about FaaS <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      )}

      {/* 6. Industry CTA */}
      <section className="py-16 md:py-24 bg-amber-500">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Ready to Upgrade Your {industry.name} Facility?
          </h2>
          <p className="mt-4 text-lg text-gray-800">
            Let's discuss your specific requirements. Our team is ready to provide a detailed quote and consultation for your project.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <a href="https://wa.me/YOUR_WHATSAPP_NUMBER" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-600 transition-colors">
              <MessageCircle className="mr-3 h-6 w-6" />
              Chat on WhatsApp
            </a>
            <Link to="/contact?source=industry-cta" className="inline-flex items-center justify-center bg-gray-900 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-800 transition-colors">
              <Phone className="mr-3 h-6 w-6" />
              Request a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndustryPage;