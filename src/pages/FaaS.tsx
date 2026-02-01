import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  Check,
  X,
  Building2,
  Calendar,
  Repeat,
  Users,
  Factory,
  ShieldCheck,
  HardHat,
  Zap,
  HelpCircle,
  Truck,
  Wrench,
  RefreshCw,
  Phone,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Animation Helper Component
const RevealSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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

const FaaS = () => {
  const faqs = [
    {
      q: "What is the minimum rental period?",
      a: "Our monthly plans offer maximum flexibility with a minimum one-month rental period. For long-term needs, our annual plans provide better value and locked-in rates.",
    },
    {
      q: "Is maintenance really included?",
      a: "Yes, 100%. All FaaS plans cover regular maintenance and servicing. If a chair breaks or a table wobbles, just call us. We repair or replace it at no extra cost.",
    },
    {
      q: "Can we upgrade furniture mid-contract?",
      a: "Absolutely. We understand businesses grow. You can swap items, add new workstations, or upgrade to premium models anytime. We'll simply adjust your monthly fee.",
    },
    {
      q: "What happens at the end of the rental term?",
      a: "You have three choices: Renew the contract for extended savings, return the furniture if you're moving out, or purchase the items at a depreciated residual value.",
    },
    {
      q: "Is FaaS available for factories and institutions?",
      a: "Yes. In fact, our heavy-duty metal furniture is designed specifically for rough usage in factories, hostels, and training centers where durability is paramount.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navigation />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 pt-32 pb-24 lg:pt-48 lg:pb-32">
        {/* Background Gradient & Pattern */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/50" />

        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-blue-200 uppercase bg-blue-900/50 rounded-full border border-blue-400/30 backdrop-blur-sm">
              The Future of Workspaces
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Furniture as a Service <span className="text-blue-400">(FaaS)</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Don't buy assets that depreciate. Rent premium metal furniture that scales with your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-14 px-8 text-lg bg-brand-orange hover:bg-brand-orange-dark text-white rounded-full shadow-lg shadow-brand-orange/25 transition-all hover:scale-105" asChild>
                <Link to="/contact?inquiry=faas-quote">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-900 rounded-full transition-colors" asChild>
                <Link to="/contact?inquiry=faas-expert">Talk to an Expert</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. INTRODUCTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
                  Why Own When You Can <span className="text-blue-600">Subscribe?</span>
                </h2>
                <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Furniture as a Service (FaaS)</strong> is a flexible subscription model that replaces high capital expenditure (CapEx) with manageable operational expenditure (OpEx).
                  </p>
                  <p>
                    Whether you're setting up a new office, a temporary project site, or upgrading a university campus, FaaS gives you access to premium, durable metal furniture without the burden of ownership.
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
                <ul className="space-y-4">
                  {[
                    "Zero upfront capital investment",
                    "100% Tax deductible (OpEx)",
                    "Free delivery & professional installation",
                    "Maintenance included for zero headaches",
                    "Swap or return items as needs change"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* EXPLORE FAAS PRODUCTS */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white border-y border-slate-200">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-bold uppercase tracking-wider mb-6">
                <Zap size={16} />
                <span>Available Now</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                Explore FaaS-Ready Products
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Browse our curated collection of industrial furniture available for flexible rental. Premium quality, zero ownership hassle.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="bg-brand-orange hover:bg-brand-orange-dark text-white h-14 px-8" asChild>
                  <Link to="/faas/products">
                    Browse FaaS Products
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-slate-300 h-14 px-8" asChild>
                  <Link to="/contact">Talk to Expert</Link>
                </Button>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* 3. COMPARISON: BUYING vs FaaS */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why FaaS is the Smarter Choice</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Compare the traditional buying model with our modern service-based approach.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Buying Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 relative group">
                <div className="h-2 bg-red-500 w-full" />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <X className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Buying Furniture</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "High upfront capital block",
                      "Depreciating asset value",
                      "You pay for maintenance",
                      "Difficult to resell or dispose",
                      "Stuck with outdated designs"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-600">
                        <X className="w-5 h-5 text-red-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FaaS Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-blue-500 relative transform md:-translate-y-4 md:scale-105 z-10">
                <div className="h-2 bg-blue-600 w-full" />
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">AiRS with AiRS</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Low monthly subscription",
                      "Zero depreciation loss",
                      "Free lifetime maintenance",
                      "Easy upgrades & returns",
                      "Modern, flexible workspace"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                      <Link to="/contact">Switch to FaaS</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* 4. PROCESS TIMELINE */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-slate-500">From concept to installation in 5 simple steps.</p>
            </div>

            <div className="relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-100">
                <div className="absolute top-0 left-0 h-full bg-blue-100 w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-10 relative z-10">
                {[
                  { icon: HelpCircle, title: "Assess", desc: "We analyze your space & needs" },
                  { icon: Check, title: "Select", desc: "Choose catalog or custom items" },
                  { icon: Calendar, title: "Agreement", desc: "Sign a flexible rental plan" },
                  { icon: Truck, title: "Deliver", desc: "We ship & install for free" },
                  { icon: RefreshCw, title: "Support", desc: "Maintenance & upgrades included" },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-50 shadow-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:border-blue-50">
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-inner">
                        <step.icon className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm mb-4 border-4 border-white shadow-sm absolute top-0 -translate-y-1/2 md:translate-y-0 md:relative md:top-auto">
                      {i + 1}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 px-2">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* 5. PRICING PLANS */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <RevealSection>
            <div className="text-center mb-20">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-widest mb-4">
                Pricing & Plans
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-heading tracking-tight">Flexible Plans for Every Need</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                Choose the rental duration that aligns with your business strategy and operational goals.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
              {[
                {
                  name: "Monthly Flex",
                  tagline: "Short-term agility",
                  desc: "Perfect for startups, pop-up events, and temporary office setups requiring maximum flexibility.",
                  icon: Calendar,
                  highlight: false,
                  features: ["1-month minimum commitment", "Standard delivery speed", "Basic maintenance included", "Swap items quarterly"]
                },
                {
                  name: "Annual Pro",
                  tagline: "Best Value for Growth",
                  desc: "Ideal for established companies looking for locked-in rates and premium service tiers.",
                  icon: ShieldCheck,
                  highlight: true,
                  features: ["12-month contract savings", "Priority delivery & install", "Comprehensive maintenance", "Unlimited swaps & upgrades", "Dedicated account manager"]
                },
                {
                  name: "Enterprise Custom",
                  tagline: "Scale & Control",
                  desc: "Tailored solutions for multi-location projects, institutions, and large-scale deployments.",
                  icon: Building2,
                  highlight: false,
                  features: ["Multi-year agreements", "Custom fabrication options", "On-site support team", "Asset tracking dashboard", "Volume volume discounts"]
                },
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`relative flex flex-col h-full rounded-2xl p-8 border transition-all duration-300 group ${plan.highlight
                    ? 'bg-gradient-to-b from-blue-900/40 to-slate-900/80 border-blue-500/50 shadow-2xl shadow-blue-900/20 scale-105 z-10 ring-1 ring-blue-500/30'
                    : 'bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
                      Recommended
                    </div>
                  )}

                  <div className={`mb-6 p-3 rounded-xl inline-flex w-fit ${plan.highlight ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/20' : 'bg-slate-700/50 text-slate-400'}`}>
                    <plan.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-2xl font-bold mb-1 text-white group-hover:text-blue-200 transition-colors">{plan.name}</h3>
                  <div className="text-sm font-semibold text-blue-400 mb-4 tracking-wide uppercase opacity-90">{plan.tagline}</div>
                  <p className="mb-8 text-slate-400 text-sm leading-relaxed border-b border-slate-700/50 pb-8 min-h-[80px]">
                    {plan.desc}
                  </p>

                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm group/item">
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlight ? 'text-blue-400' : 'text-slate-500 group-hover/item:text-slate-300'}`} />
                        <span className={`${plan.highlight ? 'text-slate-200' : 'text-slate-400 group-hover/item:text-slate-300'} transition-colors`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full h-12 text-base font-semibold tracking-wide transition-all duration-300 ${plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-0.5'
                      : 'bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500'
                      }`}
                    asChild
                  >
                    <Link to="/contact">Get Quote</Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 text-center border-t border-slate-800 pt-8 max-w-2xl mx-auto">
              <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-6 flex-wrap">
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> No hidden fees</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Enterprise-grade support</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Flexible contracts</span>
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* 6. TARGET AUDIENCE */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-12">Who is FaaS Built For?</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Building2, text: "Corporate Offices" },
                { icon: Repeat, text: "Project Sites" },
                { icon: Users, text: "Educational Institutes" },
                { icon: Calendar, text: "Events & Exhibitions" },
              ].map((item, i) => (
                <div key={i} className="group p-6 rounded-xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100 text-center cursor-default">
                  <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-blue-50">
                    <item.icon className="w-8 h-8 text-slate-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{item.text}</h3>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* 7. FAQ w/ Accordion */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <RevealSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-500">Everything you need to know about the FaaS model.</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="bg-white px-6 rounded-xl border border-slate-200">
                  <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline hover:text-blue-600 text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-6 text-base leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </RevealSection>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="py-24 bg-brand-orange text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Zap className="w-64 h-64 rotate-12" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <RevealSection>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Workspace?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Get modern, durable metal furniture delivered and installed without the capital dump.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-14 px-8 text-lg bg-white text-brand-orange hover:bg-slate-100 shadow-xl" asChild>
                <Link to="/contact?inquiry=faas-quote">Get a Free Quote</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-white text-white hover:bg-white/10" asChild>
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </RevealSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FaaS;