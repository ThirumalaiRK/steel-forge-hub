import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowRight, LayoutGrid, ListFilter } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

// Keep interfaces consistent with Products.tsx
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
  product_images: Array<{ image_url: string; alt_text: string | null }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null; // Desktop cover
  mobile_image_url: string | null;
  icon: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_image: string | null;
}

interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  show_as_cards: boolean; // New field
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
}

const CategoryPage = () => {
  const { categorySlug, subCategorySlug } = useParams<{ categorySlug: string; subCategorySlug?: string }>();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categorySlug) return;

      setLoading(true);
      try {
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", categorySlug)
          .eq("is_active", true)
          .single();

        if (categoryError || !categoryData) {
          throw new Error("Category not found");
        }
        setCategory(categoryData as unknown as Category);

        // Fetch associated products and sub-categories
        const [productsRes, subCategoriesRes] = await Promise.all([
          supabase
            .from("products")
            .select(
              `id, name, slug, description, is_faas_enabled, category_id, sub_category_id, metal_type, finish_type,
               product_images ( image_url, alt_text )`
            )
            .eq("is_active", true)
            .eq("category_id", categoryData.id)
            .order("display_order"),
          supabase
            .from("sub_categories")
            .select("*")
            .eq("is_active", true)
            .eq("category_id", categoryData.id)
            .order("display_order", { ascending: true }),
        ]);

        if (productsRes.error) throw productsRes.error;
        if (subCategoriesRes.error) throw subCategoriesRes.error;

        setProducts(productsRes.data || []);

        const subs = (subCategoriesRes.data || []) as unknown as SubCategory[];
        setSubCategories(subs);

        // Determine active sub-category from URL slug
        if (subCategorySlug) {
          const matchedSub = subs.find(s => s.slug === subCategorySlug);
          if (matchedSub) {
            setActiveSubCategory(matchedSub);
          } else {
            // If sub-category slug is invalid, maybe just ignore it or redirect?
            // For now, we'll just ignore it effectively acting as "All" but ideally should 404 or redirect.
            console.warn("Sub-category not found:", subCategorySlug);
          }
        } else {
          setActiveSubCategory(null);
        }

      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug, subCategorySlug]);

  const handleSubCategorySelect = (slug: string | null) => {
    if (slug) {
      navigate(`/products/${categorySlug}/${slug}`);
    } else {
      navigate(`/products/${categorySlug}`);
    }
  };

  const visibleProducts = activeSubCategory
    ? products.filter((p) => p.sub_category_id === activeSubCategory.id)
    : products;

  // SEO Logic
  const pageTitle = activeSubCategory?.seo_title || activeSubCategory?.name || category?.seo_title || category?.name || "Products";
  const pageDescription = activeSubCategory?.seo_description || activeSubCategory?.description || category?.seo_description || category?.description || "Explore our wide range of products.";
  const pageImage = activeSubCategory?.image_url || activeSubCategory?.og_image || category?.og_image || category?.mobile_image_url || category?.image_url || settings?.default_og_image;
  const canonicalUrl = `${window.location.origin}/products/${categorySlug}${activeSubCategory ? `/${activeSubCategory.slug}` : ""}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-12">
          <Skeleton className="h-12 w-1/2 mb-4" />
          <Skeleton className="h-6 w-3/4 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-square" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="text-center py-40">
          <h1 className="text-2xl font-bold">Category Not Found</h1>
          <p className="text-muted mt-4">The category you are looking for does not exist.</p>
          <Button asChild className="mt-8">
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle} | {settings?.business_tagline || "AIRS"}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={category.seo_keywords || ""} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Navigation />

      {/* Category Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh] bg-cover bg-center text-white">
        {/* Desktop Image */}
        <div
          className="absolute inset-0 bg-cover bg-center hidden md:block"
          style={{
            backgroundImage: `url(${category.image_url || '/placeholder.jpg'})`,
          }}
        />
        {/* Mobile Image */}
        <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{
            backgroundImage: `url(${category.mobile_image_url || category.image_url || '/placeholder.jpg'})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 to-slate-900/90" />
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl text-left"
          >
            <h1
              className="font-bold text-white tracking-tight leading-tight mb-4"
              style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
            >
              {activeSubCategory ? activeSubCategory.name : category.name}
            </h1>
            <p className="text-lg text-white/85 max-w-xl mb-8">
              {activeSubCategory
                ? (activeSubCategory.description || `Browse our ${activeSubCategory.name} collection.`)
                : (category.description || `Explore our collection of ${category.name}.`)
              }
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-brand-orange hover:bg-brand-orange/90 rounded-lg">
                <Link to="/contact">Get Quote</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 rounded-lg"
                onClick={scrollToProducts}
              >
                View Products
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="products-section" className="py-16">
        <div className="container mx-auto px-4">
          {/* Sub-category Quick Filters (Chips) */}
          {subCategories.length > 0 && (
            <div className="mb-10">
              {/* Visual Sub-Category Cards (Only shown on main category view or if configured) */}
              {!activeSubCategory && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                  {subCategories.filter(sc => sc.show_as_cards).map(sub => (
                    <Link
                      key={sub.id}
                      to={`/products/${category.slug}/${sub.slug}`}
                      className="group relative overflow-hidden rounded-xl aspect-[4/5] md:aspect-square border hover:shadow-lg transition-all"
                    >
                      <div className="absolute inset-0 bg-gray-200">
                        {sub.image_url ? (
                          <img
                            src={sub.image_url}
                            alt={sub.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                            <LayoutGrid className="w-8 h-8 opacity-20" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span className="text-white font-medium text-lg leading-tight block">
                          {sub.name}
                        </span>
                        {sub.description && (
                          <span className="text-white/70 text-xs line-clamp-2 mt-1 hidden md:block">
                            {sub.description}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground mr-2 hidden md:inline-flex items-center">
                  <ListFilter className="w-4 h-4 mr-1" /> Filters:
                </span>
                <button
                  type="button"
                  onClick={() => handleSubCategorySelect(null)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all hover-scale ${!activeSubCategory
                    ? "bg-brand-orange text-white border-brand-orange shadow-md font-medium"
                    : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                >
                  All Products
                </button>
                {subCategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSubCategorySelect(sub.slug)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all hover-scale ${activeSubCategory?.id === sub.id
                      ? "bg-brand-orange text-white border-brand-orange shadow-md font-medium"
                      : "bg-background text-foreground border-border hover:bg-muted"
                      }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Grid */}
          {visibleProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-lg">
                No products available in this selection yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden group hover-lift border h-full flex flex-col">
                    <Link to={`/products/${category.slug}/${product.slug}`}>
                      <div className="aspect-square overflow-hidden bg-muted">
                        {product.product_images[0] ? (
                          <img
                            src={product.product_images[0].image_url}
                            alt={
                              product.product_images[0].alt_text || product.name
                            }
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            No image
                          </div>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-6 flex-grow flex flex-col">
                      <Link to={`/products/${category.slug}/${product.slug}`}>
                        <h3 className="text-lg font-semibold mb-1 text-charcoal group-hover:text-brand-orange transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted mb-2">
                        {[product.metal_type, product.finish_type]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                      <p className="text-sm text-muted mb-4 line-clamp-2 flex-grow">
                        {product.description}
                      </p>
                      <div className="mt-auto">
                        {product.is_faas_enabled && (
                          <Badge className="bg-brand-blue text-white mb-4 hover:bg-brand-blue/90">
                            Available for FaaS
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild
                        >
                          <Link to={`/products/${category.slug}/${product.slug}`}>
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category CTA Section */}
      <section className="py-16 bg-light-bg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Need a Custom Solution?</h2>
          <p className="text-muted mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for in our {category.name} collection? We specialize in custom metal fabrication.
          </p>
          <Button asChild size="lg">
            <Link to="/contact">Request a Quote</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryPage;