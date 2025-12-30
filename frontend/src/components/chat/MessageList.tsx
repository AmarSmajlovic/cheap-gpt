"use client";

import { useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
    messages: Message[];
}

/**
 * MessageList component renders messages with auto-scroll to bottom.
 * Requirements: 1.5 - Display messages in chronological order with newest at bottom
 * Requirements: 1.6 - Auto-scroll to the latest message when new messages are added
 * Requirements: 7.1 - Adapt layout for screens smaller than 768px
 */
export function MessageList({ messages }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom function
    const scrollToBottom = useCallback(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        // Small delay to ensure DOM has updated
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, scrollToBottom]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <div className="text-center">
                    <p className="text-base md:text-lg font-medium mb-2">Welcome to CheapGPT</p>
                    <p className="text-xs md:text-sm">Start a conversation by typing a message below.</p>
                </div>
            </div>
        );
    }

    return (
        <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 h-full overflow-hidden"
        >
            <div className="py-3 px-2 md:py-4 md:px-4 max-w-3xl mx-auto">
                {messages.map((message, index) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        isLast={index === messages.length - 1}
                    />
                ))}
                {/* Scroll anchor for auto-scroll to bottom */}
                <div ref={bottomRef} aria-hidden="true" />
            </div>
        </ScrollArea>
    );
}
