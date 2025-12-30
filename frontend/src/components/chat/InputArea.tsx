"use client";

import { useState, useRef, useCallback, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InputAreaProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    /** Failed message to restore in the input for retry */
    failedMessage?: string | null;
    /** Callback when failed message is consumed */
    onFailedMessageConsumed?: () => void;
}

/**
 * InputArea component for message input with auto-resizing textarea.
 * Requirements: 1.1 - Send messages on Enter or click
 * Requirements: 1.4 - Prevent empty message submission
 * Requirements: 5.3 - Visual feedback animation on send
 * Requirements: 6.3 - Preserve message on send error (restore failed message)
 * Requirements: 7.3 - Input area fixed at bottom on all viewport sizes
 */
export function InputArea({
    onSend,
    isLoading = false,
    placeholder = "Type a message...",
    failedMessage = null,
    onFailedMessageConsumed,
}: InputAreaProps) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Restore failed message to input when it changes
    useEffect(() => {
        if (failedMessage && !isLoading) {
            setMessage(failedMessage);
            // Notify parent that we've consumed the failed message
            onFailedMessageConsumed?.();
            // Focus the textarea so user can edit/retry
            textareaRef.current?.focus();
        }
    }, [failedMessage, isLoading, onFailedMessageConsumed]);

    // Check if message is valid (non-empty, non-whitespace)
    const isValidMessage = message.trim().length > 0;
    const canSend = isValidMessage && !isLoading;

    // Auto-resize textarea based on content
    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            // Smaller max height on mobile (150px) vs desktop (200px)
            const maxHeight = window.innerWidth < 768 ? 150 : 200;
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;
        }
    }, []);

    // Handle input change
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        adjustTextareaHeight();
    };

    // Handle send message
    const handleSend = useCallback(() => {
        if (!canSend) return;

        onSend(message.trim());
        setMessage("");

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    }, [canSend, message, onSend]);

    // Handle keyboard events - Enter to send, Shift+Enter for newline
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 md:p-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={isLoading}
                        rows={1}
                        className={cn(
                            "min-h-[44px] max-h-[150px] md:max-h-[200px] resize-none py-3 text-base",
                            "focus-visible:ring-1 focus-visible:ring-primary",
                            isLoading && "opacity-50 cursor-not-allowed"
                        )}
                        aria-label="Message input"
                    />
                    <motion.div
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <Button
                            onClick={handleSend}
                            disabled={!canSend}
                            size="icon"
                            className={cn(
                                "h-[44px] w-[44px] shrink-0",
                                "transition-all duration-200",
                                canSend
                                    ? "bg-primary hover:bg-primary/90"
                                    : "bg-muted text-muted-foreground"
                            )}
                            aria-label="Send message"
                        >
                            <motion.div
                                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                                transition={
                                    isLoading
                                        ? { duration: 1, repeat: Infinity, ease: "linear" }
                                        : { duration: 0.2 }
                                }
                            >
                                <Send className="h-5 w-5" />
                            </motion.div>
                        </Button>
                    </motion.div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center hidden md:block">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
