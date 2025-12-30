"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useChatStore } from "@/store/chat-store";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";
import { ModelSelector } from "./ModelSelector";
import { Sidebar } from "./Sidebar";
import { TypingIndicator } from "./TypingIndicator";
import { ErrorToast } from "./ErrorToast";
import { ErrorRecoveryBanner } from "./ErrorRecoveryBanner";
import { cn } from "@/lib/utils";

/**
 * ChatContainer is the main layout wrapper that coordinates all chat components.
 * Requirements: 1.5 - Display messages in chronological order with newest at bottom
 * Requirements: 1.6 - Auto-scroll to the latest message when new messages are added
 * Requirements: 7.1 - Adapt layout for screens smaller than 768px
 * Requirements: 7.2 - Collapsible sidebar via hamburger menu on mobile
 * Requirements: 7.3 - Input area fixed at bottom on all viewport sizes
 */
export function ChatContainer() {
    const {
        messages,
        isLoading,
        error,
        sidebarOpen,
        failedMessage,
        toggleSidebar,
        sendMessage,
        loadHistory,
        clearHistory,
        clearError,
        clearFailedMessage,
        retryFailedMessage,
    } = useChatStore();

    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile viewport (< 768px)
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar on mobile when viewport changes to mobile
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            // Auto-close sidebar when switching to mobile view
            // This prevents the sidebar from blocking the main content
        }
    }, [isMobile, sidebarOpen]);

    // Load history on mount
    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    return (
        <TooltipProvider>
            {/* Error toast notifications */}
            <ErrorToast />

            <div className="flex h-screen h-[100dvh] bg-background overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={toggleSidebar}
                    messages={messages}
                    onClearHistory={clearHistory}
                    isLoading={isLoading && messages.length === 0}
                />

                {/* Main chat area */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Header with hamburger menu */}
                    <header className="flex items-center gap-3 p-3 md:p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className={cn(
                                "h-9 w-9 shrink-0 transition-colors",
                                // Always show on mobile, hide on desktop when sidebar is open
                                !isMobile && sidebarOpen && "hidden"
                            )}
                            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                            aria-expanded={sidebarOpen}
                        >
                            {isMobile && sidebarOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-lg md:text-xl font-semibold truncate"
                        >
                            CheapGPT
                        </motion.h1>
                    </header>

                    {/* Error recovery banner for failed messages */}
                    <ErrorRecoveryBanner
                        error={error}
                        failedMessage={failedMessage}
                        isRetrying={isLoading}
                        onRetry={retryFailedMessage}
                        onDismiss={() => {
                            clearError();
                            clearFailedMessage();
                        }}
                    />

                    {/* Messages area - flex-1 to take remaining space */}
                    <div className="flex-1 overflow-hidden relative min-h-0">
                        <MessageList messages={messages} />

                        {/* Typing indicator overlay */}
                        {isLoading && messages.length > 0 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="bg-card border border-border rounded-full px-4 py-2 shadow-lg"
                                >
                                    <TypingIndicator />
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Input area and model selector - fixed at bottom */}
                    <div className="shrink-0 bg-background border-t border-border md:border-t-0">
                        <InputArea
                            onSend={sendMessage}
                            isLoading={isLoading}
                            placeholder="Message CheapGPT..."
                            failedMessage={failedMessage}
                            onFailedMessageConsumed={clearFailedMessage}
                        />

                        {/* Model selector at bottom */}
                        <div className="flex justify-center pb-2 pb-safe bg-background">
                            <ModelSelector />
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
