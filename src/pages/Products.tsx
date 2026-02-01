import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { OffersSection } from "@/components/OffersSection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Offer {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_faas_enabled: boolean | null;
  category_id: string | null;
  sub_category_id: string | null;
  metal_type: string | null;
  finish_type: string | null;
  usage: string | null;
  price: number | null;
  original_price: number | null;
  product_images: Array<{ image_url: string; alt_text: string | null }>;
  offers: Offer | null;
  is_best_seller: boolean;
  created_at: string;
  price_type: 'fixed' | 'contact' | 'fixed_custom' | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  display_order: number;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortOrder, setSortOrder] = useState("popular");
  const [pageOffers, setPageOffers] = useState<any[]>([]); // Global offers for the page
  const [filters, setFilters] = useState({
    finish: [] as string[],
    usage: [] as string[],
    priceRange: [0, 50000] as [number, number],
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    const fetchCatsAndSubCats = async () => {
      setLoading(true);
      try {
        const [categoriesRes, subCategoriesRes] = await Promise.all([
          supabase.from("categories").select("*").eq("is_active", true).order("display_order"),
          supabase.from("sub_categories").select("*").eq("is_active", true).order("display_order"),
        ]);

        if (categoriesRes.error) throw categoriesRes.error;
        if (subCategoriesRes.error) throw subCategoriesRes.error;

        const categoryData = (categoriesRes.data as Category[]) || [];
        setCategories(categoryData);
        setSubCategories((subCategoriesRes.data as SubCategory[]) || []);

        const urlCategorySlug = searchParams.get("category");
        const urlSubCategorySlug = searchParams.get("sub-category");

        if (urlCategorySlug) {
          const category = categoryData.find((c) => c.slug === urlCategorySlug);
          if (category) {
            setSelectedCategory(category);
            if (urlSubCategorySlug) {
              setSelectedSubCategorySlug(urlSubCategorySlug);
            }
          }
        } else {
          setSelectedCategory(null);
          setSelectedSubCategorySlug(null);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatsAndSubCats();
  }, [searchParams]);

  // Fetch Global Offers for PLP
  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await (supabase
        .from("hero_banners")
        .select("*")
        .eq('type', 'offer')
        .eq('is_active', true)
        .order("display_order", { ascending: true }) as any);

      if (data) {
        const today = new Date();
        // Filter by date and target page in JavaScript
        const pertinent = data.filter((o: any) => {
          const isTargetPage = ['products', 'both'].includes(o.target_page);
          const isDateValid = (!o.start_date || new Date(o.start_date) <= today) &&
            (!o.end_date || new Date(o.end_date) >= today);
          return isTargetPage && isDateValid;
        });
        setPageOffers(pertinent);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCategory) {
        setProducts([]);
        setHasMore(false);
        return;
      }

      setLoadingProducts(true);
      try {
        const from = (page - 1) * PRODUCTS_PER_PAGE;
        const to = from + PRODUCTS_PER_PAGE - 1;

        let query = supabase
          .from("products")
          .select(
            `*,
             product_images ( image_url, alt_text )`
          )
          .eq("is_active", true)
          .eq("category_id", selectedCategory.id);

        if (selectedSubCategorySlug) {
          const subCat = subCategories.find((sc) => sc.slug === selectedSubCategorySlug);
          if (subCat) {
            query = query.eq("sub_category_id", subCat.id);
          }
        }

        if (filters.finish.length > 0) {
          query = query.in("finish_type", filters.finish);
        }
        if (filters.usage.length > 0) {
          query = query.in("usage", filters.usage);
        }

        switch (sortOrder) {
          case "price-asc":
          case "price-desc":
            query = query.order("display_order", { ascending: true });
            break;
          case "newest":
            query = query.order("created_at", { ascending: false });
            break;
          case "bestsellers":
            query = query.order("display_order", { ascending: true });
            break;
          default:
            query = query.order("display_order", { ascending: true });
            break;
        }

        const { data, error } = await query.range(from, to);

        if (error) {
          console.error("Error fetching products:", error);
          throw error;
        }

        const newProducts = (data || []) as any as Product[];

        setProducts((prev) => (page === 1 ? newProducts : [...prev, ...newProducts]));
        setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (categories.length > 0) {
      fetchProducts();
    }
  }, [selectedCategory, selectedSubCategorySlug, subCategories, page, sortOrder, filters, categories]);

  const handleFilterChange = (type: 'finish' | 'usage', value: string) => {
    setFilters(prev => {
      const currentValues = prev[type] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [type]: newValues };
    });
    setPage(1);
  };

  const handlePriceChange = (newRange: number[]) => {
    setFilters(prev => ({ ...prev, priceRange: newRange as [number, number] }));
    setPage(1);
  };

  const loadMoreProducts = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubCategorySlug(null);
    setPage(1);
    setSearchParams({ category: category.slug });
  };

  const handleSubCategoryClick = (subCategory: SubCategory) => {
    setSelectedSubCategorySlug(subCategory.slug);
    setPage(1);
    setProducts([]);
    setHasMore(true);
    if (selectedCategory) {
      setSearchParams({ category: selectedCategory.slug, "sub-category": subCategory.slug });
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubCategorySlug(null);
    setPage(1);
    setProducts([]);
    setSearchParams({});
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
    setPage(1);
  }

  const breadcrumbs = useMemo(() => {
    const home = <span className="cursor-pointer hover:underline text-brand-orange" onClick={handleBackToCategories}>Home</span>;
    const productsLink = <span className="cursor-pointer hover:underline text-brand-orange" onClick={handleBackToCategories}>Products</span>;
    if (!selectedCategory) {
      return <>{home} → Products</>;
    }
    if (!selectedSubCategorySlug) {
      return <>{home} → {productsLink} → {selectedCategory.name}</>;
    }
    const subCat = subCategories.find(s => s.slug === selectedSubCategorySlug);
    return (
      <>
        {home} → {productsLink} →
        <span className="cursor-pointer hover:underline text-brand-orange" onClick={() => handleSubCategoryClick(subCategories.find(sc => sc.category_id === selectedCategory.id)[0])}>
          {selectedCategory.name}
        </span> → {subCat?.name}
      </>
    );
  }, [selectedCategory, selectedSubCategorySlug, subCategories]);

  const FilterMenu = () => (
    <div className="p-4 space-y-6 w-full">
      <div>
        <h4 className="font-semibold mb-3">Finish Type</h4>
        <div className="space-y-2">
          {['MS', 'SS', 'Powder-Coated'].map(finish => (
            <div key={finish} className="flex items-center space-x-2">
              <Checkbox id={`finish-${finish.toLowerCase()}`} checked={filters.finish.includes(finish)} onCheckedChange={() => handleFilterChange('finish', finish)} />
              <Label htmlFor={`finish-${finish.toLowerCase()}`} className="w-full cursor-pointer">{finish}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Usage</h4>
        <div className="space-y-2">
          {['Home', 'Office', 'Commercial'].map(use => (
            <div key={use} className="flex items-center space-x-2">
              <Checkbox id={`usage-${use.toLowerCase()}`} checked={filters.usage.includes(use)} onCheckedChange={() => handleFilterChange('usage', use)} />
              <Label htmlFor={`usage-${use.toLowerCase()}`} className="w-full cursor-pointer">{use}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Price Range</h4>
        <Slider defaultValue={[50000]} max={50000} step={1000} value={filters.priceRange} onValueChange={handlePriceChange} />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>₹{filters.priceRange[0]}</span>
          <span>₹{filters.priceRange[1]}</span>
        </div>
      </div>
    </div>
  );

  // Helper for empty state in Category Level
  const CategoryEmptyState = () => (
    <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
      <p className="text-muted-foreground text-lg mb-2">More categories coming soon.</p>
      <p className="text-sm text-muted-foreground">We’re constantly expanding our collections.</p>
    </div>
  );

  const TrustStrip = () => (
    <div className="bg-slate-50 border-t border-b border-slate-100 py-4 mt-12">
      <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-medium text-slate-600">
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" /></svg>
          Custom Fabrication Available
        </span>
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          Industrial-Grade Materials
        </span>
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          Pan-India Delivery
        </span>
      </div>
    </div>
  );

  const WhatsAppCTA = () => (
    <a
      href="https://wa.me/919999999999" // Replace with actual number if available in env or settings
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
      aria-label="Contact on WhatsApp"
    >
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
    </a>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation />

      {/* Offers Section for Products Page - Only show if pertinent offers exist */}
      {pageOffers.length > 0 && <OffersSection offers={pageOffers} className="pb-8 pt-24 bg-background border-b" />}

      {/* Main Content Area */}
      <div className={cn("bg-slate-50/50 min-h-[60vh]", pageOffers.length === 0 && "pt-24")}>

        {/* Level 1: Product Categories Page */}
        {!selectedCategory && (
          <>
            <div className="bg-white border-b py-12">
              <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
                  <p className="text-sm text-brand-orange font-medium mb-3">{breadcrumbs}</p>
                  <h1 className="mb-3 text-3xl md:text-4xl font-bold font-heading text-slate-900">Product Categories</h1>
                  <p className="text-slate-500 text-lg">Explore our range of precision-engineered metal furniture solutions</p>
                </motion.div>
              </div>
            </div>

            <main className="container mx-auto px-4 py-12">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-xl" />)}
                </div>
              ) : categories.length === 0 ? (
                <CategoryEmptyState />
              ) : (
                <div className={cn(
                  "grid gap-6",
                  categories.length === 1 ? "grid-cols-1 md:grid-cols-1 max-w-xl mx-auto text-center" :
                    "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                )}>
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleCategoryClick(category)}
                      className="group cursor-pointer"
                    >
                      <Card className="overflow-hidden border-slate-200 hover:border-brand-orange/50 hover:shadow-xl transition-all duration-300 h-full bg-white">
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                              <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <Button size="sm" className="bg-white text-slate-900 hover:bg-white shadow">Explore <ArrowRight className="w-4 h-4 ml-1" /></Button>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-orange transition-colors mb-2">{category.name}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2">{category.description || "Precision-crafted for industrial excellence."}</p>
                          <div className="mt-4 flex gap-2">
                            {/* Static badges for now as per design intent */}
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">Industrial Grade</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              {categories.length === 1 && (
                <div className="text-center mt-8 text-slate-500 text-sm">More categories coming soon. We’re constantly expanding our collections.</div>
              )}
            </main>
          </>
        )}

        {/* Level 2: Sub-Category Selection Page */}
        {selectedCategory && !selectedSubCategorySlug && (
          <>
            <div className="bg-white border-b py-12">
              <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    {breadcrumbs}
                    <span className="bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded textxs font-semibold">Step 2 of 3</span>
                  </div>
                  <h1 className="mb-2 text-3xl md:text-4xl font-bold font-heading text-slate-900">{selectedCategory.name}</h1>
                  <p className="text-slate-500 text-lg">Choose a product type to view available designs</p>
                </motion.div>
              </div>
            </div>

            <main className="container mx-auto px-4 py-12">
              {subCategories.filter(sc => sc.category_id === selectedCategory.id).length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SlidersHorizontal className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Sub-Categories Found</h3>
                  <p className="text-muted-foreground">Products will be listed directly under this category in the future.</p>
                  <Button variant="outline" className="mt-6" onClick={handleBackToCategories}>Back to Categories</Button>
                </div>
              ) : (
                <div className={cn(
                  "grid gap-6",
                  subCategories.filter(sc => sc.category_id === selectedCategory.id).length <= 2 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                )}>
                  {subCategories
                    .filter(sc => sc.category_id === selectedCategory.id)
                    .map((subCategory, index) => (
                      <motion.div
                        key={subCategory.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSubCategoryClick(subCategory)}
                        className="group cursor-pointer"
                      >
                        <Card className="h-full border-slate-200 hover:border-brand-orange/50 hover:shadow-lg transition-all pt-6 relative overflow-hidden bg-white">
                          <div className="px-6 mb-4 flex justify-between items-start">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                              {/* Icon placeholder - could be dynamic if we added icons to DB */}
                              <span className="font-bold text-lg">{subCategory.name.charAt(0)}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="w-5 h-5 text-brand-orange -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                          </div>
                          <CardContent className="px-6 pb-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{subCategory.name}</h3>
                            <p className="text-sm text-slate-500">Explore heavy-duty {subCategory.name.toLowerCase()} for industrial use.</p>
                          </CardContent>
                          <div className="absolute bottom-0 left-0 h-1 bg-brand-orange w-0 group-hover:w-full transition-all duration-500" />
                        </Card>
                      </motion.div>
                    ))}
                </div>
              )}
            </main>
          </>
        )}

        {/* Level 3: Product Listing Page (PLP) */}
        {selectedCategory && (selectedSubCategorySlug || subCategories.filter(sc => sc.category_id === selectedCategory.id).length === 0) && (
          <>
            <div className="bg-white border-b pt-12 pb-6 sticky top-[72px] z-20 shadow-sm">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-sm text-muted-foreground mb-2">{breadcrumbs}</p>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {selectedSubCategorySlug
                        ? subCategories.find(s => s.slug === selectedSubCategorySlug)?.name
                        : selectedCategory.name}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Precision-crafted metal designs</p>
                  </motion.div>
                </div>

                {/* Sticky Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2 border-slate-300 hover:bg-slate-50">
                          <SlidersHorizontal size={16} />
                          <span>Filters</span>
                          {(filters.finish.length > 0 || filters.usage.length > 0) && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-brand-orange text-white text-[10px]">
                              {filters.finish.length + filters.usage.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-80 p-0" align="start">
                        <FilterMenu />
                        <div className="p-4 border-t bg-slate-50 flex justify-end">
                          <Button size="sm" onClick={() => document.body.click()}>Done</Button>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Quick Filter Chips (Optional - showing active filters) */}
                    {(filters.finish.length > 0 || filters.usage.length > 0) && (
                      <Button variant="ghost" size="sm" className="text-xs text-brand-orange hover:text-brand-orange/80" onClick={() => setFilters({ finish: [], usage: [], priceRange: [0, 50000] })}>
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 hidden sm:inline">Sort by:</span>
                    <Select value={sortOrder} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-[160px] border-slate-300">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Popular</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="newest">Newest Arrivals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <main className="container mx-auto px-4 py-8">
              <div className="flex items-start gap-8">
                {/* Product Grid */}
                <div className="flex-1">
                  {loadingProducts && page === 1 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-3">
                          <Skeleton className="aspect-square rounded-xl" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                      <p className="text-slate-500 max-w-md mx-auto mb-6">We couldn't find any products matching your filters within this category. Try adjusting your search or contact us for custom fabrication.</p>
                      <Button variant="outline" onClick={() => setFilters({ finish: [], usage: [], priceRange: [0, 50000] })}>Clear Filters</Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product, index) => {
                          const discount = product.original_price && product.price && product.original_price > product.price
                            ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                            : 0;
                          const productUrl = `/product/${product.slug}`;

                          return (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (index % 8) * 0.05 }}
                            >
                              <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 group bg-white overflow-hidden rounded-xl flex flex-col">
                                <div className="relative aspect-square overflow-hidden bg-slate-100">
                                  <Link to={productUrl}>
                                    {product.product_images?.[0] ? (
                                      <img
                                        src={product.product_images[0].image_url}
                                        alt={product.product_images[0].alt_text || product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Image</div>
                                    )}
                                  </Link>

                                  {/* Badges */}
                                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    {product.offers?.cta_text && (
                                      <Badge className="bg-brand-orange text-white shadow-sm border-none">{product.offers.cta_text}</Badge>
                                    )}
                                    {product.is_best_seller && (
                                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-none shadow-sm">Best Seller</Badge>
                                    )}
                                    {discount > 0 && (
                                      <Badge variant="destructive" className="shadow-sm">{discount}% OFF</Badge>
                                    )}
                                  </div>

                                  {/* Quick Actions overlay */}
                                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2 bg-gradient-to-t from-black/80 to-transparent pt-10">
                                    <Button size="sm" variant="secondary" className="flex-1 bg-white text-slate-900 hover:bg-slate-100 shadow-lg text-xs" asChild>
                                      <Link to={productUrl}>Details</Link>
                                    </Button>
                                    <Button size="sm" className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white shadow-lg text-xs" asChild>
                                      <Link to="/contact">Quote</Link>
                                    </Button>
                                  </div>
                                </div>

                                <CardContent className="p-4 flex flex-col flex-1">
                                  <div className="mb-2">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold line-clamp-1">
                                      {product.metal_type || 'Industrial Metal'}
                                    </p>
                                    <Link to={productUrl}>
                                      <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-brand-orange transition-colors line-clamp-2 mt-1 h-[42px]">
                                        {product.name}
                                      </h3>
                                    </Link>
                                  </div>

                                  <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                                    {product.price_type === 'contact' ? (
                                      <span className="text-brand-orange font-bold text-sm">Contact for Price</span>
                                    ) : (
                                      <div className="flex flex-col">
                                        <span className="text-slate-900 font-bold text-lg">
                                          {product.price ? `₹${product.price.toLocaleString()}` : 'Price on Request'}
                                        </span>
                                        {discount > 0 && (
                                          <span className="text-slate-400 text-xs line-through">₹{product.original_price?.toLocaleString()}</span>
                                        )}
                                      </div>
                                    )}
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                                      <ArrowRight size={14} />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>

                      {hasMore && (
                        <div className="text-center mt-12">
                          <Button onClick={loadMoreProducts} disabled={loadingProducts} className="px-8 py-2 h-auto rounded-full border-slate-300 hover:border-brand-orange hover:text-brand-orange hover:bg-white transition-all shadow-sm bg-white text-slate-600">
                            {loadingProducts ? "Loading..." : "Load More Products"}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </main>
          </>
        )}

      </div>

      <TrustStrip />
      <WhatsAppCTA />
      <Footer />
    </div>
  );
};
import { ArrowRight } from "lucide-react"; // Ensure this is imported at the top if adding new icons

export default Products;