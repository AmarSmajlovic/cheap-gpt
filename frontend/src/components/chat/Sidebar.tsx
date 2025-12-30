"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Trash2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onClearHistory: () => Promise<void>;
    isLoading?: boolean;
}

/**
 * Sidebar component displays chat history and clear history option.
 * Requirements: 3.2 - Display list of recent conversations
 * Requirements: 3.3 - Clear history button with confirmation
 * Requirements: 5.4 - Animated open/close with smooth transition
 * Requirements: 7.2 - Collapsible via hamburger menu on mobile
 */
export function Sidebar({
    isOpen,
    onClose,
    messages,
    onClearHistory,
    isLoading = false,
}: SidebarProps) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Group messages into conversation pairs (user + assistant)
    const conversations = getConversationPreviews(messages);

    const handleClearHistory = async () => {
        setIsClearing(true);
        try {
            await onClearHistory();
            setShowConfirmation(false);
        } finally {
            setIsClearing(false);
        }
    };

    // On desktop, render without animation wrapper when open
    if (!isMobile && isOpen) {
        return (
            <aside
                className={cn(
                    "h-full w-[280px] shrink-0",
                    "bg-sidebar border-r border-sidebar-border",
                    "flex flex-col"
                )}
            >
                <SidebarContent
                    conversations={conversations}
                    isLoading={isLoading}
                    showConfirmation={showConfirmation}
                    setShowConfirmation={setShowConfirmation}
                    isClearing={isClearing}
                    handleClearHistory={handleClearHistory}
                    onClose={onClose}
                    showCloseButton={false}
                />
            </aside>
        );
    }

    // Mobile or closed state - use animations
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Mobile overlay backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Sidebar panel */}
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed left-0 top-0 h-full w-[280px] z-50",
                            "bg-sidebar border-r border-sidebar-border",
                            "flex flex-col"
                        )}
                    >
                        <SidebarContent
                            conversations={conversations}
                            isLoading={isLoading}
                            showConfirmation={showConfirmation}
                            setShowConfirmation={setShowConfirmation}
                            isClearing={isClearing}
                            handleClearHistory={handleClearHistory}
                            onClose={onClose}
                            showCloseButton={true}
                        />
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

interface ConversationPreview {
    id: string;
    preview: string;
    timestamp: Date;
}

/**
 * Extract conversation previews from messages
 */
function getConversationPreviews(messages: Message[]): ConversationPreview[] {
    const previews: ConversationPreview[] = [];

    // Get unique user messages as conversation starters
    for (const message of messages) {
        if (message.role === 'user') {
            previews.push({
                id: message.id,
                preview: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
                timestamp: message.timestamp,
            });
        }
    }

    // Return in reverse order (newest first)
    return previews.reverse();
}

interface ConversationItemProps {
    preview: string;
    timestamp: Date;
}

function ConversationItem({ preview, timestamp }: ConversationItemProps) {
    const formattedTime = formatTimestamp(timestamp);

    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
                "w-full text-left p-3 rounded-lg",
                "bg-sidebar-accent/50 hover:bg-sidebar-accent",
                "transition-colors duration-150"
            )}
        >
            <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-sidebar-foreground truncate">
                        {preview}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {formattedTime}
                    </p>
                </div>
            </div>
        </motion.button>
    );
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
}

interface SidebarContentProps {
    conversations: ConversationPreview[];
    isLoading: boolean;
    showConfirmation: boolean;
    setShowConfirmation: (show: boolean) => void;
    isClearing: boolean;
    handleClearHistory: () => Promise<void>;
    onClose: () => void;
    showCloseButton: boolean;
}

function SidebarContent({
    conversations,
    isLoading,
    showConfirmation,
    setShowConfirmation,
    isClearing,
    handleClearHistory,
    onClose,
    showCloseButton,
}: SidebarContentProps) {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <h2 className="text-lg font-semibold text-sidebar-foreground">
                    Chat History
                </h2>
                {showCloseButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                        aria-label="Close sidebar"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Chat history list */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-pulse text-muted-foreground text-sm">
                                Loading history...
                            </div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No conversations yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Start chatting to see history
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {conversations.map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    preview={conv.preview}
                                    timestamp={conv.timestamp}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Clear history section */}
            <div className="p-4 border-t border-sidebar-border">
                <AnimatePresence mode="wait">
                    {showConfirmation ? (
                        <motion.div
                            key="confirmation"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Clear all history?
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleClearHistory}
                                    disabled={isClearing}
                                    className="flex-1"
                                >
                                    {isClearing ? "Clearing..." : "Yes, clear"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowConfirmation(false)}
                                    disabled={isClearing}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="button"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <Button
                                variant="ghost"
                                onClick={() => setShowConfirmation(true)}
                                disabled={conversations.length === 0}
                                className={cn(
                                    "w-full justify-start gap-2",
                                    "text-muted-foreground hover:text-destructive",
                                    "hover:bg-destructive/10"
                                )}
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear History
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
