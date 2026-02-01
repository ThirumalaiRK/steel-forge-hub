import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, ShoppingCart, Trash2, Share2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/MainLayout';

const WishlistPage = () => {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

    const handleShare = async () => {
        const productNames = wishlist.map((item) => item.name).join(', ');
        const shareText = `Check out my wishlist: ${productNames}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Wishlist',
                    text: shareText,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Wishlist link copied to clipboard!');
        }
    };

    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md px-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        <Heart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
                    <p className="text-muted-foreground mb-6">
                        Start adding products you love to your wishlist
                    </p>
                    <Link to="/products">
                        <Button className="bg-brand-orange hover:bg-brand-orange/90">
                            Browse Products
                            <ArrowRight className="ml-2" size={18} />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
                        <p className="text-muted-foreground">
                            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleShare} className="gap-2">
                            <Share2 size={18} />
                            Share Wishlist
                        </Button>
                        <Button variant="outline" onClick={clearWishlist} className="gap-2 text-destructive hover:text-destructive">
                            <Trash2 size={18} />
                            Clear All
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {wishlist.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                                    <div className="relative aspect-square bg-gray-100">
                                        <img
                                            src={item.image_url || '/placeholder.png'}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <button
                                            onClick={() => removeFromWishlist(item.id)}
                                            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <Heart className="fill-current text-red-500 hover:text-white" size={20} />
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div>
                                            {item.category && (
                                                <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                                            )}
                                            <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link to={`/product/${item.slug}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    View Details
                                                </Button>
                                            </Link>
                                            <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90">
                                                <ShoppingCart size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;
