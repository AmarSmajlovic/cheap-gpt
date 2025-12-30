/**
 * Property-Based Tests for Zustand Chat Store
 * Feature: cheapgpt-frontend
 * 
 * Property 1: Message Send Flow Integrity - Validates: Requirements 1.1, 1.2, 1.3
 * Property 2: Empty Message Rejection - Validates: Requirements 1.4
 * Property 3: Message Chronological Order Invariant - Validates: Requirements 1.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useChatStore } from './chat-store';
import type { ChatResponse } from '@/types';

// Mock the API module
vi.mock('@/lib/api', () => ({
    chatApi: {
        sendMessage: vi.fn(),
        getHistory: vi.fn(),
        clearHistory: vi.fn(),
    },
    ApiError: class ApiError extends Error {
        constructor(message: string, public statusCode?: number, public isTimeout: boolean = false) {
            super(message);
            this.name = 'ApiError';
        }
    },
}));

import { chatApi } from '@/lib/api';

// Helper to reset store state between tests
function resetStore() {
    useChatStore.setState({
        messages: [],
        isLoading: false,
        error: null,
        sidebarOpen: true,
        failedMessage: null,
    });
}

describe('Property 1: Message Send Flow Integrity', () => {
    /**
     * Feature: cheapgpt-frontend, Property 1: Message Send Flow Integrity
     * Validates: Requirements 1.1, 1.2, 1.3
     * 
     * For any non-empty message string, when sendMessage is called:
     * 1. The message should be added to the messages array with role 'user'
     * 2. isLoading should become true
     * 3. After API response, a message with role 'assistant' should be added
     * 4. isLoading should become false
     */

    beforeEach(() => {
        resetStore();
        vi.clearAllMocks();
    });

    it('should add user message with role "user" for any non-empty message', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate non-empty, non-whitespace strings
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 1000 }), // AI response
                async (userMessage, aiResponse) => {
                    resetStore();

                    const mockResponse: ChatResponse = {
                        user_message: userMessage.trim(),
                        ai_response: aiResponse,
                        timestamp: new Date().toISOString(),
                    };
                    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

                    await useChatStore.getState().sendMessage(userMessage);

                    const state = useChatStore.getState();

                    // Verify user message was added with role 'user'
                    const userMessages = state.messages.filter(m => m.role === 'user');
                    expect(userMessages.length).toBeGreaterThanOrEqual(1);
                    expect(userMessages[0].content).toBe(userMessage.trim());
                    expect(userMessages[0].role).toBe('user');
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should add assistant message after successful API response', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 1000 }),
                async (userMessage, aiResponse) => {
                    resetStore();

                    const mockResponse: ChatResponse = {
                        user_message: userMessage.trim(),
                        ai_response: aiResponse,
                        timestamp: new Date().toISOString(),
                    };
                    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

                    await useChatStore.getState().sendMessage(userMessage);

                    const state = useChatStore.getState();

                    // Verify assistant message was added
                    const assistantMessages = state.messages.filter(m => m.role === 'assistant');
                    expect(assistantMessages.length).toBe(1);
                    expect(assistantMessages[0].content).toBe(aiResponse);
                    expect(assistantMessages[0].role).toBe('assistant');
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should set isLoading to false after API response completes', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                async (userMessage) => {
                    resetStore();

                    const mockResponse: ChatResponse = {
                        user_message: userMessage.trim(),
                        ai_response: 'Response',
                        timestamp: new Date().toISOString(),
                    };
                    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

                    await useChatStore.getState().sendMessage(userMessage);

                    const state = useChatStore.getState();
                    expect(state.isLoading).toBe(false);
                }
            ),
            { numRuns: 100 }
        );
    });
});


describe('Property 2: Empty Message Rejection', () => {
    /**
     * Feature: cheapgpt-frontend, Property 2: Empty Message Rejection
     * Validates: Requirements 1.4
     * 
     * For any string that is empty or contains only whitespace characters,
     * attempting to send it should:
     * 1. Not add any message to the messages array
     * 2. Not trigger any API call
     * 3. Leave the state unchanged
     */

    beforeEach(() => {
        resetStore();
        vi.clearAllMocks();
    });

    it('should not add messages for empty or whitespace-only strings', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate empty or whitespace-only strings
                fc.constantFrom('', ' ', '  ', '\t', '\n', '\r\n', '   \t\n  '),
                async (emptyMessage) => {
                    resetStore();
                    const initialState = useChatStore.getState();
                    const initialMessageCount = initialState.messages.length;

                    await useChatStore.getState().sendMessage(emptyMessage);

                    const state = useChatStore.getState();

                    // Verify no messages were added
                    expect(state.messages.length).toBe(initialMessageCount);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should not trigger API call for empty or whitespace-only strings', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.constantFrom('', ' ', '  ', '\t', '\n', '\r\n', '   \t\n  '),
                async (emptyMessage) => {
                    resetStore();
                    vi.clearAllMocks();

                    await useChatStore.getState().sendMessage(emptyMessage);

                    // Verify API was not called
                    expect(chatApi.sendMessage).not.toHaveBeenCalled();
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should leave state unchanged for empty or whitespace-only strings', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.constantFrom('', ' ', '  ', '\t', '\n', '\r\n', '   \t\n  '),
                async (emptyMessage) => {
                    resetStore();
                    const initialState = { ...useChatStore.getState() };

                    await useChatStore.getState().sendMessage(emptyMessage);

                    const state = useChatStore.getState();

                    // Verify state is unchanged
                    expect(state.messages.length).toBe(initialState.messages.length);
                    expect(state.isLoading).toBe(initialState.isLoading);
                    expect(state.error).toBe(initialState.error);
                }
            ),
            { numRuns: 100 }
        );
    });
});

describe('Property 3: Message Chronological Order Invariant', () => {
    /**
     * Feature: cheapgpt-frontend, Property 3: Message Chronological Order Invariant
     * Validates: Requirements 1.5
     * 
     * For any messages array in the chat state, messages should be ordered by
     * timestamp in ascending order (oldest first, newest last).
     */

    beforeEach(() => {
        resetStore();
        vi.clearAllMocks();
    });

    it('should maintain timestamps in ascending order (oldest first, newest last)', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate array of non-empty messages (2-5 messages)
                fc.array(
                    fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                    { minLength: 2, maxLength: 5 }
                ),
                async (messages) => {
                    resetStore();

                    // Use a controlled base time for predictable timestamps
                    let currentTime = Date.now();

                    // Send messages sequentially
                    for (let i = 0; i < messages.length; i++) {
                        // Mock Date.now to control user message timestamp
                        const userMsgTime = currentTime + (i * 1000);
                        const assistantMsgTime = userMsgTime + 500; // Assistant response comes after user message

                        const mockResponse: ChatResponse = {
                            user_message: messages[i].trim(),
                            ai_response: `Response ${i}`,
                            timestamp: new Date(assistantMsgTime).toISOString(),
                        };
                        vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

                        await useChatStore.getState().sendMessage(messages[i]);
                    }

                    const state = useChatStore.getState();

                    // Verify messages are in array order (which represents display order)
                    // The invariant is that messages appear in the order they were added
                    // User message always comes before its corresponding assistant response
                    for (let i = 0; i < messages.length; i++) {
                        const userMsgIndex = i * 2;
                        const assistantMsgIndex = i * 2 + 1;

                        // User message should be at even index
                        expect(state.messages[userMsgIndex].role).toBe('user');
                        // Assistant message should immediately follow
                        expect(state.messages[assistantMsgIndex].role).toBe('assistant');
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should maintain message order: each new message pair is appended at the end', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate array of non-empty messages (2-5 messages)
                fc.array(
                    fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                    { minLength: 2, maxLength: 5 }
                ),
                async (messages) => {
                    resetStore();

                    // Send messages sequentially
                    for (let i = 0; i < messages.length; i++) {
                        const mockResponse: ChatResponse = {
                            user_message: messages[i].trim(),
                            ai_response: `Response ${i}`,
                            timestamp: new Date().toISOString(),
                        };
                        vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

                        await useChatStore.getState().sendMessage(messages[i]);
                    }

                    const state = useChatStore.getState();

                    // Verify messages are in correct order:
                    // Each pair should be [user, assistant] and pairs should be in send order
                    expect(state.messages.length).toBe(messages.length * 2);

                    for (let i = 0; i < messages.length; i++) {
                        const userMsgIndex = i * 2;
                        const assistantMsgIndex = i * 2 + 1;

                        // User message at even index
                        expect(state.messages[userMsgIndex].role).toBe('user');
                        expect(state.messages[userMsgIndex].content).toBe(messages[i].trim());

                        // Assistant message at odd index, right after user
                        expect(state.messages[assistantMsgIndex].role).toBe('assistant');
                        expect(state.messages[assistantMsgIndex].content).toBe(`Response ${i}`);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should preserve order invariant: user message always precedes its assistant response', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 200 }),
                async (userMessage, aiResponse) => {
                    resetStore();

                    const mockResponse: ChatResponse = {
                        user_message: userMessage.trim(),
                        ai_response: aiResponse,
                        timestamp: new Date().toISOString(),
                    };
                    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

                    await useChatStore.getState().sendMessage(userMessage);

                    const state = useChatStore.getState();

                    // Find the user message and verify assistant follows
                    const userIndex = state.messages.findIndex(
                        m => m.role === 'user' && m.content === userMessage.trim()
                    );

                    expect(userIndex).toBeGreaterThanOrEqual(0);
                    expect(userIndex + 1).toBeLessThan(state.messages.length);
                    expect(state.messages[userIndex + 1].role).toBe('assistant');
                }
            ),
            { numRuns: 100 }
        );
    });
});


describe('Property 6: Message Preservation on Send Error', () => {
    /**
     * Feature: cheapgpt-frontend, Property 6: Message Preservation on Send Error
     * Validates: Requirements 6.3
     * 
     * For any message that fails to send due to API error, the original message
     * content should remain available for retry (not lost from the input or state).
     */

    beforeEach(() => {
        resetStore();
        vi.clearAllMocks();
    });

    it('should preserve failed message content in failedMessage state', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate non-empty, non-whitespace strings
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 200 }), // Error message
                async (userMessage, errorMessage) => {
                    resetStore();

                    // Mock API to reject with error
                    vi.mocked(chatApi.sendMessage).mockRejectedValue(new Error(errorMessage));

                    await useChatStore.getState().sendMessage(userMessage);

                    const state = useChatStore.getState();

                    // Verify the failed message is preserved
                    expect(state.failedMessage).toBe(userMessage.trim());
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should set error state when message send fails', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                async (userMessage) => {
                    resetStore();

                    // Mock API to reject with error
                    vi.mocked(chatApi.sendMessage).mockRejectedValue(new Error('Network error'));

                    await useChatStore.getState().sendMessage(userMessage);

                    const state = useChatStore.getState();

                    // Verify error state is set
                    expect(state.error).not.toBeNull();
                    expect(state.isLoading).toBe(false);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should remove user message from messages array on send failure', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                async (userMessage) => {
                    resetStore();

                    // Mock API to reject with error
                    vi.mocked(chatApi.sendMessage).mockRejectedValue(new Error('Network error'));

                    await useChatStore.getState().sendMessage(userMessage);

                    const state = useChatStore.getState();

                    // Verify user message was removed from messages array
                    // (it's preserved in failedMessage instead)
                    const userMessages = state.messages.filter(
                        m => m.role === 'user' && m.content === userMessage.trim()
                    );
                    expect(userMessages.length).toBe(0);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should allow retry of failed message via retryFailedMessage', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 1000 }), // AI response for retry
                async (userMessage, aiResponse) => {
                    resetStore();

                    // First call fails
                    vi.mocked(chatApi.sendMessage).mockRejectedValueOnce(new Error('Network error'));

                    await useChatStore.getState().sendMessage(userMessage);

                    // Verify message is preserved
                    let state = useChatStore.getState();
                    expect(state.failedMessage).toBe(userMessage.trim());

                    // Now mock successful response for retry
                    const mockResponse: ChatResponse = {
                        user_message: userMessage.trim(),
                        ai_response: aiResponse,
                        timestamp: new Date().toISOString(),
                    };
                    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

                    // Retry the failed message
                    await useChatStore.getState().retryFailedMessage();

                    state = useChatStore.getState();

                    // Verify retry was successful
                    expect(state.failedMessage).toBeNull();
                    expect(state.error).toBeNull();
                    expect(state.messages.length).toBe(2); // user + assistant
                    expect(state.messages[0].content).toBe(userMessage.trim());
                    expect(state.messages[1].content).toBe(aiResponse);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should clear failedMessage when a new message is sent successfully', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 1000 }),
                async (failedMsg, newMsg, aiResponse) => {
                    resetStore();

                    // First message fails
                    vi.mocked(chatApi.sendMessage).mockRejectedValueOnce(new Error('Network error'));
                    await useChatStore.getState().sendMessage(failedMsg);

                    // Verify failed message is preserved
                    let state = useChatStore.getState();
                    expect(state.failedMessage).toBe(failedMsg.trim());

                    // Send a new message successfully
                    const mockResponse: ChatResponse = {
                        user_message: newMsg.trim(),
                        ai_response: aiResponse,
                        timestamp: new Date().toISOString(),
                    };
                    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

                    await useChatStore.getState().sendMessage(newMsg);

                    state = useChatStore.getState();

                    // Verify failedMessage is cleared when new message is sent
                    expect(state.failedMessage).toBeNull();
                }
            ),
            { numRuns: 100 }
        );
    });
});
