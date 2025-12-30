/**
 * Property-Based Tests for Sidebar Component
 * Feature: cheapgpt-frontend
 * 
 * Property 4: History Rendering Completeness - Validates: Requirements 3.2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import type { Message } from '@/types/chat';

// Cleanup after each test to prevent DOM pollution
afterEach(() => {
    cleanup();
});

// Generate pairs of user + assistant messages (simulating real chat flow)
const messagePairArbitrary = fc.tuple(
    fc.string({ minLength: 1, maxLength: 200 }),
    fc.string({ minLength: 1, maxLength: 200 }),
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
    fc.integer({ min: 0, max: 1000000 }),
).map(([userContent, assistantContent, timestamp, index]: [string, string, Date, number]): Message[] => {
    const baseTime = timestamp.getTime();
    return [
        {
            id: `user-${index}-${baseTime}`,
            role: 'user' as const,
            content: userContent,
            timestamp: new Date(baseTime),
            isLoading: false,
        },
        {
            id: `assistant-${index}-${baseTime + 1000}`,
            role: 'assistant' as const,
            content: assistantContent,
            timestamp: new Date(baseTime + 1000),
            isLoading: false,
        },
    ];
});

describe('Property 4: History Rendering Completeness', () => {
    /**
     * Feature: cheapgpt-frontend, Property 4: History Rendering Completeness
     * Validates: Requirements 3.2
     * 
     * For any array of history items returned from the API, the sidebar should
     * render exactly that many items, each containing the user_message content.
     */

    beforeEach(() => {
        cleanup();
    });

    it('should render exactly one conversation item for each user message', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate 1-10 message pairs
                fc.array(messagePairArbitrary, { minLength: 1, maxLength: 10 }),
                async (messagePairs) => {
                    cleanup(); // Clean before each property test iteration

                    // Flatten pairs into messages array
                    const messages: Message[] = messagePairs.flat();
                    const userMessages = messages.filter(m => m.role === 'user');

                    const { container } = render(
                        <Sidebar
                            isOpen={true}
                            onClose={() => { }}
                            messages={messages}
                            onClearHistory={async () => { }}
                            isLoading={false}
                        />
                    );

                    // Count conversation items rendered (buttons with message previews)
                    const conversationItems = container.querySelectorAll('button.w-full.text-left');

                    // Should have exactly as many conversation items as user messages
                    expect(conversationItems.length).toBe(userMessages.length);

                    cleanup(); // Clean after each property test iteration
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display preview text from each user message content', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate 1-5 message pairs with shorter content for easier verification
                fc.array(
                    fc.tuple(
                        fc.string({ minLength: 1, maxLength: 40 }), // Short enough to not be truncated
                        fc.string({ minLength: 1, maxLength: 200 }),
                        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
                        fc.integer({ min: 0, max: 1000000 }),
                    ).map(([userContent, assistantContent, timestamp, index]: [string, string, Date, number]): Message[] => {
                        const baseTime = timestamp.getTime();
                        return [
                            {
                                id: `user-${index}-${baseTime}`,
                                role: 'user' as const,
                                content: userContent,
                                timestamp: new Date(baseTime),
                                isLoading: false,
                            },
                            {
                                id: `assistant-${index}-${baseTime + 1000}`,
                                role: 'assistant' as const,
                                content: assistantContent,
                                timestamp: new Date(baseTime + 1000),
                                isLoading: false,
                            },
                        ];
                    }),
                    { minLength: 1, maxLength: 5 }
                ),
                async (messagePairs) => {
                    cleanup(); // Clean before each property test iteration

                    const messages: Message[] = messagePairs.flat();
                    const userMessages = messages.filter(m => m.role === 'user');

                    const { container } = render(
                        <Sidebar
                            isOpen={true}
                            onClose={() => { }}
                            messages={messages}
                            onClearHistory={async () => { }}
                            isLoading={false}
                        />
                    );

                    // Each user message content should appear in the sidebar
                    // Check that the number of conversation items matches user messages
                    const conversationItems = container.querySelectorAll('button.w-full.text-left');
                    expect(conversationItems.length).toBe(userMessages.length);

                    // Verify each conversation item contains text from a user message
                    const renderedTexts = Array.from(conversationItems).map(
                        item => item.textContent || ''
                    );

                    for (const userMsg of userMessages) {
                        const expectedPreview = userMsg.content.slice(0, 50);
                        const found = renderedTexts.some(text => text.includes(expectedPreview));
                        expect(found).toBe(true);
                    }

                    cleanup(); // Clean after each property test iteration
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should render empty state when no messages exist', () => {
        cleanup();

        render(
            <Sidebar
                isOpen={true}
                onClose={() => { }}
                messages={[]}
                onClearHistory={async () => { }}
                isLoading={false}
            />
        );

        // Should show empty state message
        expect(screen.getByText('No conversations yet')).toBeTruthy();
    });

    it('should render loading state when isLoading is true and no messages', () => {
        cleanup();

        render(
            <Sidebar
                isOpen={true}
                onClose={() => { }}
                messages={[]}
                onClearHistory={async () => { }}
                isLoading={true}
            />
        );

        // Should show loading state
        expect(screen.getByText('Loading history...')).toBeTruthy();
    });
});
