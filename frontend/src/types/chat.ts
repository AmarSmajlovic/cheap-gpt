/**
 * Core TypeScript interfaces for CheapGPT Frontend
 * Requirements: 1.1, 2.3, 3.1
 */

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
    modelUsed?: string;
}

export interface ChatState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    sidebarOpen: boolean;
    /** Message content that failed to send, preserved for retry */
    failedMessage: string | null;
    /** Currently selected model */
    selectedModel: string;
    /** Available models from backend */
    availableModels: ModelOption[];
}

export interface ChatActions {
    sendMessage: (content: string) => Promise<void>;
    loadHistory: () => Promise<void>;
    clearHistory: () => Promise<void>;
    toggleSidebar: () => void;
    clearError: () => void;
    /** Retry sending the failed message */
    retryFailedMessage: () => Promise<void>;
    /** Clear the failed message without retrying */
    clearFailedMessage: () => void;
    /** Set selected model */
    setSelectedModel: (modelId: string) => void;
    /** Load available models from backend */
    loadModels: () => Promise<void>;
}

// API Response types (matching backend)
export interface ChatResponse {
    user_message: string;
    ai_response: string;
    timestamp: string;
    model_used?: string;
}

export interface HistoryItem {
    id: number;
    user_message: string;
    ai_response: string;
    timestamp: string;
}

export interface ModelOption {
    id: string;
    name: string;
    description?: string;
    best_for?: string;
    available: boolean;
}

export interface ModelsResponse {
    default: string;
    models: ModelOption[];
}

// Combined store type
export type ChatStore = ChatState & ChatActions;
