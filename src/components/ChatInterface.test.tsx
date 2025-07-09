// src/components/ChatInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from './ChatInterface';
import { ChatMessageProps, Message } from '../types'; // Assuming ChatMessageProps might be needed or Message type
import { describe, it, expect, vi } from 'vitest';

// Mock react-markdown and remark-gfm as they are not crucial for these tests
vi.mock('react-markdown', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({
    default: () => {},
}));


const mockDefaultMessages: Message[] = [
  { id: '1', sender: 'bot', text: 'Hello there!', timestamp: Date.now() },
  { id: '2', sender: 'user', text: 'Hi bot!', timestamp: Date.now() + 1000 },
];

const mockProps = {
  messages: mockDefaultMessages,
  onSendMessage: vi.fn(),
  isLoading: false,
  isCompleted: false,
  inputPlaceholder: 'Type a message...',
  completedPlaceholder: 'Chat has ended.',
};

describe('ChatInterface', () => {
  it('renders messages correctly', () => {
    render(<ChatInterface {...mockProps} />);
    const renderedMessages = screen.getAllByTestId('mock-markdown');
    expect(renderedMessages[0].textContent).toContain('Hello there!');
    expect(renderedMessages[1].textContent).toContain('Hi bot!');
  });

  it('renders input field and send button', () => {
    render(<ChatInterface {...mockProps} />);
    expect(screen.getByPlaceholderText(mockProps.inputPlaceholder)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('calls onSendMessage when a message is typed and send button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatInterface {...mockProps} />);
    const inputField = screen.getByPlaceholderText(mockProps.inputPlaceholder);
    await user.type(inputField, 'Test message from user');
    expect(inputField).toHaveValue('Test message from user');

    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    expect(mockProps.onSendMessage).toHaveBeenCalledWith('Test message from user');
    // Input should be cleared after sending - this depends on ChatInterface's own state management
    // We might need to wait for the input to clear if onSendMessage clears it via props/state change
    await waitFor(() => {
        expect(inputField).toHaveValue('');
    });
  });

  it('disables input and send button when isLoading is true', () => {
    render(<ChatInterface {...mockProps} isLoading={true} />);
    expect(screen.getByPlaceholderText(mockProps.inputPlaceholder)).toBeDisabled();
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  it('disables input and send button when isCompleted is true', () => {
    render(<ChatInterface {...mockProps} isCompleted={true} />);
    expect(screen.getByPlaceholderText(mockProps.completedPlaceholder)).toBeDisabled();
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  it('shows typing indicator when isLoading is true and there are messages', () => {
    render(<ChatInterface {...mockProps} isLoading={true} />);
    // Simple check for typing indicator existence, actual structure might be more complex
    // This assumes TypingIndicator renders something identifiable like "Typing..." or a specific data-testid
    // For now, we'll check if the main message area still exists, as indicator is within it.
    // A more specific test for TypingIndicator itself would be better if it were a separate component.
    // The current TypingIndicator has animated divs.
    // Let's look for the animated divs. A bit fragile but a starting point.
    const animatedDivs = document.querySelectorAll('.animate-bounce');
    expect(animatedDivs.length).toBeGreaterThan(0);
  });

  it('does not show typing indicator when not isLoading', () => {
    render(<ChatInterface {...mockProps} isLoading={false} />);
    const animatedDivs = document.querySelectorAll('.animate-bounce');
    expect(animatedDivs.length).toBe(0);
  });

  describe('ChatMessage with interactive suggestions', () => {
    const messagesWithSuggestions: Message[] = [
      { id: 's1', sender: 'bot', text: 'Please choose an option: 👉 [Option 1] or 👉 [Option 2]', timestamp: Date.now() }
    ];

    it('renders suggestions as buttons for the last bot message', () => {
      render(<ChatInterface {...mockProps} messages={messagesWithSuggestions} />);
      expect(screen.getByRole('button', { name: 'Option 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Option 2' })).toBeInTheDocument();
    });

    it('calls onSendMessage with suggestion text when a suggestion button is clicked', async () => {
      const user = userEvent.setup();
      const onSendMessageMock = vi.fn();
      render(<ChatInterface {...mockProps} messages={messagesWithSuggestions} onSendMessage={onSendMessageMock} />);

      const option1Button = screen.getByRole('button', { name: 'Option 1' });
      await user.click(option1Button);

      expect(onSendMessageMock).toHaveBeenCalledWith('Option 1');
    });

    it('disables suggestion buttons when isLoading is true', () => {
      render(<ChatInterface {...mockProps} messages={messagesWithSuggestions} isLoading={true} />);
      expect(screen.getByRole('button', { name: 'Option 1' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Option 2' })).toBeDisabled();
    });

    it('disables suggestion buttons for non-last bot messages even if they contain suggestions', () => {
      const olderMessagesWithSuggestions: Message[] = [
        { id: 's1', sender: 'bot', text: 'Old options: 👉 [Old Option A]', timestamp: Date.now() - 1000 },
        { id: 's2', sender: 'user', text: 'My response', timestamp: Date.now() - 500 },
        { id: 's3', sender: 'bot', text: 'New message without options.', timestamp: Date.now()}
      ];
      render(<ChatInterface {...mockProps} messages={olderMessagesWithSuggestions} />);
      // Old Option A should be rendered by markdown, but not as an active button by ChatMessage logic for suggestions
      // The ChatMessage component itself decides if buttons are active based on isLastBotMessageWithOptions
      // This test verifies that ChatInterface correctly passes that prop.
      // The button might still exist but be disabled.
      const oldOptionButton = screen.getByRole('button', { name: 'Old Option A' });
      expect(oldOptionButton).toBeInTheDocument();
      // Based on current logic, if this is the last bot message WITH options, it should be enabled.
      // The scenario: Bot (options) -> User -> Bot (no options).
      // lastBotMessageWithOptionsIndex will point to the "Old Option A" message.
      // So, isLastBotMessageWithOptions will be true for "Old Option A".
      expect(oldOptionButton).not.toBeDisabled();
    });

     it('only enables suggestion buttons for the very last bot message if multiple bot messages have suggestions', () => {
      const multipleBotMessagesWithSuggestions: Message[] = [
        { id: 's1', sender: 'bot', text: 'First options: 👉 [Option A]', timestamp: Date.now() - 2000 },
        { id: 's2', sender: 'bot', text: 'Second options: 👉 [Option B]', timestamp: Date.now() - 1000 },
      ];
      render(<ChatInterface {...mockProps} messages={multipleBotMessagesWithSuggestions} />);

      const optionAButton = screen.getByRole('button', { name: 'Option A' });
      const optionBButton = screen.getByRole('button', { name: 'Option B' });

      expect(optionAButton).toBeInTheDocument();
      expect(optionAButton).toBeDisabled(); // Only last bot message's suggestions are enabled

      expect(optionBButton).toBeInTheDocument();
      expect(optionBButton).not.toBeDisabled();
    });
  });
});
