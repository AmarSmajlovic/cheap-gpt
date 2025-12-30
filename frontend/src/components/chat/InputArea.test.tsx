import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InputArea } from "./InputArea";

/**
 * Unit tests for InputArea component
 * Requirements: 1.4 - Empty message prevention
 * Requirements: 1.1 - Enter key behavior
 */
describe("InputArea", () => {
    describe("Empty message prevention", () => {
        it("does not call onSend when message is empty", () => {
            const onSend = vi.fn();
            render(<InputArea onSend={onSend} />);

            const sendButton = screen.getByRole("button", { name: /send message/i });
            fireEvent.click(sendButton);

            expect(onSend).not.toHaveBeenCalled();
        });

        it("does not call onSend when message is only whitespace", () => {
            const onSend = vi.fn();
            render(<InputArea onSend={onSend} />);

            const textarea = screen.getByRole("textbox", { name: /message input/i });
            fireEvent.change(textarea, { target: { value: "   " } });

            const sendButton = screen.getByRole("button", { name: /send message/i });
            fireEvent.click(sendButton);

            expect(onSend).not.toHaveBeenCalled();
        });

        it("send button is disabled when message is empty", () => {
            const onSend = vi.fn();
            render(<InputArea onSend={onSend} />);

            const sendButton = screen.getByRole("button", { name: /send message/i });
            expect(sendButton).toBeDisabled();
        });
    });

    describe("Enter key behavior", () => {
        it("sends message on Enter key press", () => {
            const onSend = vi.fn();
            render(<InputArea onSend={onSend} />);

            const textarea = screen.getByRole("textbox", { name: /message input/i });
            fireEvent.change(textarea, { target: { value: "Hello AI" } });
            fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

            expect(onSend).toHaveBeenCalledWith("Hello AI");
        });

        it("does not send message on Shift+Enter (allows newline)", () => {
            const onSend = vi.fn();
            render(<InputArea onSend={onSend} />);

            const textarea = screen.getByRole("textbox", { name: /message input/i });
            fireEvent.change(textarea, { target: { value: "Hello" } });
            fireEvent.keyDown(textarea, { key: "Enter", code: "Enter", shiftKey: true });

            expect(onSend).not.toHaveBeenCalled();
        });

        it("clears input after sending message", () => {
            const onSend = vi.fn();
            render(<InputArea onSend={onSend} />);

            const textarea = screen.getByRole("textbox", { name: /message input/i });
            fireEvent.change(textarea, { target: { value: "Test message" } });
            fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

            expect(textarea).toHaveValue("");
        });
    });

    describe("Loading state", () => {
        it("disables textarea when loading", () => {
            const onSend = vi.fn();
            render(<InputArea onSend={onSend} isLoading={true} />);

            const textarea = screen.getByRole("textbox", { name: /message input/i });
            expect(textarea).toBeDisabled();
        });

        it("disables send button when loading", () => {
            const onSend = vi.fn();
            render(<InputArea onSend={onSend} isLoading={true} />);

            const sendButton = screen.getByRole("button", { name: /send message/i });
            expect(sendButton).toBeDisabled();
        });
    });
});
