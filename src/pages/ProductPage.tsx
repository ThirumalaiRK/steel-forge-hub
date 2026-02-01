import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Heart,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "@/components/ui/use-toast";

// Interfaces (kept detailed for type safety)
interface Offer {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface ProductImage {
  image_url: string;
  alt_text: string | null;
}

interface ProductVariant {
  id: string;
  size: string;
  finish_type: string;
  price: number;
  original_price?: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specifications: Record<string, string> | null;
  installation_guide: string | null;
  shipping_info: string | null;
  category_id: string | null;
  sub_category_id: string | null;
  product_images: ProductImage[];
  variants: ProductVariant[];
  offers: Offer | null;
  category: { name: string; slug: string } | null;
  sub_category: { name: string; slug: string } | null;
  is_active: boolean;
  metal_type: string | null;
  finish_type: string | null;
  usage: string | null;
  is_best_seller: boolean;
  price_type: 'fixed' | 'contact' | 'fixed_custom' | null;
  price: number | null;
  original_price: number | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  original_price: number | null;
  product_images: Array<{ image_url: string; alt_text: string | null }>;
  offers: Offer | null;
}

const ProductPage = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { session } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const handleFetchRelatedProducts = async (currentProduct: Product) => {
    try {
      if (!currentProduct.category_id) return;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          sub_category:sub_categories(name, slug),
          product_images(image_url, alt_text)
        `)
        .eq('category_id', currentProduct.category_id)
        .neq('id', currentProduct.id)
        .eq('is_active', true)
        .limit(3);

      if (error) {
        console.error('Error fetching related products:', error);
        return;
      }

      if (data) {
        setRelatedProducts(data as any as Product[]);
      }
    } catch (err) {
      console.error('Failed to fetch related products', err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productSlug]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSlug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Fetch Product without variants join to avoid FK errors
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select(`
            *,
            product_images (image_url, alt_text),
            category:categories (name, slug),
            sub_category:sub_categories (name, slug)
          `)
          .eq("slug", productSlug)
          .eq("is_active", true)
          .single();

        if (productError) throw productError;

        const product = productData as any as Product;
        product.offers = null;
        product.variants = [];

        // 2. Fetch Variants separately
        if (product.id) {
          const { data: variantsData, error: variantsError } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", product.id);

          if (!variantsError && variantsData) {
            product.variants = variantsData as ProductVariant[];
          }
        }

        setProduct(product);

        // Fetch related products
        if (product) {
          handleFetchRelatedProducts(product);
        }

        if (product.product_images?.length > 0) {
          setSelectedImage(product.product_images[0].image_url);
        }
        if (product.variants?.length > 0) {
          setSelectedVariant(product.variants[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug]);

  const images = product?.product_images || [];
  const displayPrice = selectedVariant?.price || product?.price || product?.variants?.[0]?.price || 0;
  const displayOriginalPrice = selectedVariant?.original_price || product?.original_price || product?.variants?.[0]?.original_price || 0;
  const discountPercentage = displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;

  const handleAddToCart = (isBuyNow = false) => {
    if (!product) return;

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      original_price: displayOriginalPrice,
      image_url: selectedImage || undefined,
      quantity: quantity,
      variantId: selectedVariant?.id,
      size: selectedVariant?.size
    });

    if (isBuyNow) {
      // In a real app, navigate to checkout
      toast({ title: "Proceeding to Checkout", description: "Redirecting you to secure checkout..." });
      // navigate('/checkout'); 
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image_url: selectedImage || undefined,
      category: product.category?.name
    });

    if (isInWishlist(product.id)) {
      toast({ title: "Removed from Wishlist", description: "Item removed from your wishlist." });
    } else {
      toast({ title: "Added to Wishlist", description: "Item saved to your wishlist." });
    }
  };

  const isLiked = product ? isInWishlist(product.id) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-slate-900 dark:text-white">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-slate-900 dark:text-white">
        <Navigation />
        <div className="container mx-auto px-4 pt-40 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you are looking for does not exist or has been moved.</p>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 mb-6">
          <nav className="flex items-center text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-brand-orange transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <Link to="/products" className="hover:text-brand-orange transition-colors">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
                <Link to={`/products?category=${product.category.slug}`} className="hover:text-brand-orange transition-colors">{product.category.name}</Link>
              </>
            )}
            {product.sub_category && (
              <>
                <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
                <Link to={`/products?category=${product.category?.slug}&sub-category=${product.sub_category.slug}`} className="hover:text-brand-orange transition-colors">{product.sub_category.name}</Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left Column: Image Gallery */}
            <div className="lg:col-span-7">
              <div className="flex flex-col-reverse lg:flex-row gap-4 sticky top-24">
                {/* Thumbnails */}
                {images.length > 0 && (
                  <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] no-scrollbar">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedImage(img.image_url)}
                        className={cn(
                          "relative w-20 h-20 min-w-[80px] rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:opacity-100",
                          selectedImage === img.image_url ? "border-brand-orange opacity-100" : "border-slate-200 dark:border-slate-800 opacity-60 hover:border-slate-300"
                        )}
                      >
                        <img src={img.image_url} alt={img.alt_text || `Product view ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Image */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative group min-h-[400px] lg:min-h-[500px]">
                  <AnimatePresence mode="wait">
                    {selectedImage ? (
                      <motion.img
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        src={selectedImage}
                        alt={product.name}
                        className="w-full h-full object-contain max-h-[600px] p-4"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground p-8 text-center bg-slate-100 dark:bg-slate-800">
                        <img src="/placeholder.svg" alt="No image available" className="w-24 h-24 opacity-20 mb-4" />
                        <p>No images available for this product</p>
                      </div>
                    )}
                  </AnimatePresence>
                  <div className="absolute top-4 right-4 z-10">
                    <Button variant="secondary" size="icon" className="rounded-full shadow-md bg-white/90 hover:bg-white text-slate-900 border-none">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Product Details */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                {product.is_best_seller && (
                  <Badge className="bg-brand-orange hover:bg-brand-orange-dark text-white mb-3">Best Seller</Badge>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <span className="text-sm text-muted-foreground">(124 verified reviews)</span>
                </div>

                <div className="flex flex-col mb-6">
                  {product.price_type === 'contact' ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-3xl font-bold text-brand-orange block mb-2">Contact for Price</span>
                      <p className="text-sm text-muted-foreground">
                        This product requires a custom quote based on your specific requirements and volume.
                      </p>
                    </div>
                  ) : (
                    <>
                      {product.price_type === 'fixed_custom' && (
                        <span className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Starting From</span>
                      )}
                      <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">₹{displayPrice.toLocaleString()}</span>
                        {displayOriginalPrice > displayPrice && (
                          <>
                            <span className="text-xl text-muted-foreground line-through mb-1">₹{displayOriginalPrice.toLocaleString()}</span>
                            <span className="text-lg font-medium text-green-600 mb-1">
                              {discountPercentage}% OFF
                            </span>
                          </>
                        )}
                      </div>
                      {product.price_type === 'fixed_custom' && (
                        <p className="text-xs text-brand-orange font-medium mt-2 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Customization options available
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center border border-slate-100 dark:border-slate-800">
                    <Truck className="w-6 h-6 text-brand-orange mb-2" />
                    <span className="text-xs font-medium">Free Delivery</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center border border-slate-100 dark:border-slate-800">
                    <RotateCcw className="w-6 h-6 text-brand-orange mb-2" />
                    <span className="text-xs font-medium">7 Days Return</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center border border-slate-100 dark:border-slate-800">
                    <ShieldCheck className="w-6 h-6 text-brand-orange mb-2" />
                    <span className="text-xs font-medium">1 Year Warranty</span>
                  </div>
                </div>

                {/* Size Selector */}
                {product.variants?.length > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Size</span>
                      <Button variant="link" className="text-brand-orange p-0 h-auto text-xs">Size Guide</Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={cn(
                            "px-4 py-3 rounded-md border min-w-[80px] text-sm font-medium transition-all",
                            selectedVariant?.id === variant.id
                              ? "border-brand-orange bg-brand-orange/10 text-brand-orange ring-1 ring-brand-orange"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {variant.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Info Table */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 mb-8 border border-slate-100 dark:border-slate-800">
                  <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Product Information</h3>
                  <div className="space-y-3 text-sm">
                    {product.metal_type && (
                      <div className="flex justify-between border-b border-dashed border-slate-200 dark:border-slate-700 pb-2">
                        <span className="text-muted-foreground">Material</span>
                        <span className="font-medium text-slate-900 dark:text-white">{product.metal_type}</span>
                      </div>
                    )}
                    {product.finish_type && (
                      <div className="flex justify-between border-b border-dashed border-slate-200 dark:border-slate-700 pb-2">
                        <span className="text-muted-foreground">Finish</span>
                        <span className="font-medium text-slate-900 dark:text-white">{product.finish_type}</span>
                      </div>
                    )}
                    {product.usage && (
                      <div className="flex justify-between border-b border-dashed border-slate-200 dark:border-slate-700 pb-2">
                        <span className="text-muted-foreground">Usage</span>
                        <span className="font-medium text-slate-900 dark:text-white">{product.usage}</span>
                      </div>
                    )}
                    <div className="flex justify-between pb-1">
                      <span className="text-muted-foreground">Availability</span>
                      <span className="font-medium text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> In Stock</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  {product.price_type === 'contact' ? (
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg shadow-lg shadow-brand-orange/20"
                      asChild
                    >
                      <Link to="/contact">Request Quote</Link>
                    </Button>
                  ) : (
                    <>
                      {/* Quantity & Actions Layout */}
                      <div className="space-y-3">
                        {/* Row 1: Quantity & Wishlist */}
                        <div className="flex gap-4">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg h-12 w-32 shrink-0">
                            <button
                              className="w-10 h-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-l-lg"
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="flex-1 text-center font-medium">{quantity}</span>
                            <button
                              className="w-10 h-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-r-lg"
                              onClick={() => setQuantity(quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <Button
                            size="lg"
                            variant="outline"
                            className={cn(
                              "h-12 w-12 p-0 rounded-lg border-2 transition-colors ml-auto",
                              isLiked && "bg-brand-orange/10 border-brand-orange text-brand-orange hover:text-brand-orange hover:bg-brand-orange/20"
                            )}
                            onClick={handleWishlistToggle}
                          >
                            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                          </Button>
                        </div>

                        {/* Row 2: Main CTAs */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            size="lg"
                            className="h-12 text-base bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg shadow-lg shadow-brand-orange/20"
                            onClick={() => handleAddToCart(false)}
                          >
                            <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                          </Button>
                          <Button
                            size="lg"
                            className="h-12 text-base bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 rounded-lg"
                            onClick={() => handleAddToCart(true)}
                          >
                            Buy Now
                          </Button>
                        </div>

                        {product.price_type === 'fixed_custom' && (
                          <Button
                            size="lg"
                            variant="outline"
                            className="w-full h-12 text-base border-slate-300 hover:bg-slate-50 mt-2"
                            asChild
                          >
                            <Link to="/contact">Request Customization</Link>
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections (Description, Feedback, etc) */}
        <div className="container mx-auto px-4 mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 mb-8 overflow-x-auto">
                  <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-orange data-[state=active]:bg-transparent data-[state=active]:text-brand-orange text-base px-0 pb-3 mr-8">Description</TabsTrigger>
                  <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-orange data-[state=active]:bg-transparent data-[state=active]:text-brand-orange text-base px-0 pb-3">Specifications</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="space-y-4 text-muted-foreground leading-relaxed">
                  {product.description ? (
                    <div className="whitespace-pre-line">{product.description}</div>
                  ) : (
                    <>
                      <p>Experience premium quality with this industrial-grade product. Designed for durability and aesthetic appeal, it fits perfectly in modern workspaces and homes.</p>
                      <p>Crafted from high-grade materials, specifically {product.metal_type || "steel"}, ensuring longevity and resistance to wear and tear. The {product.finish_type || "powder-coated"} finish adds a sleek look while providing extra protection.</p>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="specifications">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries((product.specifications && Object.keys(product.specifications).length > 0) ? product.specifications : {
                      "Material": product.metal_type || "Steel",
                      "Finish": product.finish_type || "Powder Coated",
                      "Dimensions": selectedVariant?.size || "Standard",
                      "Weight": "15 kg Approx",
                      "Assembly": "Required",
                      "Warranty": "1 Year Manufacturing Warranty"
                    }).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <span className="font-medium text-slate-500">{key}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="space-y-8">
                <h3 className="font-bold text-xl mb-6">Related Products</h3>
                <div className="space-y-4">
                  {relatedProducts.map((related) => (
                    <div
                      key={related.id}
                      className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                      onClick={() => {
                        navigate(`/product/${related.slug}`);
                        window.scrollTo(0, 0);
                      }}
                    >
                      <div className="w-20 h-20 bg-slate-100/50 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                        {related.product_images?.[0]?.image_url ? (
                          <img src={related.product_images[0].image_url} alt={related.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 py-1">
                        <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-brand-orange transition-colors line-clamp-2">{related.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {related.price_type === 'contact' ? (
                            <span className="text-sm font-semibold text-brand-orange">Contact for Price</span>
                          ) : (
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {related.price_type === 'fixed_custom' ? 'From ' : ''}₹{(related.price || 0).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main >

      <Footer />
    </div >
  );
};

export default ProductPage;