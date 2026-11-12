import { ProcessingContext } from '../../../normalization/types/processing-context.types';

export type GreetingCategory =
  | 'Standard'
  | 'Professional'
  | 'Business'
  | 'Formal'
  | 'Informal'
  | 'Regional'
  | 'Indian'
  | 'Hinglish'
  | 'Emoji'
  | 'Time Based'
  | 'Multiple Greetings'
  | 'Conversation Continuation'
  | 'Greeting + Intent'
  | 'Farewell'
  | 'Thanks'
  | 'Apology'
  | 'Confirmation'
  | 'Appreciation'
  | 'Confusion'
  | 'Help'
  | 'Small Talk'
  | 'User Status Positive'
  | 'User Status Negative'
  | 'Bot Intro'
  | 'Capabilities'
  | 'Compliments'
  | 'Motivation'
  | 'Jokes';

export type GreetingPosition = 'Beginning' | 'Middle' | 'End' | 'Standalone';

export type UserPersona =
  | 'Student'
  | 'Developer'
  | 'Recruiter'
  | 'HR'
  | 'Business Client'
  | 'Enterprise Customer'
  | 'Job Seeker'
  | 'Partner'
  | 'Visitor'
  | 'Unknown'
  | 'Professional'
  | 'Friendly';

export type GreetingLanguage = 'English' | 'Hindi' | 'Hinglish' | 'Regional' | 'Multilingual';

export type GreetingStyle =
  | 'Professional'
  | 'Friendly'
  | 'Business'
  | 'Warm'
  | 'Respectful'
  | 'Energetic'
  | 'Corporate'
  | 'Minimal'
  | 'Conversational'
  | 'Regional'
  | 'Modern'
  | 'Gen-Z'
  | 'Emoji'
  | 'Hinglish'
  | 'Indian'
  | 'Formal'
  | 'Casual';

export type GreetingEmotion =
  | 'Excited'
  | 'Happy'
  | 'Friendly'
  | 'Calm'
  | 'Professional'
  | 'Respectful'
  | 'Curious'
  | 'Playful'
  | 'Formal'
  | 'Casual'
  | 'Corporate'
  | 'Business'
  | 'Warm'
  | 'Neutral';

export type GreetingEnergy = 'Low' | 'Medium' | 'High' | 'Very High' | 'Calm';
export type GreetingPoliteness = 'Very Polite' | 'Polite' | 'Neutral' | 'Informal';
export type GreetingFormality = 'Formal' | 'Semi-Formal' | 'Casual';

export type GreetingAudience =
  | 'Sir'
  | 'Team'
  | 'Bro'
  | 'CEO'
  | 'Everyone'
  | 'All'
  | 'Group'
  | 'Generic';

export type GreetingContextType =
  | 'First Visit'
  | 'Returning User'
  | 'Repeated Greeting'
  | 'Greeting + Company'
  | 'Greeting + Team'
  | 'Greeting + Emoji'
  | 'Greeting + Question'
  | 'Greeting + Intent'
  | 'Greeting + Time'
  | 'Greeting + Regional Greeting'
  | 'Greeting + Multiple Greetings'
  | 'Greeting + Long Text';

export interface GreetingUnderstanding {
  language: GreetingLanguage;
  style: GreetingStyle;
  emotion: GreetingEmotion;
  energy: GreetingEnergy;
  politeness: GreetingPoliteness;
  formality: GreetingFormality;
  audience: GreetingAudience;
  persona: UserPersona;
  contextType: GreetingContextType;
  categories?: GreetingCategory[];
}

export interface DynamicResponseComposition {
  opening: string;
  acknowledgement: string;
  emotionResponse?: string;
  contextResponse?: string;
  personalization?: string;
  starter: string;
  capabilityHint?: string;
  fullText: string;
}

export interface GreetingSpan {
  matchedText: string;
  matchedToken: string;
  startIndex: number;
  endIndex: number;
  tokenCount: number;
  position: GreetingPosition;
}

export interface GreetingDetectionDetails {
  detected: boolean;
  span?: GreetingSpan;
  category: GreetingCategory;
  confidence: number;
  hasBusinessIntent: boolean;
  residualQuery: string;
  residualTokens: string[];
  categories?: GreetingCategory[];
}

export interface GreetingConfidenceScore {
  totalConfidence: number;
  matchScore: number;
  positionBonus: number;
  qualityScore: number;
  languageAlignmentScore: number;
  intentPenalty: number;
}

export interface GreetingSessionState {
  sessionId: string;
  turnCount: number;
  hasGreeted: boolean;
  lastGreetingTime?: number;
  lastGreetingCategory?: GreetingCategory;
  userPersona?: UserPersona;
}

export interface GreetingPayload {
  greetingDetected: boolean;
  matchedGreeting?: string;
  category: GreetingCategory;
  confidence: number;
  confidenceDetails: GreetingConfidenceScore;
  position: GreetingPosition;
  hasBusinessQuery: boolean;
  residualQuery: string;
  isRepeatedGreeting: boolean;
  persona: UserPersona;
  understanding?: GreetingUnderstanding;
  composition?: DynamicResponseComposition;
  recommendedResponseStrategy: {
    category: GreetingCategory;
    persona: UserPersona;
    responseTemplate: string;
    understanding?: GreetingUnderstanding;
    composition?: DynamicResponseComposition;
  };
  categories?: GreetingCategory[];
}

export interface GreetingAnalyticsRecord {
  sessionId?: string;
  greetingCategory: GreetingCategory;
  language: string;
  style?: string;
  emotion?: string;
  persona?: string;
  confidence: number;
  position: GreetingPosition;
  hasBusinessQuery: boolean;
  isRepeatedGreeting: boolean;
  latencyMs: number;
  timestamp: string;
}
