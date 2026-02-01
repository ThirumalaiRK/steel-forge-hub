import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Package, Lock, ChevronRight, Home, CheckCircle2 } from "lucide-react";
import { EnhancedCheckoutDialog } from "@/components/checkout/EnhancedCheckoutDialog";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// --- Components ---

const CartItem = ({ item, updateQuantity, removeFromCart }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (newQty) => {
        setIsUpdating(true);
        await updateQuantity(item.id, newQty);
        setTimeout(() => setIsUpdating(false), 300); // Fake delay for UX feel
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="group flex flex-col sm:flex-row gap-6 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
            {/* Image */}
            <div className="w-full sm:w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 relative">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <Link to={`/product/${item.slug}`} className="font-bold text-lg text-slate-900 dark:text-white hover:text-brand-orange transition-colors line-clamp-1">
                            {item.name}
                        </Link>
                        <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-3">
                            {item.size && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-medium">Size: {item.size}</span>}
                            <span className="text-slate-400">SKU: {item.id.slice(0, 8)}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                        aria-label="Remove item"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex justify-between items-end mt-4 sm:mt-0">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                            <button
                                onClick={() => handleUpdate(item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm"
                                disabled={item.quantity <= 1 || isUpdating}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-bold text-slate-900 dark:text-white tabular-nums relative">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={item.quantity}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="block"
                                    >
                                        {item.quantity}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                            <button
                                onClick={() => handleUpdate(item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all shadow-sm"
                                disabled={isUpdating}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                        <div className="text-xs text-slate-400 mb-1">Total Price</div>
                        {item.price > 0 ? (
                            <span className="font-bold text-xl text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                        ) : (
                            <span className="text-sm font-medium text-brand-orange bg-brand-orange/10 px-2 py-1 rounded">Contact for Price</span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const CheckoutDialog = ({ isOpen, onClose, cartTotal, cart, onOrderSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState('form'); // form | success
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: ""
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Generate Sequential Order ID
            let nextOrderNumber = "0001";
            try {
                const { data: lastOrder } = await supabase
                    .from('orders' as any)
                    .select('order_number')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (lastOrder && (lastOrder as any).order_number) {
                    const parts = (lastOrder as any).order_number.split('-');
                    const lastNum = parseInt(parts[parts.length - 1]);
                    if (!isNaN(lastNum)) {
                        nextOrderNumber = (lastNum + 1).toString().padStart(4, '0');
                    }
                }
            } catch (err) {
                console.warn("Using default ID start", err);
            }

            const currentYear = new Date().getFullYear();
            const fullOrderNumber = `AIRS-IN-ORD-${currentYear}-${nextOrderNumber}`;

            // Create dummy order in Supabase
            const orderData = {
                customer_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                order_type: 'purchase',
                status: 'new',
                products: cart, // Storing entire cart array
                created_at: new Date().toISOString(),
                // Generate a custom, formatted order ID
                order_number: fullOrderNumber,
            };

            const { data: newOrder, error } = await supabase
                .from('orders' as any)
                .insert([orderData])
                .select()
                .single();

            if (error) throw error;
            if (!newOrder) throw new Error("Failed to create order");

            // Use the custom order number if available, otherwise fallback to index slicing (safety)
            const displayOrderId = (newOrder as any).order_number || (newOrder as any).id.slice(0, 8);

            // Trigger Notification
            await supabase.from('notifications' as any).insert({
                type: 'order',
                title: 'New Order Received',
                message: `Order #${displayOrderId} from ${formData.name}`,
                reference_id: (newOrder as any).id,
                is_read: false
            });

            setStep('success');
            onOrderSuccess(); // Clear cart in context
        } catch (error) {
            console.error('Order failed:', error);
            toast({
                title: "Order Failed",
                description: "There was an error placing your test order. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep('form');
        setFormData({ name: "", email: "", phone: "", company: "" });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Lock className="w-5 h-5 text-brand-orange" /> Secure Checkout
                            </DialogTitle>
                            <DialogDescription>
                                Complete your purchase by providing your details. <br />
                                <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded mt-2 inline-block">TEST MODE: No payment required</span>
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" placeholder="john@company.com" required value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" name="phone" placeholder="+91 98765 43210" required value={formData.phone} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company (Optional)</Label>
                                    <Input id="company" name="company" placeholder="Acme Industries Ltd." value={formData.company} onChange={handleChange} />
                                </div>
                            </div>

                            <DialogFooter className="mt-8">
                                <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                                <Button type="submit" className="bg-brand-orange hover:bg-brand-orange-dark text-white w-full sm:w-auto" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        "Place Order"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <div className="py-8 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Placed Successfully!</h2>
                        <p className="text-slate-500 mb-8 max-w-xs">
                            Your order has been received. Our team will contact you shortly for confirmation.
                        </p>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button variant="outline" onClick={handleClose} className="flex-1">Close</Button>
                            <Button className="bg-slate-900 text-white hover:bg-slate-800 flex-1" asChild>
                                <Link to="/products" onClick={handleClose}>Continue Shopping</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

const EmptyCart = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-orange/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
            <ShoppingBag className="w-12 h-12 text-slate-300 group-hover:text-brand-orange group-hover:-translate-y-1 transition-all duration-300" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Your cart is empty</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
            Ready to upgrade your workspace? Explore our premium collection of industrial-grade furniture.
        </p>
        <Button asChild size="lg" className="h-14 px-8 text-lg bg-brand-orange hover:bg-brand-orange-dark text-white rounded-full shadow-lg shadow-brand-orange/20 transition-transform hover:scale-105">
            <Link to="/products">Browse Products</Link>
        </Button>
    </div>
);

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Initial page load animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50/[0.3] font-sans">
                <Navigation />
                <main className="container mx-auto px-4 flex-1">
                    {/* Breadcrumbs for empty state too */}
                    <div className="pt-28 pb-4 flex items-center gap-2 text-sm text-slate-500">
                        <Link to="/" className="hover:text-brand-orange transition-colors"><Home className="w-4 h-4" /></Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium text-slate-900">Cart</span>
                    </div>
                    <EmptyCart />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/[0.3] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
            <Navigation />

            <main className="flex-1 pt-28 pb-20 container mx-auto px-4">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Link to="/" className="hover:text-brand-orange transition-colors flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="font-medium text-slate-900">Cart</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Shopping Cart</h1>
                        <span className="text-slate-500 font-medium">{cart.length} items</span>
                    </div>
                    <p className="text-slate-500 mt-2">Review your items before proceeding to checkout.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left: Cart Items */}
                    <motion.div
                        className="lg:col-span-8 space-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode="popLayout">
                            {cart.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    updateQuantity={updateQuantity}
                                    removeFromCart={removeFromCart}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Right: Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-4"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-28">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-base">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-slate-900 dark:text-white">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-base">
                                    <span>Shipping Estimate</span>
                                    <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Free</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-base">
                                    <span>Tax (18% GST Estimated)</span>
                                    <span>—</span>
                                </div>
                                <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
                                <div className="flex justify-between items-end font-bold text-slate-900 dark:text-white">
                                    <span className="text-lg">Total Amount</span>
                                    <span className="text-3xl tracking-tight">₹{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsCheckoutOpen(true)}
                                size="lg"
                                className="w-full h-14 text-lg bg-gradient-to-r from-brand-orange to-orange-600 hover:from-brand-orange-dark hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
                            >
                                Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>

                            <div className="mt-8 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                    <span>Secure SSL Encryption</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                                    <span>Purchase Protection</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Package className="w-4 h-4 text-slate-400" />
                                    <span>Industrial-grade Packaging</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <EnhancedCheckoutDialog
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cartTotal={cartTotal}
                cart={cart}
                onOrderSuccess={clearCart}
            />

            <Footer />
        </div>
    );
};

export default CartPage;
