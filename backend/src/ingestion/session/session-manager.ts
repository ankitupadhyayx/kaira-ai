import { ChatSession, ISessionStore } from '../../shared/interfaces/session.interface';
import { v4 as uuidv4 } from 'uuid';

export class InMemorySessionStore implements ISessionStore {
  private sessions = new Map<string, ChatSession>();

  public async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  public async saveSession(session: ChatSession): Promise<void> {
    this.sessions.set(session.sessionId, session);
  }

  public async touchSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActiveAt = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  public async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}

export class SessionManager {
  constructor(private readonly store: ISessionStore = new InMemorySessionStore()) {}

  public async getOrCreateSession(sessionId?: string, channelId: string = 'api', userId?: string): Promise<ChatSession> {
    if (sessionId) {
      const existing = await this.store.getSession(sessionId);
      if (existing) {
        await this.store.touchSession(sessionId);
        return existing;
      }
    }

    const newSessionId = sessionId || uuidv4();
    const newSession: ChatSession = {
      sessionId: newSessionId,
      channelId,
      userId,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      metadata: {},
    };

    await this.store.saveSession(newSession);
    return newSession;
  }
}
