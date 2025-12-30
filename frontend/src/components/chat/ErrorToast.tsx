"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useChatStore } from "@/store/chat-store";

/**
 * ErrorToast component that watches for error state changes and displays toast notifications.
 * Requirements: 6.2 - Show error toast notification when API request fails
 * Requirements: 6.3 - Preserve user's message and allow retry
 * 
 * Uses Sonner toast library with auto-dismiss after 5 seconds.
 * Shows retry button when there's a failed message to resend.
 */
export function ErrorToast() {
    const { error, failedMessage, clearError, retryFailedMessage, clearFailedMessage } = useChatStore();
    const previousError = useRef<string | null>(null);

    useEffect(() => {
        // Only show toast when error changes to a new non-null value
        if (error && error !== previousError.current) {
            // If there's a failed message, show toast with retry action
            if (failedMessage) {
                toast.error(error, {
                    duration: 5000, // Auto-dismiss after 5 seconds
                    action: {
                        label: "Retry",
                        onClick: () => {
                            retryFailedMessage();
                        },
                    },
                    onDismiss: () => {
                        clearError();
                        clearFailedMessage();
                    },
                    onAutoClose: () => {
                        clearError();
                        // Keep failed message so user can still retry from input
                    },
                });
            } else {
                // No failed message, just show error toast
                toast.error(error, {
                    duration: 5000,
                    onDismiss: () => {
                        clearError();
                    },
                    onAutoClose: () => {
                        clearError();
                    },
                });
            }
        }

        previousError.current = error;
    }, [error, failedMessage, clearError, retryFailedMessage, clearFailedMessage]);

    // This component doesn't render anything visible
    // The Toaster component in layout.tsx handles the actual rendering
    return null;
}
