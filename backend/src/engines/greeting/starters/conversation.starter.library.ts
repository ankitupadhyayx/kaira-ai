import { UserPersona, GreetingContextType } from '../types/greeting.types';
import { greetingDictionary } from '../dictionaries/greeting.dictionary';

export class ConversationStarterLibrary {
  public getStarter(persona: UserPersona, contextType: GreetingContextType, turnCount: number = 1, sessionId?: string): string {
    const dict = greetingDictionary;
    const capabilities = dict.conversationStarters.capabilities || [];
    const generic = dict.conversationStarters.generic_starters || [];

    const hash = this.getSessionOffset(sessionId);

    // Provide premium capabilities listing by default or based on persona
    if (persona === 'Job Seeker' || persona === 'Student') {
      return 'I can help you explore Mobiloitte\'s career opportunities, engineering internships, eligibility criteria, and our interview process.';
    }
    
    // Choose dynamic capabilities templates
    if (turnCount === 1) {
      const idx = hash % capabilities.length;
      return capabilities[idx] || 'I can help you explore Mobiloitte\'s AI, Blockchain, Cloud, Mobile, Web, Cybersecurity, careers, leadership, office locations, company information, technologies, and much more.';
    }

    // Rotate generic starters
    const pool = generic.length > 0 ? generic : ['What can I help you explore today?'];
    const idx = (turnCount - 1 + hash) % pool.length;
    return pool[idx] || pool[0];
  }

  private getSessionOffset(sessionId?: string): number {
    if (!sessionId) return 0;
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      hash = (hash << 5) - hash + sessionId.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export const conversationStarterLibrary = new ConversationStarterLibrary();
