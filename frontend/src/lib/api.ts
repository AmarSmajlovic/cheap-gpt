/**
 * API Client for CheapGPT Backend
 * Requirements: 1.1, 3.1, 3.3, 6.1, 6.4
 */

import type { ChatResponse, HistoryItem, ModelsResponse } from '@/types';

//test
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public isTimeout: boolean = false
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchWithTimeout<T>(
    url: string,
    options: RequestInit = {},
    timeout: number = DEFAULT_TIMEOUT
): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        if (!response.ok) {
            let errorMessage = `Request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch {
                // Use default error message if parsing fails
            }
            throw new ApiError(errorMessage, response.status);
        }

        return response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApiError('Request timed out. Please try again.', undefined, true);
            }
            if (error.message.includes('fetch')) {
                throw new ApiError('Unable to connect to server. Please check your connection.');
            }
            throw new ApiError(error.message);
        }
        throw new ApiError('An unexpected error occurred');
    } finally {
        clearTimeout(timeoutId);
    }
}

export const chatApi = {
    /**
     * Send a message to the chat endpoint
     * Requirements: 1.1
     */
    sendMessage: async (message: string, model: string = 'auto'): Promise<ChatResponse> => {
        return fetchWithTimeout<ChatResponse>(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, model }),
        });
    },

    /**
     * Get available models from the backend
     */
    getModels: async (): Promise<ModelsResponse> => {
        return fetchWithTimeout<ModelsResponse>(`${API_BASE}/models`);
    },

    /**
     * Get chat history from the backend
     * Requirements: 3.1
     */
    getHistory: async (limit: number = 20): Promise<HistoryItem[]> => {
        return fetchWithTimeout<HistoryItem[]>(`${API_BASE}/history?limit=${limit}`);
    },

    /**
     * Clear all chat history
     * Requirements: 3.3
     */
    clearHistory: async (): Promise<void> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

        try {
            const response = await fetch(`${API_BASE}/history`, {
                method: 'DELETE',
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new ApiError('Failed to clear history', response.status);
            }
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new ApiError('Request timed out. Please try again.', undefined, true);
                }
                throw new ApiError(error.message);
            }
            throw new ApiError('An unexpected error occurred');
        } finally {
            clearTimeout(timeoutId);
        }
    },
};

export default chatApi;
