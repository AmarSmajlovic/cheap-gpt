/**
 * Zustand Chat Store for CheapGPT Frontend
 * Requirements: 1.1, 1.2, 3.1, 3.3
 */

import { create } from 'zustand';
import type { ChatStore, Message } from '@/types';
import { chatApi, ApiError } from '@/lib/api';

/**
 * Generate a unique ID for messages
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate that a message is not empty or whitespace-only
 */
function isValidMessage(content: string): boolean {
    return content.trim().length > 0;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    // Initial state
    messages: [],
    isLoading: false,
    error: null,
    sidebarOpen: true,
    failedMessage: null,
    selectedModel: 'auto',
    availableModels: [],

    /**
     * Load available models from backend
     */
    loadModels: async () => {
        try {
            const response = await chatApi.getModels();
            set({
                availableModels: response.models,
                selectedModel: response.default,
            });
        } catch (error) {
            console.error('Failed to load models:', error);
            // Set default models if API fails
            set({
                availableModels: [
                    { id: 'auto', name: 'Auto', description: 'Automatic selection', available: true }
                ],
                selectedModel: 'auto',
            });
        }
    },

    /**
     * Set selected model
     */
    setSelectedModel: (modelId: string) => {
        set({ selectedModel: modelId });
    },

    /**
     * Send a message to the AI
     * Requirements: 1.1, 1.2, 6.3 (preserve message on error)
     */
    sendMessage: async (content: string) => {
        // Validate message - reject empty/whitespace
        if (!isValidMessage(content)) {
            return;
        }

        const trimmedContent = content.trim();
        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content: trimmedContent,
            timestamp: new Date(),
        };

        // Add user message and set loading state
        // Clear any previous failed message since we're sending a new one
        set((state) => ({
            messages: [...state.messages, userMessage],
            isLoading: true,
            error: null,
            failedMessage: null,
        }));

        try {
            const { selectedModel } = get();
            const response = await chatApi.sendMessage(trimmedContent, selectedModel);

            const assistantMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: response.ai_response,
                timestamp: new Date(response.timestamp),
                modelUsed: response.model_used,
            };

            // Add assistant message
            set((state) => ({
                messages: [...state.messages, assistantMessage],
                isLoading: false,
            }));
        } catch (error) {
            const errorMessage = error instanceof ApiError
                ? error.message
                : 'Failed to send message. Please try again.';

            // Remove the user message that failed and preserve it for retry
            set((state) => ({
                messages: state.messages.filter(m => m.id !== userMessage.id),
                isLoading: false,
                error: errorMessage,
                failedMessage: trimmedContent,
            }));
        }
    },

    /**
     * Load chat history from the backend
     * Requirements: 3.1
     */
    loadHistory: async () => {
        set({ isLoading: true, error: null });

        try {
            const history = await chatApi.getHistory();

            // Convert history items to messages
            const messages: Message[] = [];
            for (const item of history) {
                // Add user message
                messages.push({
                    id: `history-user-${item.id}`,
                    role: 'user',
                    content: item.user_message,
                    timestamp: new Date(item.timestamp),
                });
                // Add assistant message
                messages.push({
                    id: `history-assistant-${item.id}`,
                    role: 'assistant',
                    content: item.ai_response,
                    timestamp: new Date(item.timestamp),
                });
            }

            set({
                messages,
                isLoading: false,
            });
        } catch (error) {
            const errorMessage = error instanceof ApiError
                ? error.message
                : 'Failed to load history. Please try again.';

            set({
                isLoading: false,
                error: errorMessage,
            });
        }
    },

    /**
     * Clear all chat history
     * Requirements: 3.3
     */
    clearHistory: async () => {
        set({ isLoading: true, error: null });

        try {
            await chatApi.clearHistory();

            set({
                messages: [],
                isLoading: false,
            });
        } catch (error) {
            const errorMessage = error instanceof ApiError
                ? error.message
                : 'Failed to clear history. Please try again.';

            set({
                isLoading: false,
                error: errorMessage,
            });
        }
    },

    /**
     * Toggle sidebar visibility
     */
    toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    },

    /**
     * Clear error state
     */
    clearError: () => {
        set({ error: null });
    },

    /**
     * Retry sending the failed message
     * Requirements: 6.3
     */
    retryFailedMessage: async () => {
        const { failedMessage, sendMessage } = get();
        if (failedMessage) {
            // Clear the failed message first, then send
            set({ failedMessage: null, error: null });
            await sendMessage(failedMessage);
        }
    },

    /**
     * Clear the failed message without retrying
     */
    clearFailedMessage: () => {
        set({ failedMessage: null });
    },
}));

export default useChatStore;
