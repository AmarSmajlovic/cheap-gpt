# Requirements Document

## Introduction

CheapGPT Frontend je moderna web aplikacija koja služi kao korisničko sučelje za CheapGPT chatbot backend. Aplikacija pruža ChatGPT-sličan UX sa smooth animacijama, tamnom temom i pripremljenim UI za buduću podršku više AI modela.

## Glossary

- **Chat_Interface**: Glavna komponenta za prikaz i slanje poruka
- **Message_Bubble**: Komponenta koja prikazuje pojedinačnu poruku (korisničku ili AI)
- **Model_Selector**: UI komponenta za odabir AI modela (inicijalno disabled sa "Coming Soon" oznakom)
- **Chat_History**: Lista prethodnih poruka dohvaćenih iz backend API-ja
- **Sidebar**: Bočna navigacija sa chat historijom i opcijama
- **Input_Area**: Područje za unos teksta i slanje poruka

## Requirements

### Requirement 1: Chat Interface

**User Story:** As a user, I want to send messages and receive AI responses, so that I can have conversations with the AI.

#### Acceptance Criteria

1. WHEN a user types a message and presses Enter or clicks send button, THE Chat_Interface SHALL send the message to the backend `/chat` endpoint
2. WHEN a message is sent, THE Chat_Interface SHALL display a loading indicator while waiting for response
3. WHEN an AI response is received, THE Chat_Interface SHALL display the response in a Message_Bubble with typing animation
4. WHEN a user attempts to send an empty message, THE Chat_Interface SHALL prevent submission and maintain current state
5. THE Chat_Interface SHALL display messages in chronological order with newest at bottom
6. WHEN a new message is added, THE Chat_Interface SHALL auto-scroll to the latest message

### Requirement 2: Message Display

**User Story:** As a user, I want to see messages clearly formatted, so that I can easily read the conversation.

#### Acceptance Criteria

1. THE Message_Bubble SHALL visually distinguish between user messages and AI responses using different colors/alignment
2. WHEN displaying AI responses, THE Message_Bubble SHALL render markdown content properly (code blocks, lists, bold, etc.)
3. THE Message_Bubble SHALL display timestamp for each message
4. WHEN an AI response is being generated, THE Message_Bubble SHALL show animated typing indicator

### Requirement 3: Chat History

**User Story:** As a user, I want to see my previous conversations, so that I can reference past interactions.

#### Acceptance Criteria

1. WHEN the application loads, THE Chat_History SHALL fetch previous messages from `/history` endpoint
2. THE Sidebar SHALL display a list of recent conversations
3. WHEN a user clicks "Clear History", THE Chat_History SHALL call `/history` DELETE endpoint and clear the display
4. IF the history fetch fails, THEN THE Chat_Interface SHALL display an error message and allow retry

### Requirement 4: Model Selector

**User Story:** As a user, I want to see available AI models, so that I can choose which model to use in the future.

#### Acceptance Criteria

1. THE Model_Selector SHALL display current model name (Llama 3.1 70B)
2. THE Model_Selector SHALL show a dropdown with model options marked as "Coming Soon"
3. WHEN a user clicks on a "Coming Soon" model, THE Model_Selector SHALL display a tooltip explaining future availability
4. THE Model_Selector SHALL be positioned at the bottom of the chat interface

### Requirement 5: Visual Design and Animations

**User Story:** As a user, I want a modern and smooth interface, so that the chat experience feels premium.

#### Acceptance Criteria

1. THE Chat_Interface SHALL use a dark theme consistent with modern chat applications
2. WHEN messages appear, THE Message_Bubble SHALL animate with fade-in and slide-up effect using Framer Motion
3. WHEN the send button is clicked, THE Input_Area SHALL provide visual feedback animation
4. THE Sidebar SHALL animate open/close with smooth transition
5. WHEN hovering over interactive elements, THE Chat_Interface SHALL display subtle hover animations
6. THE Chat_Interface SHALL be fully responsive for mobile and desktop viewports

### Requirement 6: Error Handling

**User Story:** As a user, I want to be informed when something goes wrong, so that I understand the system state.

#### Acceptance Criteria

1. IF the backend is unreachable, THEN THE Chat_Interface SHALL display a connection error message
2. IF an API request fails, THEN THE Chat_Interface SHALL show an error toast notification
3. WHEN an error occurs during message send, THE Chat_Interface SHALL preserve the user's message and allow retry
4. THE Chat_Interface SHALL implement request timeout handling with user feedback

### Requirement 7: Responsive Layout

**User Story:** As a user, I want to use the app on any device, so that I can chat from mobile or desktop.

#### Acceptance Criteria

1. THE Chat_Interface SHALL adapt layout for screens smaller than 768px
2. WHEN on mobile viewport, THE Sidebar SHALL be collapsible via hamburger menu
3. THE Input_Area SHALL remain fixed at the bottom on all viewport sizes
4. THE Message_Bubble SHALL adjust width based on viewport size
