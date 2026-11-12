import { GreetingSessionState, GreetingCategory, UserPersona } from '../types/greeting.types';
import { DEFAULT_GREETING_CONFIG } from '../constants/greeting.constants';

export class GreetingSessionManager {
  private static instance: GreetingSessionManager;
  private readonly sessions: Map<string, GreetingSessionState> = new Map();

  public static getInstance(): GreetingSessionManager {
    if (!GreetingSessionManager.instance) {
      GreetingSessionManager.instance = new GreetingSessionManager();
    }
    return GreetingSessionManager.instance;
  }

  public getSession(sessionId: string): GreetingSessionState {
    const now = Date.now();
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        sessionId,
        turnCount: 0,
        hasGreeted: false,
      };
      this.sessions.set(sessionId, session);
    } else if (
      session.lastGreetingTime &&
      now - session.lastGreetingTime > DEFAULT_GREETING_CONFIG.sessionInactivityTimeoutMs
    ) {
      // Inactivity reset
      session.hasGreeted = false;
      session.turnCount = 0;
    }

    return session;
  }

  public recordGreeting(
    sessionId: string,
    category: GreetingCategory,
    persona?: UserPersona
  ): GreetingSessionState {
    const session = this.getSession(sessionId);
    session.turnCount += 1;
    session.hasGreeted = true;
    session.lastGreetingTime = Date.now();
    session.lastGreetingCategory = category;
    if (persona) session.userPersona = persona;
    return session;
  }

  public isRepeatedGreeting(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    return session.hasGreeted && session.turnCount >= 1;
  }

  public clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  public resetAll(): void {
    this.sessions.clear();
  }
}

export const greetingSessionManager = GreetingSessionManager.getInstance();
