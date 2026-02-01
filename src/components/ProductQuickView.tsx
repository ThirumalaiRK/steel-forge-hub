import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Heart, Share2, ShoppingCart, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '@/contexts/WishlistContext';
import { useComparison } from '@/contexts/ComparisonContext';
import { Link } from 'react-router-dom';

interface ProductQuickViewProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        slug: string;
        description?: string;
        specifications?: any;
        metal_type?: string;
        finish_type?: string;
        category?: string;
        images?: Array<{ image_url: string; alt_text?: string }>;
        is_faas_enabled?: boolean;
    } | null;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({ isOpen, onClose, product }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
    const { addToComparison, isInComparison, comparisonCount, maxComparison } = useComparison();

    if (!product) return null;

    const images = product.images || [];
    const inWishlist = isInWishlist(product.id);
    const inComparison = isInComparison(product.id);

    const handleAddToCart = () => {
        setIsAddedToCart(true);
        setTimeout(() => setIsAddedToCart(false), 2000);
    };

    const handleWishlistToggle = () => {
        if (inWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist({
                id: product.id,
                name: product.name,
                slug: product.slug,
                image_url: images[0]?.image_url,
                category: product.category,
            });
        }
    };

    const handleComparisonToggle = () => {
        if (!inComparison && comparisonCount >= maxComparison) {
            alert(`You can only compare up to ${maxComparison} products`);
            return;
        }

        if (!inComparison) {
            addToComparison({
                id: product.id,
                name: product.name,
                slug: product.slug,
                image_url: images[0]?.image_url,
                specifications: product.specifications,
                category: product.category,
                metal_type: product.metal_type,
                finish_type: product.finish_type,
            });
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description || `Check out ${product.name}`,
                    url: window.location.origin + `/product/${product.slug}`,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.origin + `/product/${product.slug}`);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img
                                src={images[selectedImage]?.image_url || '/placeholder.png'}
                                alt={images[selectedImage]?.alt_text || product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-brand-orange' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={img.image_url}
                                            alt={img.alt_text || `${product.name} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            {product.category && (
                                <Badge variant="secondary">{product.category}</Badge>
                            )}
                            {product.is_faas_enabled && (
                                <Badge className="bg-brand-blue text-white">FaaS Available</Badge>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-muted-foreground">{product.description}</p>
                        )}

                        <Separator />

                        {/* Specifications */}
                        {(product.metal_type || product.finish_type || product.specifications) && (
                            <div>
                                <h3 className="font-semibold mb-3">Specifications</h3>
                                <div className="space-y-2 text-sm">
                                    {product.metal_type && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Metal Type:</span>
                                            <span className="font-medium">{product.metal_type}</span>
                                        </div>
                                    )}
                                    {product.finish_type && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Finish:</span>
                                            <span className="font-medium">{product.finish_type}</span>
                                        </div>
                                    )}
                                    {product.specifications && typeof product.specifications === 'object' && (
                                        Object.entries(product.specifications).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                                                <span className="font-medium">{String(value)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
                                    size="lg"
                                >
                                    <AnimatePresence mode="wait">
                                        {isAddedToCart ? (
                                            <motion.span
                                                key="added"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Check size={20} />
                                                Added to Quote
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                key="add"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-2"
                                            >
                                                <ShoppingCart size={20} />
                                                Request Quote
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Button>

                                <Button
                                    onClick={handleWishlistToggle}
                                    variant={inWishlist ? "default" : "outline"}
                                    size="lg"
                                    className={inWishlist ? "bg-red-500 hover:bg-red-600" : ""}
                                >
                                    <Heart size={20} className={inWishlist ? "fill-current" : ""} />
                                </Button>

                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    size="lg"
                                >
                                    <Share2 size={20} />
                                </Button>
                            </div>

                            <Button
                                onClick={handleComparisonToggle}
                                variant="outline"
                                className="w-full"
                                disabled={inComparison || (comparisonCount >= maxComparison && !inComparison)}
                            >
                                {inComparison ? 'Added to Comparison' : `Add to Compare (${comparisonCount}/${maxComparison})`}
                            </Button>

                            <Link to={`/product/${product.slug}`}>
                                <Button variant="ghost" className="w-full group">
                                    View Full Details
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
