/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChatInterface from './ChatInterface';
import { Message } from '../types';

const mockMessages: Message[] = [
  { id: '1', sender: 'user', text: 'Hello bot', timestamp: Date.now() },
  { id: '2', sender: 'bot', text: 'Hello user! Here are options. 👉 [Option 1] 👉 [Option 2]', timestamp: Date.now() + 1 },
  { id: '3', sender: 'user', text: 'Option 1', timestamp: Date.now() + 2 },
  { id: '4', sender: 'bot', text: 'You chose option 1. More choices? 👉 [Choice A] 👉 [Choice B]', timestamp: Date.now() + 3 },
  { id: '5', sender: 'bot', text: 'Here is some code:\n```javascript\nconsole.log("hello");\n```', timestamp: Date.now() + 4 }
];

const mockOnSendMessage = jest.fn();
const mockScrollIntoView = jest.fn();
const mockWriteText = jest.fn().mockImplementation(() => Promise.resolve());

describe('ChatInterface', () => {
  beforeEach(() => {
    mockOnSendMessage.mockClear();
    mockScrollIntoView.mockClear();
    mockWriteText.mockClear();
    
    // Mock necessary browser APIs
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
    });
  });

  it('renders all messages correctly', () => {
    render(<ChatInterface messages={mockMessages} onSendMessage={mockOnSendMessage} isLoading={false} isCompleted={false} inputPlaceholder="Type..." completedPlaceholder="Ended" ariaLiveAnnouncement="" />);
    expect(screen.getByText('Hello bot')).toBeInTheDocument();
    expect(screen.getByText(/Hello user! Here are options./)).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText(/You chose option 1. More choices?/)).toBeInTheDocument();
    expect(screen.getByText('console.log("hello");')).toBeInTheDocument();
  });

  it('shows typing indicator when loading', () => {
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isLoading={true} isCompleted={false} inputPlaceholder="Type..." completedPlaceholder="Ended" ariaLiveAnnouncement="" />);
    expect(document.querySelector('.animate-bounce')).toBeInTheDocument();
  });
  
  it('disables input form when loading or completed', () => {
    const { rerender } = render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isLoading={true} isCompleted={false} inputPlaceholder="Type..." completedPlaceholder="Ended" ariaLiveAnnouncement="" />);
    expect(screen.getByPlaceholderText(/type/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();

    rerender(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isLoading={false} isCompleted={true} inputPlaceholder="Type..." completedPlaceholder="Ended" ariaLiveAnnouncement="" />);
    expect(screen.getByPlaceholderText(/ended/i)).toBeDisabled();
  });

  it('only enables suggestion buttons on the last bot message', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={mockMessages} onSendMessage={mockOnSendMessage} isLoading={false} isCompleted={false} inputPlaceholder="Type..." completedPlaceholder="Ended" ariaLiveAnnouncement="" />);

    const oldSuggestionButton = screen.getByRole('button', { name: 'Option 2' });
    const newSuggestionButton = screen.getByRole('button', { name: 'Choice A' });

    expect(oldSuggestionButton).toBeDisabled();
    expect(newSuggestionButton).not.toBeDisabled();

    await user.click(newSuggestionButton);
    expect(mockOnSendMessage).toHaveBeenCalledWith('Choice A');
    
    await user.click(oldSuggestionButton);
    expect(mockOnSendMessage).toHaveBeenCalledTimes(1);
  });
  
  it('calls onSendMessage when user types and clicks send', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isLoading={false} isCompleted={false} inputPlaceholder="Type..." completedPlaceholder="Ended" ariaLiveAnnouncement="" />);

    const input = screen.getByPlaceholderText('Type...');
    const sendButton = screen.getByRole('button', { name: /send message/i });

    await user.type(input, 'My new message');
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('My new message');
    expect(input).toHaveValue('');
  });

  it('renders the aria-live announcement correctly', () => {
    const announcement = "This is a new message from the bot.";
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isLoading={false} isCompleted={false} inputPlaceholder="Type..." completedPlaceholder="Ended" ariaLiveAnnouncement={announcement} />);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent(announcement);
  });
  
  describe('UX Features: Scroll to Bottom and Copy Code', () => {
    
    it('shows "Scroll to Bottom" button when scrolled up and scrolls down on click', async () => {
      const user = userEvent.setup();
      render(<ChatInterface messages={mockMessages} onSendMessage={mockOnSendMessage} isLoading={false} isCompleted={false} inputPlaceholder="Type..." completedPlaceholder="Ended" ariaLiveAnnouncement="" />);
      
      const scrollButton = screen.queryByRole('button', { name: /scroll to bottom/i });
      expect(scrollButton).not.toBeInTheDocument();

      const chatContainer = screen.getByTestId('chat-scroll-container');
      Object.defineProperty(chatContainer, 'scrollHeight', { value: 2000 });
      Object.defineProperty(chatContainer, 'clientHeight', { value: 500 });
      
      fireEvent.scroll(chatContainer, { target: { scrollTop: 1000 } });
      
      const visibleButton = await screen.findByRole('button', { name: /scroll to bottom/i });
      expect(visibleButton).toBeVisible();

      await user.click(visibleButton);
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
    
    it('copies code to clipboard and shows feedback', async () => {
        jest.useFakeTimers();
        const user = userEvent.setup();
        render(<ChatInterface messages={mockMessages} onSendMessage={mockOnSendMessage} isLoading={false} isCompleted={false} inputPlaceholder="Type..." completedPlaceholder="Ended" ariaLiveAnnouncement="" />);
        
        const copyButton = screen.getByRole('button', { name: /copy code to clipboard/i });
        await user.click(copyButton);

        expect(mockWriteText).toHaveBeenCalledWith('console.log("hello");');
        
        const copiedFeedback = await screen.findByText('Copied!');
        expect(copiedFeedback).toBeVisible();
        expect(screen.queryByText('Copy')).not.toBeInTheDocument();

        // Fast-forward time
        jest.advanceTimersByTime(2000);
        
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /copy code to clipboard/i })).toBeInTheDocument();

        jest.useRealTimers();
    });
  });
});