import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Search, ShoppingCart, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";

type CategoryNavItem = {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<CategoryNavItem[]>([]);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isMobileCompanyOpen, setIsMobileCompanyOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  // Scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url, is_active, show_in_menu, display_order")
        .eq("is_active", true)
        .eq("show_in_menu", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error loading navigation categories", error);
        return;
      }

      if (data) {
        setCategoryItems(data.map(({ id, name, slug, image_url }) => ({ id, name, slug, image_url })));
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProductsOpen(false);
        setIsCompanyOpen(false);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsProductsOpen(false);
    setIsCompanyOpen(false);
    setIsSearchOpen(false);
    setIsOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "FaaS", path: "/faas" },
    { label: "Industries", path: "/industries" },
    { label: "About", path: "/about" },
    { label: "Company", path: "/company" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 h-20",
        isScrolled
          ? "bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-white/20"
          : "bg-slate-900/80 backdrop-blur-sm border-b border-white/10"
      )}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-3 transition-all duration-300">
            <img
              className="w-auto h-12 transition-all duration-300"
              src="/airs_log.png"
              alt="AIRS Logo"
            />
            <div className="transition-all duration-300">
              <span className="block font-bold text-white uppercase text-lg tracking-wider font-heading">AiRS</span>
              <span className="block text-xs text-white/80 font-light tracking-widest font-heading">
                Ai ROBO FAB SOLUTIONS
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="flex items-center gap-8">
              {navItems.map((item) =>
                item.path === "/products" ? (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => setIsProductsOpen(true)}
                    onMouseLeave={() => setIsProductsOpen(false)}
                  >
                    <Link
                      to={item.path}
                      className={cn(
                        "nav-link group",
                        isActive(item.path) && "active"
                      )}
                      aria-haspopup="true"
                      aria-expanded={isProductsOpen}
                    >
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-full" />
                    </Link>
                    {isActive(item.path) && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-orange rounded-full" />
                    )}

                    <AnimatePresence>
                      {isProductsOpen && categoryItems.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[480px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] ring-1 ring-black/5"
                          onMouseEnter={() => setIsProductsOpen(true)}
                          onMouseLeave={() => setIsProductsOpen(false)}
                        >
                          {/* Header */}
                          <div className="bg-slate-950/30 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                              Product Categories
                            </p>
                            <Link
                              to="/products"
                              className="text-[10px] font-medium text-brand-orange hover:text-brand-orange/80 transition-colors flex items-center group"
                              onClick={() => setIsProductsOpen(false)}
                            >
                              View All
                              <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                          </div>

                          {/* Category List - CLEAN LIST STYLE */}
                          <div className="p-2 grid grid-cols-1 gap-1">
                            {categoryItems.map((cat) => (
                              <Link
                                key={cat.id}
                                to={`/products?category=${cat.slug}`}
                                className="group flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/5"
                                onClick={() => setIsProductsOpen(false)}
                              >
                                <span className="text-sm text-slate-200 font-medium group-hover:text-white transition-colors">
                                  {cat.name}
                                </span>

                                {/* Animated Chevron */}
                                <svg
                                  className="w-4 h-4 text-slate-500 group-hover:text-brand-orange group-hover:translate-x-1 transition-all duration-200"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            ))}
                          </div>

                          {/* Subtle Bottom Glow Line */}
                          <div className="h-0.5 bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent w-full opacity-50" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : item.label === "Company" ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setIsCompanyOpen(true)}
                    onMouseLeave={() => setIsCompanyOpen(false)}
                  >
                    <button
                      className={cn(
                        "nav-link group",
                        (isActive("/company") || isActive("/company/manufacturing") || isActive("/company/team") || isActive("/company/case-studies")) && "active"
                      )}
                      aria-haspopup="true"
                      aria-expanded={isCompanyOpen}
                    >
                      {item.label}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isCompanyOpen ? 'rotate-180' : ''}`} />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-full" />
                    </button>

                    <AnimatePresence>
                      {isCompanyOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[260px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] ring-1 ring-black/5"
                        >
                          <div className="p-2 grid grid-cols-1 gap-1">
                            {[
                              { label: "Manufacturing Unit", path: "/company/manufacturing" },
                              { label: "Team & Leadership", path: "/company/team" },
                              { label: "Case Studies", path: "/company/case-studies" }
                            ].map(sub => (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                className="group flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-200"
                                onClick={() => setIsCompanyOpen(false)}
                              >
                                <span className="text-sm text-slate-200 font-medium group-hover:text-white transition-colors">
                                  {sub.label}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "nav-link group",
                      isActive(item.path) && "active"
                    )}
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-full" />
                    {isActive(item.path) && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-orange rounded-full" />
                    )}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10 relative"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10 relative"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {/* Cart badge */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* CTA Button */}
            <Button
              variant="default"
              size="sm"
              asChild
              className="bg-brand-orange hover:bg-brand-orange/90 font-semibold transition-all hover:scale-105"
            >
              <Link to="/contact">Get Quote</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-white"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              className="text-white p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div >

      {/* Search Bar */}
      <AnimatePresence>
        {
          isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 bg-slate-900/95 backdrop-blur-md overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4">
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                    <Input
                      type="text"
                      placeholder="Search products, categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-brand-orange rounded-lg"
                      autoFocus
                    />
                  </div>
                </form>
              </div>
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* Mobile Navigation */}
      <AnimatePresence>
        {
          isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-md overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-3">
                {navItems.map((item) =>
                  item.path === "/products" ? (
                    <div key={item.path}>
                      <button
                        onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
                        className="w-full flex items-center justify-between py-2 text-base font-medium text-white/80"
                        aria-expanded={isMobileProductsOpen}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-300 ${isMobileProductsOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isMobileProductsOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 mt-1 space-y-1 overflow-hidden"
                          >
                            <Link
                              to="/products"
                              onClick={() => setIsOpen(false)}
                              className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                            >
                              All Products
                            </Link>
                            {categoryItems.map((cat) => (
                              <Link
                                key={cat.id}
                                to={`/products/${cat.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                              >
                                {cat.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : item.label === "Company" ? (
                    <div key={item.label}>
                      <button
                        onClick={() => setIsMobileCompanyOpen(!isMobileCompanyOpen)}
                        className="w-full flex items-center justify-between py-2 text-base font-medium text-white/80"
                        aria-expanded={isMobileCompanyOpen}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-300 ${isMobileCompanyOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {isMobileCompanyOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 mt-1 space-y-1 overflow-hidden"
                          >
                            {[
                              { label: "Manufacturing Unit", path: "/company/manufacturing" },
                              { label: "Team & Leadership", path: "/company/team" },
                              { label: "Case Studies", path: "/company/case-studies" }
                            ].map(sub => (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={() => setIsOpen(false)}
                                className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`block py-2 text-base font-medium transition-colors ${isActive(item.path)
                        ? "text-brand-orange"
                        : "text-white/80 hover:text-white"
                        }`}
                    >
                      {item.label}
                    </Link>
                  )
                )}

                {/* Mobile Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Link
                    to="/wishlist"
                    className="flex-1 py-2 px-4 bg-white/10 hover:bg-white/15 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Heart size={18} />
                    <span className="text-sm">Wishlist</span>
                  </Link>
                  <Link
                    to="/cart"
                    className="flex-1 py-2 px-4 bg-white/10 hover:bg-white/15 text-white rounded-lg flex items-center justify-center gap-2 transition-colors relative"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShoppingCart size={18} />
                    <span className="text-sm">Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 font-semibold"
                  asChild
                >
                  <Link to="/contact" onClick={() => setIsOpen(false)}>
                    Get Quote
                  </Link>
                </Button>
              </div>
            </motion.div>
          )
        }
      </AnimatePresence >
    </nav >
  );
};

export default Navigation;