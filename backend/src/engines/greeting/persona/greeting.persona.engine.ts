import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { UserPersona } from '../types/greeting.types';

export class GreetingPersonaEngine {
  public inferPersona(context: ProcessingContext): UserPersona {
    const raw = (context.originalQuery || context.cleanQuery || '').toLowerCase().trim();

    if (raw.includes('intern') || raw.includes('student') || raw.includes('college')) {
      return 'Student';
    }
    if (raw.includes('career') || raw.includes('job') || raw.includes('hiring') || raw.includes('vacancy') || raw.includes('resume')) {
      return 'Job Seeker';
    }
    if (raw.includes('hr') || raw.includes('recruiter') || raw.includes('interview')) {
      return 'Recruiter';
    }
    if (raw.includes('developer') || raw.includes('code') || raw.includes('api') || raw.includes('github') || raw.includes('stack')) {
      return 'Developer';
    }
    if (raw.includes('ceo') || raw.includes('price') || raw.includes('quote') || raw.includes('proposal') || raw.includes('client')) {
      return 'Business Client';
    }
    if (raw.includes('enterprise') || raw.includes('partner') || raw.includes('vendor')) {
      return 'Enterprise Customer';
    }
    if (raw.includes('yo') || raw.includes('bro') || raw.includes('bhai')) {
      return 'Friendly';
    }
    if (raw.includes('sir') || raw.includes('maam') || raw.includes('dear')) {
      return 'Professional';
    }

    return 'Visitor';
  }
}

export const greetingPersonaEngine = new GreetingPersonaEngine();
