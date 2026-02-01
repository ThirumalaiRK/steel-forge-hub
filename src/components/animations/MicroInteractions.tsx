import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const AnimatedToast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    isVisible,
    onClose,
    duration = 3000,
}) => {
    React.useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const icons = {
        success: <Check className="text-green-500" size={20} />,
        error: <X className="text-red-500" size={20} />,
        warning: <AlertCircle className="text-yellow-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
    };

    const colors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200',
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${colors[type]}`}
                >
                    {icons[type]}
                    <span className="font-medium">{message}</span>
                    <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

interface SuccessCheckmarkProps {
    size?: number;
    color?: string;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({ size = 64, color = '#10b981' }) => {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            initial="hidden"
            animate="visible"
        >
            <motion.circle
                cx="32"
                cy="32"
                r="30"
                fill="none"
                stroke={color}
                strokeWidth="4"
                variants={{
                    hidden: { pathLength: 0, opacity: 0 },
                    visible: {
                        pathLength: 1,
                        opacity: 1,
                        transition: { duration: 0.5, ease: 'easeInOut' },
                    },
                }}
            />
            <motion.path
                d="M 20 32 L 28 40 L 44 24"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{
                    hidden: { pathLength: 0, opacity: 0 },
                    visible: {
                        pathLength: 1,
                        opacity: 1,
                        transition: { duration: 0.5, delay: 0.3, ease: 'easeInOut' },
                    },
                }}
            />
        </motion.svg>
    );
};

interface FloatingActionButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    onClick,
    icon,
    label,
    position = 'bottom-right',
}) => {
    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6',
    };

    return (
        <motion.button
            onClick={onClick}
            className={`fixed ${positionClasses[position]} z-40 bg-brand-orange text-white rounded-full shadow-lg hover:shadow-xl transition-shadow ${label ? 'px-6 py-3' : 'w-14 h-14'
                } flex items-center justify-center gap-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
            {icon}
            {label && <span className="font-semibold">{label}</span>}
        </motion.button>
    );
};

interface CounterAnimationProps {
    value: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
}

export const CounterAnimation: React.FC<CounterAnimationProps> = ({
    value,
    duration = 2,
    suffix = '',
    prefix = '',
}) => {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

            setCount(Math.floor(progress * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return (
        <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </motion.span>
    );
};
