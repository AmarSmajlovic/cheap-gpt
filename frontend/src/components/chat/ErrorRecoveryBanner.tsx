"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorRecoveryBannerProps {
    /** The error message to display */
    error: string | null;
    /** The failed message content (if any) */
    failedMessage: string | null;
    /** Whether a retry is in progress */
    isRetrying?: boolean;
    /** Callback to retry the failed message */
    onRetry: () => void;
    /** Callback to dismiss the error and clear failed message */
    onDismiss: () => void;
}

/**
 * ErrorRecoveryBanner displays an inline error notification with retry functionality.
 * Requirements: 6.3 - Preserve user's message and allow retry
 * 
 * This component provides a more visible retry option than just the toast,
 * showing the failed message preview and allowing quick retry or dismiss.
 */
export function ErrorRecoveryBanner({
    error,
    failedMessage,
    isRetrying = false,
    onRetry,
    onDismiss,
}: ErrorRecoveryBannerProps) {
    const showBanner = error && failedMessage;

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-destructive/30 bg-destructive/10"
                >
                    <div className="max-w-3xl mx-auto px-3 py-2 md:px-4 md:py-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-destructive">
                                    Failed to send message
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    &ldquo;{failedMessage.slice(0, 100)}{failedMessage.length > 100 ? "..." : ""}&rdquo;
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onRetry}
                                    disabled={isRetrying}
                                    className="h-8 px-3 text-xs border-destructive/30 hover:bg-destructive/10"
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRetrying ? "animate-spin" : ""}`} />
                                    {isRetrying ? "Retrying..." : "Retry"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onDismiss}
                                    disabled={isRetrying}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    aria-label="Dismiss error"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
