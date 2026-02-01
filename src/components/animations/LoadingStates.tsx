import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
    lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    lines = 1,
}) => {
    const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
        card: 'rounded-xl',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
    };

    if (variant === 'text' && lines > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                        style={{
                            ...style,
                            width: i === lines - 1 ? '70%' : '100%',
                        }}
                    />
                ))}
            </div>
        );
    }

    return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={style} />;
};

export const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <Skeleton variant="rectangular" height={250} />
            <div className="p-4 space-y-3">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" lines={2} />
                <div className="flex gap-2 pt-2">
                    <Skeleton variant="rectangular" height={40} className="flex-1" />
                    <Skeleton variant="rectangular" height={40} width={40} />
                </div>
            </div>
        </div>
    );
};

export const CategoryCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <Skeleton variant="rectangular" height={200} />
            <div className="p-6 space-y-3">
                <Skeleton variant="text" width="40%" height={8} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Skeleton variant="text" width="50%" />
                    <Skeleton variant="circular" width={32} height={32} />
                </div>
            </div>
        </div>
    );
};

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'brand-orange' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <motion.div
            className={`${sizeClasses[size]} border-${color} border-t-transparent rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
    );
};

interface ProgressBarProps {
    progress: number;
    height?: number;
    color?: string;
    showLabel?: boolean;
    animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 8,
    color = 'bg-brand-orange',
    showLabel = false,
    animated = true,
}) => {
    return (
        <div className="w-full">
            <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height }}>
                <motion.div
                    className={`h-full ${color} ${animated ? 'bg-gradient-to-r from-brand-orange to-brand-yellow' : ''}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
            {showLabel && (
                <div className="text-sm text-gray-600 mt-1 text-right font-medium">
                    {Math.round(progress)}%
                </div>
            )}
        </div>
    );
};

export const PulseLoader: React.FC<{ size?: number }> = ({ size = 12 }) => {
    return (
        <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="bg-brand-orange rounded-full"
                    style={{ width: size, height: size }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.5, 1],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    );
};

export const ShimmerEffect: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {children}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                    x: ['-100%', '100%'],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
        </div>
    );
};
