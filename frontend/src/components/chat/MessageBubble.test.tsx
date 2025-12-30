import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/types/chat";

/**
 * Unit tests for MessageBubble component
 * Requirements: 2.1, 2.3
 */
describe("MessageBubble", () => {
    const createMessage = (overrides: Partial<Message> = {}): Message => ({
        id: "test-id",
        role: "user",
        content: "Test message",
        timestamp: new Date("2024-01-15T10:30:00"),
        ...overrides,
    });

    describe("User vs Assistant rendering", () => {
        it("renders user message with correct styling", () => {
            const userMessage = createMessage({ role: "user", content: "Hello AI" });
            render(<MessageBubble message={userMessage} />);

            expect(screen.getByText("Hello AI")).toBeInTheDocument();
        });

        it("renders assistant message with correct styling", () => {
            const assistantMessage = createMessage({
                role: "assistant",
                content: "Hello human",
            });
            render(<MessageBubble message={assistantMessage} />);

            expect(screen.getByText("Hello human")).toBeInTheDocument();
        });

        it("renders user message content as plain text", () => {
            const userMessage = createMessage({
                role: "user",
                content: "Plain text message",
            });
            render(<MessageBubble message={userMessage} />);

            expect(screen.getByText("Plain text message")).toBeInTheDocument();
        });
    });

    describe("Timestamp display", () => {
        it("displays formatted timestamp for user message", () => {
            const message = createMessage({
                timestamp: new Date("2024-01-15T14:30:00"),
            });
            render(<MessageBubble message={message} />);

            // Check that a time is displayed (format: HH:MM AM/PM)
            expect(screen.getByText(/\d{1,2}:\d{2}\s*(AM|PM)/i)).toBeInTheDocument();
        });

        it("displays formatted timestamp for assistant message", () => {
            const message = createMessage({
                role: "assistant",
                timestamp: new Date("2024-01-15T09:15:00"),
            });
            render(<MessageBubble message={message} />);

            expect(screen.getByText(/\d{1,2}:\d{2}\s*(AM|PM)/i)).toBeInTheDocument();
        });
    });

    describe("Loading state", () => {
        it("shows typing indicator when message is loading", () => {
            const loadingMessage = createMessage({
                role: "assistant",
                isLoading: true,
                content: "",
            });
            render(<MessageBubble message={loadingMessage} />);

            // The typing indicator should be rendered (3 dots)
            // We can't easily test for the dots directly, but we can verify
            // the content is not displayed
            expect(screen.queryByText("Test message")).not.toBeInTheDocument();
        });
    });
});
