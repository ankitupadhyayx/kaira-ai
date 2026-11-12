'use client';

import React from 'react';
import { HeaderNav } from '../components/layout/HeaderNav';
import { LandingHero } from '../components/layout/LandingHero';
import { ChatWidget } from '../components/chat/ChatWidget';
import { useChat } from '../features/chat/hooks/useChat';

export default function HomePage() {
  const { openWidget } = useChat();

  return (
    <div className="min-h-screen flex flex-col k-mesh">
      <HeaderNav onOpenAssistant={openWidget} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <LandingHero onOpenAssistant={openWidget} />
      </main>

      <ChatWidget />
    </div>
  );
}
