import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

interface CartItem {
    id: string;
    productId: string;
    name: string;
    slug: string;
    price: number;
    original_price?: number;
    image_url?: string;
    quantity: number;
    variantId?: string;
    size?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, 'id'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: Omit<CartItem, 'id'>) => {
        setCart((prev) => {
            // Check if item with same product ID AND variant ID already exists
            const existingIndex = prev.findIndex((i) =>
                i.productId === item.productId && i.variantId === item.variantId
            );

            if (existingIndex > -1) {
                // Update quantity of existing item
                const newCart = [...prev];
                newCart[existingIndex].quantity += item.quantity;

                toast({
                    title: "Cart Updated",
                    description: `${item.name} quantity updated.`,
                });
                return newCart;
            } else {
                // Add new item with a unique cart ID
                const newItem = { ...item, id: `${item.productId}-${item.variantId}-${Date.now()}` };
                toast({
                    title: "Added to Cart",
                    description: `${item.name} has been added to your cart.`,
                });
                return [...prev, newItem];
            }
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
        toast({
            title: "Removed from Cart",
            description: "Item has been removed from your cart.",
        });
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setCart((prev) =>
            prev.map((item) => item.id === id ? { ...item, quantity } : item)
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
