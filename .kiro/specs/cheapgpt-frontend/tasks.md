# Implementation Plan: CheapGPT Frontend

## Overview

Implementacija Next.js 14 frontend aplikacije za CheapGPT sa shadcn/ui komponentama, Framer Motion animacijama i Zustand state managementom.

## Tasks

- [x] 1. Project Setup and Configuration
  - [x] 1.1 Initialize Next.js 14 project with TypeScript in frontend folder
    - Use `npx create-next-app@latest` with App Router
    - Configure TypeScript strict mode
    - _Requirements: 5.1, 7.1_
  - [x] 1.2 Install and configure dependencies
    - Install shadcn/ui, Tailwind CSS, Framer Motion, Zustand
    - Install react-markdown, rehype-highlight for markdown rendering
    - Install fast-check for property testing
    - _Requirements: 5.1, 2.2_
  - [x] 1.3 Configure shadcn/ui with dark theme
    - Run shadcn init with dark theme
    - Add required components: Button, Input, Textarea, Toast, Tooltip, ScrollArea
    - _Requirements: 5.1_
  - [x] 1.4 Set up environment variables
    - Create .env.local with NEXT_PUBLIC_API_URL
    - _Requirements: 1.1_

- [x] 2. Core Types and API Layer
  - [x] 2.1 Create TypeScript interfaces
    - Define Message, ChatState, ChatActions, ChatResponse, HistoryItem, ModelOption
    - _Requirements: 1.1, 2.3, 3.1_
  - [x] 2.2 Implement API client
    - Create chatApi with sendMessage, getHistory, clearHistory functions
    - Implement error handling and timeout with AbortController
    - _Requirements: 1.1, 3.1, 3.3, 6.1, 6.4_
  - [x] 2.3 Write property test for API error handling
    - **Property 5: Error State on API Failure**
    - **Validates: Requirements 3.4, 6.1, 6.2**

- [x] 3. State Management
  - [x] 3.1 Implement Zustand chat store
    - Create useChatStore with messages, isLoading, error, sidebarOpen state
    - Implement sendMessage, loadHistory, clearHistory, toggleSidebar actions
    - _Requirements: 1.1, 1.2, 3.1, 3.3_
  - [x] 3.2 Write property test for message send flow
    - **Property 1: Message Send Flow Integrity**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  - [x] 3.3 Write property test for empty message rejection
    - **Property 2: Empty Message Rejection**
    - **Validates: Requirements 1.4**
  - [x] 3.4 Write property test for message ordering
    - **Property 3: Message Chronological Order Invariant**
    - **Validates: Requirements 1.5**

- [x] 4. Checkpoint - Core Logic Complete
  - Ensure all property tests pass
  - Verify API client works with backend
  - Ask user if questions arise

- [x] 5. UI Components - Message Display
  - [x] 5.1 Create MessageBubble component
    - Different styling for user/assistant messages
    - Framer Motion fade-in and slide-up animation
    - Timestamp display
    - _Requirements: 2.1, 2.3, 5.2_
  - [x] 5.2 Create MarkdownRenderer component
    - Use react-markdown with rehype-highlight
    - Style code blocks with dark theme
    - _Requirements: 2.2_
  - [x] 5.3 Create TypingIndicator component
    - Animated dots for loading state
    - _Requirements: 2.4_
  - [x] 5.4 Create MessageList component
    - Render messages with auto-scroll to bottom
    - Use shadcn ScrollArea
    - _Requirements: 1.5, 1.6_
  - [x] 5.5 Write unit tests for MessageBubble
    - Test user vs assistant rendering
    - Test timestamp display
    - _Requirements: 2.1, 2.3_

- [x] 6. UI Components - Input and Controls
  - [x] 6.1 Create InputArea component
    - Auto-resizing textarea
    - Send on Enter, Shift+Enter for newline
    - Disabled state during loading
    - Send button with animation
    - _Requirements: 1.1, 1.4, 5.3_
  - [x] 6.2 Create ModelSelector component
    - Display current model (Llama 3.1 70B)
    - Dropdown with "Coming Soon" options
    - Tooltip for disabled models
    - Fixed position at bottom
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 6.3 Write unit tests for InputArea
    - Test empty message prevention
    - Test Enter key behavior
    - _Requirements: 1.4_

- [x] 7. UI Components - Sidebar and Layout
  - [x] 7.1 Create Sidebar component
    - Chat history list
    - Clear history button with confirmation
    - Animated open/close
    - _Requirements: 3.2, 3.3, 5.4_
  - [x] 7.2 Create ChatContainer component
    - Main layout wrapper
    - Coordinate MessageList, InputArea, ModelSelector
    - _Requirements: 1.5, 1.6_
  - [x] 7.3 Create responsive layout
    - Mobile hamburger menu for sidebar
    - Adapt layout for < 768px
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [x] 7.4 Write property test for history rendering
    - **Property 4: History Rendering Completeness**
    - **Validates: Requirements 3.2**

- [x] 8. Error Handling UI
  - [x] 8.1 Implement Toast notifications
    - Use shadcn Toast for error display
    - Auto-dismiss after 5 seconds
    - _Requirements: 6.2_
  - [x] 8.2 Implement error recovery UI
    - Retry button for failed operations
    - Preserve message on send error
    - _Requirements: 6.3_
  - [x] 8.3 Write property test for message preservation
    - **Property 6: Message Preservation on Send Error**
    - **Validates: Requirements 6.3**

- [x] 9. Main Page Assembly
  - [x] 9.1 Create main chat page
    - Wire all components together
    - Load history on mount
    - Handle initial loading state
    - _Requirements: 3.1_
  - [x] 9.2 Add global styles and theme
    - Dark theme configuration
    - Custom scrollbar styling
    - _Requirements: 5.1_

- [x] 10. Final Checkpoint
  - Ensure all tests pass
  - Verify full chat flow works
  - Test responsive layout
  - Ask user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check library with minimum 100 iterations
- Checkpoints ensure incremental validation
