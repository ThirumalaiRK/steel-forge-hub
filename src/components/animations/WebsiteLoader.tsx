import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WebsiteLoaderProps {
    onLoadingComplete?: () => void;
    minDisplayTime?: number;
}

export const WebsiteLoader: React.FC<WebsiteLoaderProps> = ({
    onLoadingComplete,
    minDisplayTime = 2500,
}) => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Loading Simulation
    useEffect(() => {
        const startTime = Date.now();
        const duration = minDisplayTime;

        // Smooth progress simulation
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            // Ease-out progress curve
            const calculatedProgress = Math.min(
                100,
                (1 - Math.pow(1 - elapsed / duration, 3)) * 100
            );

            setProgress(calculatedProgress);

            if (elapsed >= duration + 200) { // Slight buffer
                clearInterval(interval);
                setTimeout(() => {
                    setIsVisible(false);
                    if (onLoadingComplete) onLoadingComplete();
                }, 600);
            }
        }, 16);

        return () => clearInterval(interval);
    }, [minDisplayTime, onLoadingComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(10px)", scale: 1.02 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    {/* 1. Ambient Background Effects - Animated Rainbow Gradient */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Animated Gradient Gradients */}
                        <motion.div
                            className="absolute inset-x-[-50%] inset-y-[-50%] w-[200%] h-[200%] opacity-[0.15]"
                            style={{
                                background: "radial-gradient(circle at 30% 30%, #FFC933 0%, transparent 25%), " +
                                    "radial-gradient(circle at 70% 30%, #F04E23 0%, transparent 25%), " +
                                    "radial-gradient(circle at 30% 70%, #B81E6A 0%, transparent 25%), " +
                                    "radial-gradient(circle at 70% 70%, #5C79B8 0%, transparent 25%), " +
                                    "radial-gradient(circle at 50% 50%, #6FD1EC 0%, transparent 25%)",
                                backgroundSize: "100% 100%",
                            }}
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
                            }}
                        />

                        {/* White Overlay to soften the gradient */}
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl" />

                        {/* Grid Pattern Overlay (Very subtle on light) */}
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05] grayscale" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center w-full max-w-sm">

                        {/* 2. Anti-Gravity Logo Container */}
                        <motion.div
                            className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mb-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Magnetic Assembly Animation - Simulating 'Focusing' Energy */}
                            <motion.div
                                className="relative w-full h-full flex items-center justify-center"
                                initial={{ scale: 1.2, filter: "blur(20px)", opacity: 0 }}
                                animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
                                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* Floating Motion Wrapper */}
                                <motion.div
                                    animate={{ y: [0, -15, 0] }} // Increased float range
                                    transition={{
                                        duration: 3.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="relative w-full h-full flex items-center justify-center p-4"
                                >
                                    {/* Base Logo Image */}
                                    <img
                                        src="/airs_log-removebg-preview.svg"
                                        alt="AIRS Logo"
                                        className="relative z-10 w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
                                    />

                                    {/* Power Flow / Shimmer Effect */}
                                    {/* This uses the logo itself as a mask to create internal light movement */}
                                    <div
                                        className="absolute inset-0 z-20 w-full h-full pointer-events-none mix-blend-overlay"
                                        style={{
                                            maskImage: `url("/airs_log-removebg-preview.svg")`,
                                            WebkitMaskImage: `url("/airs_log-removebg-preview.svg")`,
                                            maskSize: "contain",
                                            WebkitMaskSize: "contain",
                                            maskRepeat: "no-repeat",
                                            WebkitMaskRepeat: "no-repeat",
                                            maskPosition: "center",
                                            WebkitMaskPosition: "center",
                                        }}
                                    >
                                        <motion.div
                                            className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                            animate={{ x: ["-150%", "150%"] }}
                                            transition={{
                                                duration: 2.5,
                                                repeat: Infinity,
                                                ease: "linear",
                                                repeatDelay: 0.5
                                            }}
                                            style={{ filter: "blur(8px)" }}
                                        />
                                    </div>

                                    {/* Subtle Back Glow Pulse */}
                                    <motion.div
                                        className="absolute inset-0 z-0 bg-brand-orange/10 blur-[50px] rounded-full"
                                        animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Depth Shadow (Anti-gravity feel) */}
                            <motion.div
                                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-3 bg-slate-200/50 rounded-[100%] blur-md"
                                initial={{ opacity: 0 }}
                                animate={{
                                    scale: [0.85, 1.1, 0.85],
                                    opacity: [0.6, 0.3, 0.6]
                                }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </motion.div>

                        {/* Brand Identity */}
                        <div className="text-center w-full space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                            >
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-[0.15em] font-heading uppercase">
                                    AiRS FAB SOLUTIONS
                                </h1>
                                <div className="flex items-center justify-center gap-3 mt-3 opacity-60">
                                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand-orange/30" />
                                    <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-widest">
                                        Ai Robo Fab Solutions
                                    </span>
                                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand-orange/30" />
                                </div>
                            </motion.div>

                            {/* Technical Progress Bar */}
                            <div className="w-full max-w-[240px] mx-auto space-y-2">
                                <div className="h-[2px] w-full bg-slate-100 rounded-full overflow-hidden relative">
                                    {/* Background Pulse */}
                                    <motion.div
                                        className="absolute inset-0 bg-brand-orange/5"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />

                                    {/* Fill */}
                                    <motion.div
                                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand-orange to-brand-yellow"
                                        style={{ width: `${progress}%` }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                    />

                                    {/* Leading Edge Glow */}
                                    <motion.div
                                        className="absolute top-0 bottom-0 w-[20px] bg-white blur-[5px]"
                                        style={{ left: `${progress}%`, opacity: progress < 100 ? 1 : 0 }}
                                        transformTemplate={(_, t) => `translateX(-50%)`}
                                    />
                                </div>

                                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                                    <span className={cn(progress < 100 ? "animate-pulse" : "")}>
                                        {progress < 100 ? "System Initializing..." : "Ready"}
                                    </span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Image Loader Variant (Lightweight) ---
// Used when loading individual images or components
interface ImageLoaderProps {
    className?: string;
    size?: number;
}

export const ImageLoader: React.FC<ImageLoaderProps> = ({ className, size = 64 }) => {
    return (
        <div className={cn("flex items-center justify-center relative", className)} style={{ width: size, height: size }}>
            {/* Floating Logo */}
            <motion.img
                src="/airs_log-removebg-preview.svg"
                alt="Loading..."
                className="w-full h-full object-contain drop-shadow-lg"
                initial={{ opacity: 0.8 }}
                animate={{
                    y: [0, -4, 0],
                    filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
                }}
                transition={{
                    y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                    filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            {/* Simple Shadow */}
            <motion.div
                className="absolute -bottom-2 w-[60%] h-1 bg-black/20 rounded-full blur-[2px]"
                animate={{ scaleX: [0.8, 1, 0.8], opacity: [0.3, 0.15, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    )
}

export default WebsiteLoader;
