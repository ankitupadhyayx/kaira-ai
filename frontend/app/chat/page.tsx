'use client';

import React, { useState } from 'react';
import { useChat } from '../../features/chat/hooks/useChat';
import { Header } from '../../components/chat/Header';
import { Sidebar } from '../../components/chat/Sidebar';
import { MessageList } from '../../components/chat/MessageList';
import { ChatInput } from '../../components/input/ChatInput';

export default function ChatPage() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    isTyping,
    closeWidget,
    toggleDisplayMode,
    selectConversation,
    startNewChat,
    sendMessage,
    selectSuggestion,
    regenerateResponse,
  } = useChat();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 animate-fade-in">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={startNewChat}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          displayMode="fullscreen"
          onToggleDisplayMode={toggleDisplayMode}
          onClose={closeWidget}
          onNewChat={startNewChat}
          showSidebarToggle={true}
          onToggleSidebar={() => setMobileSidebarOpen(true)}
        />

        <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col h-full overflow-hidden px-2 sm:px-4">
          <MessageList
            messages={activeConversation.messages}
            isTyping={isTyping}
            onSelectSuggestion={selectSuggestion}
            onRegenerate={regenerateResponse}
          />

          <ChatInput onSendMessage={sendMessage} isTyping={isTyping} />
        </div>
      </div>
    </div>
  );
}
