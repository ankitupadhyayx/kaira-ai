export interface ChatSession {
  sessionId: string;
  channelId: string;
  userId?: string;
  createdAt: Date;
  lastActiveAt: Date;
  metadata: Record<string, unknown>;
}

export interface ISessionStore {
  getSession(sessionId: string): Promise<ChatSession | null>;
  saveSession(session: ChatSession): Promise<void>;
  touchSession(sessionId: string): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
}
