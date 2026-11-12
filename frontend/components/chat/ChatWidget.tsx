'use client';

import React, { useState } from 'react';
import { useChat } from '../../features/chat/hooks/useChat';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MessageList } from './MessageList';
import { ChatInput } from '../input/ChatInput';
import { FloatingButton } from './FloatingButton';
import { ErrorBoundary } from '../common/ErrorBoundary';

export function ChatWidget() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    isTyping,
    isOpen,
    displayMode,
    toggleOpen,
    closeWidget,
    toggleDisplayMode,
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
  } = useChat();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sharedMessageListProps = {
    messages:          activeConversation.messages,
    isTyping,
    onSelectSuggestion: selectSuggestion,
    onRegenerate:       regenerateResponse,
    onFeedback:         setMessageFeedback,
  };

  const sharedSidebarProps = {
    conversations,
    activeConversationId,
    onSelectConversation: selectConversation,
    onNewChat:            startNewChat,
    onDeleteConversation: deleteConversation,
    onRenameConversation: renameConversation,
    onPinConversation:    pinConversation,
    onClearConversation:  clearConversation,
  };

  return (
    <ErrorBoundary>
      <FloatingButton isOpen={isOpen} onClick={toggleOpen} />

      {isOpen && (
        <>
          {displayMode === 'widget' ? (
            /* ── Widget panel ───────────────────────────── */
            <div
              className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] max-h-[calc(100vh-8rem)] flex flex-col animate-slide-up overflow-hidden"
              style={{
                background: 'var(--k-widget-bg)',
                border: '1px solid var(--k-border)',
                borderRadius: 20,
                boxShadow: 'var(--k-widget-shadow)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              <Header
                displayMode="widget"
                onToggleDisplayMode={toggleDisplayMode}
                onClose={closeWidget}
                onNewChat={startNewChat}
              />
              <MessageList {...sharedMessageListProps} />
              <ChatInput onSendMessage={sendMessage} isTyping={isTyping} />
            </div>
          ) : (
            /* ── Fullscreen ──────────────────────────────── */
            <div
              className="fixed inset-0 z-50 flex animate-fade-in"
              style={{ background: 'var(--k-bg)' }}
            >
              {/* Ambient mesh */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 40% at 50% -5%, var(--k-mesh-1) 0%, transparent 60%),' +
                    'radial-gradient(ellipse 40% 30% at 88% 92%, var(--k-mesh-2) 0%, transparent 50%)',
                }}
              />

              <Sidebar
                {...sharedSidebarProps}
                isOpenMobile={mobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
              />

              <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header
                  displayMode="fullscreen"
                  onToggleDisplayMode={toggleDisplayMode}
                  onClose={closeWidget}
                  onNewChat={startNewChat}
                  showSidebarToggle
                  onToggleSidebar={() => setMobileSidebarOpen(true)}
                />
                <div className="flex-1 max-w-3xl w-full mx-auto flex flex-col h-full overflow-hidden px-2 sm:px-4 pb-2">
                  <MessageList {...sharedMessageListProps} />
                  <ChatInput onSendMessage={sendMessage} isTyping={isTyping} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </ErrorBoundary>
  );
}
