import React, { useState, useCallback } from 'react';
import { Message, PromptSuggestion } from '../../features/chat/types/chat';
import { Avatar } from '../common/Avatar';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { SuggestionChips } from './SuggestionChips';
import { RefreshCw, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '../common/Toast';

interface MessageBubbleProps {
  message: Message;
  isLastAssistantMessage?: boolean;
  isTyping?: boolean;
  onSelectSuggestion?: (suggestion: PromptSuggestion) => void;
  onRegenerate?: () => void;
  onFeedback?: (id: string, feedback: 'like' | 'dislike') => void;
}

function MessageBubbleComponent({
  message,
  isLastAssistantMessage = false,
  isTyping = false,
  onSelectSuggestion,
  onRegenerate,
  onFeedback,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<'like' | 'dislike' | null>(message.feedback ?? null);

  const isDebugMode = process.env.NEXT_PUBLIC_CHAT_DEBUG_MODE !== 'false';

  /* ── Clean assistant response text (strictly excluding suggestions & debug metadata) ── */
  const cleanContent = message.content
    .replace(/\n\n\*\*Would you also like to know:\*\*\n([\s\S]*)$/i, '')
    .replace(/\n\*\*Would you also like to know:\*\*\n([\s\S]*)$/i, '')
    .replace(/^(🔧|🛠️)\s*Source:[\s\S]*$/gm, '')
    .trim();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      addToast('Copied to clipboard', 'success', 2200);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      addToast('Could not copy to clipboard', 'error');
    }
  }, [cleanContent, addToast]);

  const handleFeedback = useCallback((type: 'like' | 'dislike') => {
    const next = localFeedback === type ? null : type;
    setLocalFeedback(next as 'like' | 'dislike' | null);
    if (next && onFeedback) onFeedback(message.id, next);
    if (next === 'like') addToast('Thank you for the feedback!', 'success', 2000);
    if (next === 'dislike') addToast('Feedback noted. Kaira will improve.', 'info', 2200);
  }, [localFeedback, message.id, onFeedback, addToast]);

  /* ── User bubble ─────────────────────────────────── */
  if (isUser) {
    return (
      <div className="flex flex-col items-end px-4 py-1 animate-fade-in group">
        <div className="flex items-end space-x-2.5 max-w-[85%] sm:max-w-[78%]">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-none text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              background: 'var(--k-user-bg)',
              color: 'var(--k-user-text)',
              boxShadow: 'var(--k-shadow-sm)',
            }}
          >
            {message.content}
          </div>
          <div className="flex-shrink-0 mb-0.5">
            <Avatar role="user" size="sm" />
          </div>
        </div>
        <span
          className="text-[10px] font-mono mt-1 mr-9 select-none"
          style={{ color: 'var(--k-text-4)' }}
        >
          {message.timestamp}
        </span>
      </div>
    );
  }

  /* ── Assistant bubble ────────────────────────────── */
  return (
    <div className="flex flex-col items-start px-4 py-1 animate-fade-in group">
      <div className="flex items-start space-x-3 max-w-[95%] sm:max-w-[88%] w-full">
        <div className="flex-shrink-0 mt-0.5">
          <Avatar role="assistant" size="md" showOnlineStatus={false} />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Name + timestamp row */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
            <span
              className="text-[11px] font-semibold tracking-tight select-none"
              style={{ color: 'var(--k-accent-text)' }}
            >
              Kaira
            </span>
            <span className="text-[10px] font-mono select-none" style={{ color: 'var(--k-text-4)' }}>
              {message.timestamp}
            </span>
            {message.status === 'streaming' && (
              <span className="flex items-center space-x-1 select-none">
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: 'var(--k-accent)', animation: 'pulseAurora 1s ease-in-out infinite' }}
                />
                <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: 'var(--k-accent-text)' }}>
                  Live
                </span>
              </span>
            )}
          </div>

          {/* Bubble Container (Dedicated message-content class for clean copying) */}
          <div
            className="message-content relative p-4 rounded-2xl rounded-tl-none"
            style={{
              background: 'var(--k-ai-bg)',
              border: `1px solid var(--k-ai-border)`,
              boxShadow: 'var(--k-ai-shadow)',
            }}
          >
            {/* Streaming cursor */}
            {message.status === 'streaming' && cleanContent === '' && (
              <span
                className="inline-block w-0.5 h-4 rounded-full align-middle"
                style={{ background: 'var(--k-accent)', animation: 'pulseAurora 0.9s ease-in-out infinite' }}
              />
            )}
            <MarkdownRenderer content={cleanContent} />
          </div>

          {/* Developer Debug Trace Metadata Row (rendered outside message content, non-selectable, excluded from copy) */}
          {message.status === 'complete' && isDebugMode && (message.debugBadge || message.debugSource) && (() => {
            const src = (message.debugSource || message.debugBadge || '').replace(/^Source:\s*/i, '').trim();
            const sourceColorMap: Record<string, { bg: string; text: string; border: string }> = {
              RAG: { bg: 'rgba(139, 92, 246, 0.12)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
              FastPath: { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
              Greeting: { bg: 'rgba(59, 130, 246, 0.12)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
              Gibberish: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
              Fallback: { bg: 'rgba(107, 114, 128, 0.12)', text: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' },
            };
            const theme = sourceColorMap[src] || sourceColorMap.Fallback;

            return (
              <div
                className="debug-trace inline-flex items-center space-x-1 text-[10px] font-mono tracking-tight select-none pointer-events-none px-2 py-0.5 rounded-full"
                style={{
                  background: theme.bg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
                aria-hidden="true"
              >
                <span>🔧</span>
                <span>Source: {src}</span>
              </div>
            );
          })()}

          {/* Action bar — visible on hover and when complete */}
          {message.status === 'complete' && (
            <div
              className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 k-transition"
              role="toolbar"
              aria-label="Message actions"
            >
              {/* Copy (Copies ONLY cleanContent, excluding debug trace) */}
              <ActionBtn
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy response'}
                aria-label={copied ? 'Copied to clipboard' : 'Copy response'}
                active={copied}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </ActionBtn>

              {/* Retry */}
              {isLastAssistantMessage && onRegenerate && (
                <ActionBtn onClick={onRegenerate} title="Regenerate response" aria-label="Regenerate response">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </ActionBtn>
              )}

              {/* Separator */}
              <span className="mx-1 w-px h-3.5 self-center" style={{ background: 'var(--k-border)' }} />

              {/* Like */}
              <ActionBtn
                onClick={() => handleFeedback('like')}
                title="Helpful response"
                aria-label="Mark as helpful"
                active={localFeedback === 'like'}
                activeColor="var(--k-success)"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </ActionBtn>

              {/* Dislike */}
              <ActionBtn
                onClick={() => handleFeedback('dislike')}
                title="Not helpful"
                aria-label="Mark as not helpful"
                active={localFeedback === 'dislike'}
                activeColor="var(--k-error)"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </ActionBtn>
            </div>
          )}

          {/* Suggestion Chips */}
          {message.status === 'complete' &&
            isLastAssistantMessage &&
            message.suggestions &&
            message.suggestions.length > 0 &&
            onSelectSuggestion && (
              <SuggestionChips
                suggestions={message.suggestions}
                onSelectSuggestion={onSelectSuggestion}
                isDisabled={isTyping}
              />
            )}
        </div>
      </div>
    </div>
  );
}

/* ── Tiny action button ──────────────────────────────── */
function ActionBtn({
  onClick, title, children, active = false, activeColor, 'aria-label': ariaLabel
}: {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
  active?: boolean;
  activeColor?: string;
  'aria-label'?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className="inline-flex items-center space-x-1 text-[11px] font-medium px-2 py-1 rounded-md k-transition"
      style={{
        color: active ? (activeColor || 'var(--k-accent-text)') : 'var(--k-text-3)',
        background: active ? (activeColor ? `${activeColor}14` : 'var(--k-accent-soft)') : 'transparent',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--k-text-2)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--k-surface-2)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--k-border)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--k-text-3)';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}

export const MessageBubble = React.memo(MessageBubbleComponent, (prev, next) =>
  prev.message.id === next.message.id &&
  prev.message.content === next.message.content &&
  prev.message.status === next.message.status &&
  prev.message.feedback === next.message.feedback &&
  prev.message.debugBadge === next.message.debugBadge &&
  prev.isLastAssistantMessage === next.isLastAssistantMessage &&
  prev.isTyping === next.isTyping &&
  prev.message.suggestions === next.message.suggestions
);
