"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { TypingIndicator } from "./TypingIndicator";

interface MessageBubbleProps {
    message: Message;
    isLast?: boolean;
}

/**
 * MessageBubble component displays individual chat messages
 * with different styling for user/assistant messages.
 * Requirements: 2.1, 2.3, 5.2
 * Requirements: 7.4 - Message bubble width adjustment based on viewport
 */
export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const isLoading = message.isLoading;

    const formatTimestamp = (date: Date): string => {
        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
                "flex w-full mb-3 md:mb-4 px-1",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    // Responsive max-width: 85% on mobile, 75% on tablet, 70% on desktop
                    "max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%]",
                    "rounded-2xl px-3 py-2 md:px-4 md:py-3",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card text-card-foreground rounded-bl-sm border border-border"
                )}
            >
                {isLoading ? (
                    <TypingIndicator />
                ) : isUser ? (
                    <p className="whitespace-pre-wrap break-words text-sm md:text-base">{message.content}</p>
                ) : (
                    <MarkdownRenderer content={message.content} />
                )}

                <div
                    className={cn(
                        "text-[10px] md:text-xs mt-1.5 md:mt-2 opacity-60",
                        isUser ? "text-right" : "text-left"
                    )}
                >
                    {formatTimestamp(message.timestamp)}
                </div>
            </div>
        </motion.div>
    );
}
