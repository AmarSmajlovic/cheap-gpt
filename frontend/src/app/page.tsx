import { ChatContainer } from "@/components/chat";

/**
 * Main chat page for CheapGPT
 * 
 * This page serves as the entry point for the chat application.
 * It renders the ChatContainer which:
 * - Wires all components together (MessageList, InputArea, ModelSelector, Sidebar)
 * - Loads chat history on mount
 * - Handles initial loading state
 * - Manages responsive layout for mobile and desktop
 * 
 * Requirements: 3.1 - Load history on application load
 * Requirements: 7.1 - Adapt layout for screens smaller than 768px
 * Requirements: 7.2 - Collapsible sidebar via hamburger menu on mobile
 * Requirements: 7.3 - Input area fixed at bottom on all viewport sizes
 * Requirements: 7.4 - Message bubble width adjusts based on viewport
 */
export default function Home() {
  return <ChatContainer />;
}
