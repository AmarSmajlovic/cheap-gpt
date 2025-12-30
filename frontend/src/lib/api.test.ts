/**
 * Property-Based Tests for API Error Handling
 * Feature: cheapgpt-frontend, Property 5: Error State on API Failure
 * Validates: Requirements 3.4, 6.1, 6.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { chatApi, ApiError } from './api';

// Mock fetch globally
const originalFetch = global.fetch;

describe('Property 5: Error State on API Failure', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    /**
     * Property: For any non-2xx HTTP status code, the API should throw an ApiError
     * with a non-null error message and the correct status code.
     */
    it('should throw ApiError with non-null message for any non-2xx status code', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate HTTP error status codes (4xx and 5xx)
                fc.integer({ min: 400, max: 599 }),
                fc.string({ minLength: 1, maxLength: 100 }),
                async (statusCode, message) => {
                    // Mock fetch to return error response
                    global.fetch = vi.fn().mockResolvedValue({
                        ok: false,
                        status: statusCode,
                        json: () => Promise.resolve({ detail: message }),
                    });

                    try {
                        await chatApi.sendMessage('test message');
                        // Should not reach here
                        expect.fail('Expected ApiError to be thrown');
                    } catch (error) {
                        // Verify error is ApiError with non-null message
                        expect(error).toBeInstanceOf(ApiError);
                        expect((error as ApiError).message).toBeTruthy();
                        expect((error as ApiError).message.length).toBeGreaterThan(0);
                        expect((error as ApiError).statusCode).toBe(statusCode);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: For any network failure, the API should throw an ApiError
     * with a user-friendly connection error message.
     */
    it('should throw ApiError with connection message for network failures', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate various network error messages
                fc.constantFrom(
                    'Failed to fetch',
                    'fetch failed',
                    'NetworkError when attempting to fetch resource'
                ),
                async (errorMessage) => {
                    // Mock fetch to throw network error
                    global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage));

                    try {
                        await chatApi.sendMessage('test message');
                        expect.fail('Expected ApiError to be thrown');
                    } catch (error) {
                        // Verify error is ApiError with non-null message
                        expect(error).toBeInstanceOf(ApiError);
                        expect((error as ApiError).message).toBeTruthy();
                        expect((error as ApiError).message.length).toBeGreaterThan(0);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: For any API method (sendMessage, getHistory, clearHistory),
     * a non-2xx response should result in an ApiError with non-null message.
     */
    it('should throw ApiError for all API methods on failure', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate API method to test
                fc.constantFrom('sendMessage', 'getHistory', 'clearHistory'),
                // Generate HTTP error status codes
                fc.integer({ min: 400, max: 599 }),
                async (method, statusCode) => {
                    // Mock fetch to return error response
                    global.fetch = vi.fn().mockResolvedValue({
                        ok: false,
                        status: statusCode,
                        json: () => Promise.resolve({ detail: 'Error occurred' }),
                    });

                    try {
                        if (method === 'sendMessage') {
                            await chatApi.sendMessage('test');
                        } else if (method === 'getHistory') {
                            await chatApi.getHistory();
                        } else {
                            await chatApi.clearHistory();
                        }
                        expect.fail('Expected ApiError to be thrown');
                    } catch (error) {
                        // Verify error is ApiError with non-null message
                        expect(error).toBeInstanceOf(ApiError);
                        expect((error as ApiError).message).toBeTruthy();
                        expect((error as ApiError).message.length).toBeGreaterThan(0);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Timeout errors should be properly identified with isTimeout flag.
     */
    it('should set isTimeout flag for abort errors', async () => {
        // Mock fetch to throw AbortError (simulating timeout)
        const abortError = new Error('The operation was aborted');
        abortError.name = 'AbortError';
        global.fetch = vi.fn().mockRejectedValue(abortError);

        try {
            await chatApi.sendMessage('test message');
            expect.fail('Expected ApiError to be thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).message).toBeTruthy();
            expect((error as ApiError).isTimeout).toBe(true);
        }
    });
});
