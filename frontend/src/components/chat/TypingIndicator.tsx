"use client";

import { motion } from "framer-motion";

/**
 * TypingIndicator component shows animated dots for loading state.
 * Requirements: 2.4
 */
export function TypingIndicator() {
    const dotVariants = {
        initial: { y: 0 },
        animate: { y: -4 },
    };

    const containerVariants = {
        animate: {
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    return (
        <motion.div
            className="flex items-center gap-1 py-1"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {[0, 1, 2].map((index) => (
                <motion.span
                    key={index}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    variants={dotVariants}
                    transition={{
                        duration: 0.4,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    }}
                />
            ))}
        </motion.div>
    );
}
