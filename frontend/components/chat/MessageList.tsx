'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Message, PromptSuggestion } from '../../features/chat/types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from './EmptyState';
import { ArrowDown } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  onSelectSuggestion: (suggestion: PromptSuggestion) => void;
  onRegenerate?: () => void;
  onFeedback?: (id: string, feedback: 'like' | 'dislike') => void;
}

export function MessageList({
  messages, isTyping, onSelectSuggestion, onRegenerate, onFeedback
}: MessageListProps) {
  const bottomRef     = useRef<HTMLDivElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = (smooth = true) =>
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });

  useEffect(() => { scrollToBottom(true); }, [messages.length, isTyping]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 140);
  };

  const isNoMessages = messages.length === 0 || (messages.length === 1 && messages[0].content === '');
  const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const lastAssistantId = lastAssistantIdx >= 0
    ? messages[messages.length - 1 - lastAssistantIdx]?.id
    : null;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto py-2 no-scrollbar"
      role="log"
      aria-label="Conversation"
      aria-live="polite"
    >
      {isNoMessages ? (
        <EmptyState onSelectSuggestion={onSelectSuggestion} />
      ) : (
        <div className="space-y-0.5">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isLastAssistantMessage={msg.id === lastAssistantId}
              isTyping={isTyping}
              onSelectSuggestion={onSelectSuggestion}
              onRegenerate={onRegenerate}
              onFeedback={onFeedback}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      )}

      <div ref={bottomRef} className="h-4" />

      {/* Scroll-to-bottom FAB */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom(true)}
          aria-label="Scroll to latest message"
          className="sticky bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full animate-scale-in k-transition z-20"
          style={{
            background: 'var(--k-accent-soft)',
            border: '1px solid var(--k-accent-border)',
            color: 'var(--k-accent-text)',
            boxShadow: 'var(--k-shadow-sm)',
          }}
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
