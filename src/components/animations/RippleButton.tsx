import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

interface Ripple {
    x: number;
    y: number;
    id: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    ...props
}) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple: Ripple = {
            x,
            y,
            id: Date.now(),
        };

        setRipples((prev) => [...prev, newRipple]);

        setTimeout(() => {
            setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
        }, 600);

        onClick?.(e);
    };

    const variantClasses = {
        primary: 'bg-brand-orange hover:bg-brand-orange/90 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden rounded-lg font-semibold transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            onClick={handleClick}
            {...props}
        >
            <span className="relative z-10">{children}</span>
            {ripples.map((ripple) => (
                <motion.span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full"
                    initial={{
                        width: 0,
                        height: 0,
                        x: ripple.x,
                        y: ripple.y,
                        opacity: 1,
                    }}
                    animate={{
                        width: 400,
                        height: 400,
                        x: ripple.x - 200,
                        y: ripple.y - 200,
                        opacity: 0,
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
            ))}
        </motion.button>
    );
};
