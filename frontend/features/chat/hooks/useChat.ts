'use client';

import { useState, useCallback, useRef } from 'react';
import { Message, Conversation, PromptSuggestion, DisplayMode } from '../types/chat';
import { INITIAL_MOCK_CONVERSATIONS } from '../mock/conversations';
import { backendClient } from '../../../services/api';

const DEFAULT_SUGGESTIONS: PromptSuggestion[] = [
  { id: 'sug-init-1', label: 'What services does Mobiloitte offer?', icon: '🚀', prompt: 'What services does Mobiloitte offer?' },
  { id: 'sug-init-2', label: "Where are Mobiloitte's offices located?", icon: '📍', prompt: "Where are Mobiloitte's offices located?" },
  { id: 'sug-init-3', label: 'How many employees does Mobiloitte have?', icon: '👥', prompt: 'How many employees does Mobiloitte have?' },
];

const KAIRA_GREETING = 'Hello! I\'m **Kaira**, your Mobiloitte enterprise assistant. 👋\n\nI can help you with:\n- 🏢 Company background & services\n- 🤖 AI, Blockchain & technology expertise\n- 💼 Careers & hiring at Mobiloitte\n- 🌍 Global office locations & contact info\n\nWhat would you like to know?';

export function useChat() {
  const initialIdRef = useRef(`conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const [conversations, setConversations] = useState<Conversation[]>(() =>
    INITIAL_MOCK_CONVERSATIONS.map((c) => ({
      ...c,
      id: initialIdRef.current,
      messages: c.messages.map((m) =>
        m.role === 'assistant' ? { ...m, suggestions: m.suggestions || DEFAULT_SUGGESTIONS } : m
      ),
    }))
  );
  const [activeConversationId, setActiveConversationId] = useState<string>(initialIdRef.current);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('widget');
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  /* ── Open / close / mode ─────────────────────────── */
  const toggleOpen  = useCallback(() => setIsOpen((p) => !p), []);
  const openWidget  = useCallback(() => setIsOpen(true), []);
  const closeWidget = useCallback(() => setIsOpen(false), []);
  const toggleDisplayMode = useCallback(
    () => setDisplayMode((p) => (p === 'widget' ? 'fullscreen' : 'widget')),
    []
  );
  const selectConversation = useCallback((id: string) => setActiveConversationId(id), []);

  /* ── New chat ────────────────────────────────────── */
  const startNewChat = useCallback(() => {
    const id = `conv-${Date.now()}`;
    const conv: Conversation = {
      id,
      title: 'New Conversation',
      lastUpdated: 'Just now',
      messages: [{
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: KAIRA_GREETING,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'complete',
        suggestions: DEFAULT_SUGGESTIONS,
        debugBadge: 'Source: Greeting',
        debugSource: 'Greeting',
      }],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(id);
  }, []);

  /* ── Send message ────────────────────────────────── */
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `msg-${Date.now()}`;
    const userMsg: Message = { id: userMsgId, role: 'user', content: text.trim(), timestamp, status: 'complete' };

    setConversations((prev) => prev.map((c) => {
      if (c.id !== activeConversationId) return c;
      const title = c.messages.length <= 1 ? text.slice(0, 32) + (text.length > 32 ? '…' : '') : c.title;
      return { ...c, title, lastUpdated: 'Just now', messages: [...c.messages, userMsg] };
    }));

    setIsTyping(true);
    let fullResponse = '';
    let fetchedSuggestions: PromptSuggestion[] = [];
    let debugBadge: string | undefined = undefined;
    let debugSource: string | undefined = undefined;

    try {
      const res = await backendClient.post('/api/v1/chat', { 
        message: text.trim(),
        sessionId: activeConversationId
      });
      const dataPayload = res.data?.data || res.data || {};
      fullResponse = dataPayload.message || 'Sorry, I received an empty response.';
      
      const rawSource = (dataPayload.debugSource || dataPayload.metadata?.debugSource || dataPayload.source || dataPayload.winningEngine || 'Fallback').toString().trim();
      let cleanSource = rawSource.replace(/\s+Engine$/i, '').trim();
      if (['Thanks', 'Farewell', 'Acknowledgement'].includes(cleanSource)) {
        cleanSource = 'Greeting';
      }

      const ALLOWED_SOURCES = ['Greeting', 'FastPath', 'RAG', 'Gibberish', 'Fallback'];
      if (!ALLOWED_SOURCES.includes(cleanSource)) {
        console.error(`🚨 [Backend-Frontend Source Synchronization Error] Inconsistent backend source: "${rawSource}". Expected one of: ${ALLOWED_SOURCES.join(', ')}.`);
        cleanSource = 'Fallback';
      }

      debugSource = cleanSource;
      debugBadge = `Source: ${cleanSource}`;

      if (Array.isArray(dataPayload.suggestions) && dataPayload.suggestions.length > 0) {
        fetchedSuggestions = dataPayload.suggestions.map((s: any, idx: number) => ({
          id: s.id || `sug-res-${idx}`,
          label: s.label || s.prompt || '',
          icon: s.icon || '🚀',
          prompt: s.label || s.prompt || '',
        }));
      } else {
        fetchedSuggestions = DEFAULT_SUGGESTIONS;
      }
    } catch (err: any) {
      console.error('🚨 [Chat API Error] Failed to fetch backend response:', err?.message || err);
      fullResponse = "Sorry, I'm having trouble connecting to the server. Please check that the backend is running.";
      fetchedSuggestions = DEFAULT_SUGGESTIONS;
      debugBadge = 'Source: Fallback';
      debugSource = 'Fallback';
    }

    /* ── Stream response character by character ── */
    const assistantMsgId = `msg-${Date.now() + 1}`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'streaming',
      debugBadge,
      debugSource,
    };

    setConversations((prev) => prev.map((c) =>
      c.id === activeConversationId ? { ...c, messages: [...c.messages, assistantMsg] } : c
    ));

    let idx = 0;
    const chunkSize = 10;

    const streamChunk = () => {
      if (idx < fullResponse.length) {
        idx += chunkSize;
        const partial = fullResponse.slice(0, idx);
        const isDone = idx >= fullResponse.length;

        setConversations((prev) => prev.map((c) => {
          if (c.id !== activeConversationId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: partial,
                    status: isDone ? 'complete' : 'streaming',
                    suggestions: isDone ? fetchedSuggestions : undefined,
                    debugBadge: isDone ? debugBadge : m.debugBadge,
                    debugSource: isDone ? debugSource : m.debugSource,
                  }
                : m
            ),
          };
        }));

        if (isDone) {
          setIsTyping(false);
        } else {
          streamingTimeoutRef.current = setTimeout(streamChunk, 20);
        }
      } else {
        setIsTyping(false);
      }
    };

    streamChunk();
  }, [activeConversationId, isTyping]);

  /* ── Suggestion / regenerate ─────────────────────── */
  const selectSuggestion = useCallback((s: PromptSuggestion) => {
    const questionText = s.label || s.prompt || '';
    if (questionText) {
      sendMessage(questionText);
    }
  }, [sendMessage]);

  const regenerateResponse = useCallback(() => {
    if (isTyping || !activeConversation || activeConversation.messages.length < 2) return;
    const lastUser = [...activeConversation.messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;

    setConversations((prev) => prev.map((c) => {
      if (c.id !== activeConversationId) return c;
      const msgs = c.messages;
      const withoutLast = msgs[msgs.length - 1].role === 'assistant' ? msgs.slice(0, -1) : msgs;
      return { ...c, messages: withoutLast };
    }));
    sendMessage(lastUser.content);
  }, [activeConversation, activeConversationId, isTyping, sendMessage]);

  /* ── Message feedback ────────────────────────────── */
  const setMessageFeedback = useCallback((msgId: string, feedback: 'like' | 'dislike') => {
    setConversations((prev) => prev.map((c) => {
      if (c.id !== activeConversationId) return c;
      return {
        ...c,
        messages: c.messages.map((m) =>
          m.id === msgId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m
        ),
      };
    }));
  }, [activeConversationId]);

  /* ── Conversation management ─────────────────────── */
  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === activeConversationId && next.length > 0) setActiveConversationId(next[0].id);
      return next.length > 0 ? next : INITIAL_MOCK_CONVERSATIONS;
    });
  }, [activeConversationId]);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title } : c));
  }, []);

  const pinConversation = useCallback((id: string) => {
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
  }, []);

  const clearConversation = useCallback((id: string) => {
    setConversations((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        messages: [{
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: KAIRA_GREETING,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'complete',
          debugBadge: 'Source: Greeting',
          debugSource: 'Greeting',
        }],
      };
    }));
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isTyping,
    isOpen,
    displayMode,
    toggleOpen,
    openWidget,
    closeWidget,
    toggleDisplayMode,
    setDisplayMode,
    selectConversation,
    startNewChat,
    sendMessage,
    selectSuggestion,
    regenerateResponse,
    setMessageFeedback,
    deleteConversation,
    renameConversation,
    pinConversation,
    clearConversation,
  };
}
