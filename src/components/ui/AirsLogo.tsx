import React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AirsLogoProps {
    className?: string;
    variant?: "full" | "icon" | "loader";
    animated?: boolean;
}

export const AirsLogo: React.FC<AirsLogoProps> = ({
    className,
    variant = "full",
    animated = true,
}) => {
    const pieceVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8, pathLength: 0 },
        visible: (custom: number) => ({
            opacity: 1,
            scale: 1,
            pathLength: 1,
            transition: {
                delay: custom * 0.1,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    };

    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full", className)}
        >
            <defs>
                <linearGradient id="grad-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFC933" />
                    <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F04E23" />
                    <stop offset="100%" stopColor="#B81E6A" />
                </linearGradient>
                <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6FD1EC" />
                    <stop offset="100%" stopColor="#5C79B8" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Top Shard */}
            <motion.path
                d="M50 10 L65 40 L35 40 Z"
                fill="url(#grad-red)"
                custom={1}
                variants={animated ? pieceVariants : undefined}
                initial="hidden"
                animate="visible"
                style={{ filter: "drop-shadow(0px 4px 6px rgba(240, 78, 35, 0.3))" }}
            />

            {/* Left Shard */}
            <motion.path
                d="M30 46 L45 76 L15 76 Z"
                fill="url(#grad-yellow)"
                custom={0}
                variants={animated ? pieceVariants : undefined}
                initial="hidden"
                animate="visible"
                style={{ filter: "drop-shadow(0px 4px 6px rgba(255, 201, 51, 0.3))" }}
            />

            {/* Right Shard */}
            <motion.path
                d="M70 46 L85 76 L55 76 Z"
                fill="url(#grad-blue)"
                custom={2}
                variants={animated ? pieceVariants : undefined}
                initial="hidden"
                animate="visible"
                style={{ filter: "drop-shadow(0px 4px 6px rgba(111, 209, 236, 0.3))" }}
            />

            {/* Triangle base bar (Optional, to complete Delta if needed) */}
            <motion.path
                d="M20 85 L80 85 L50 92 Z"
                fill="rgba(255,255,255,0.1)"
                custom={3}
                variants={animated ? pieceVariants : undefined}
                initial="hidden"
                animate="visible"
                className="hidden"
            />
        </svg>
    );
};
