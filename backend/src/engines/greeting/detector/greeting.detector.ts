import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GreetingPosition, GreetingDetectionDetails, GreetingCategory } from '../types/greeting.types';
import { greetingDictionary } from '../dictionaries/greeting.dictionary';

const BUSINESS_KEYWORDS = new Set([
  'services', 'service', 'ceo', 'cto', 'pricing', 'price', 'cost', 'office', 'location', 'address',
  'career', 'careers', 'job', 'jobs', 'internship', 'hiring', 'apply', 'contact', 'blockchain',
  'technology', 'technologies', 'portfolio', 'history', 'founder', 'jagdish', 'harsh',
  'leadership', 'management', 'executive', 'executives', 'owner', 'ownership', 'board', 'directors', 'company',
  'offerings', 'solutions', 'expertise', 'specialization', 'consulting', 'engineering', 'development', 'transformation',
  'tech', 'stack', 'framework', 'frameworks', 'library', 'libraries', 'platform', 'platforms',
  'database', 'databases', 'programming', 'languages', 'language', 'cybersecurity', 'iot',
  'skills', 'skill', 'frontend', 'backend', 'fullstack', 'architecture', 'devops', 'cloud', 'tools',
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'rag', 'genai', 'flutter', 'react', 'angular', 'vue', 'node',
  'ethereum', 'polygon', 'web3', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
  'qa', 'ui', 'ux', 'figma', 'erp', 'crm', 'saas', 'testing', 'selenium', 'developers'
]);

function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyMatch(word: string, target: string, threshold = 1): boolean {
  if (Math.abs(word.length - target.length) > threshold) return false;
  return getLevenshteinDistance(word, target) <= threshold;
}

export class GreetingDetector {
  public detect(context: ProcessingContext): GreetingDetectionDetails {
    const inputQuery = (context.normalizedQuery || context.cleanQuery || context.originalQuery || '').trim();
    if (!inputQuery) {
      return this.buildNotDetected();
    }

    // 1. Single character & number check
    const textOnlyQuery = inputQuery.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u2700-\u27BF\uFE00-\uFE0F]/gu, '').trim();
    if (/^[a-z]$/i.test(textOnlyQuery) || /^\d+$/.test(textOnlyQuery)) {
      return this.buildNotDetected();
    }
    // Dots only
    if (/^[.]+$/.test(textOnlyQuery)) {
      return this.buildNotDetected();
    }

    // 2. Detect intents
    const { categories, confidence } = this.detectIntents(inputQuery, context);
    if (categories.length === 0) {
      return this.buildNotDetected();
    }

    // 3. Extract residual and matched greeting from normalized query
    const normQuery = (context.normalizedQuery || context.cleanQuery || '').toLowerCase();
    const { residual, matchedGreeting } = this.extractResidualQuery(normQuery, categories);

    // 4. Determine business intent
    const words = residual.toLowerCase().split(/\s+/).filter(Boolean);
    let hasBusinessIntent = words.some(w => BUSINESS_KEYWORDS.has(w) || (w.length > 3 && !/^(company_profile_intent|company_intent|services_intent|help_capabilities_intent|intent|mobiloitte|kaira|company|bot|assistant|ai|please|about|would|could|should|what|where|who|when|how|your|you|this|that|with|have|tell|make|feel|feeling|good|fine|well|great|nice|happy|sad|tired|stressed|low|bad|awesome|cool|sure|okay|motivate|inspire|quote|joke|funny|laugh|job|done|amazing|wonderful|fantastic|excellent|like|love|help|need|want|give|say|doing|thanks|thank|thnk|appreciate|appreciated|cheers|later|catch|talk|soon|see|bye|goodbye|farewell|glad|happy|show|capabilities|capability|assist|guide)$/i.test(w)));

    // Explicit Company Intent Rule: "tell me about mobiloitte", "about mobiloitte", "what is mobiloitte" -> Business Intent
    if (/\b(about|tell|what|who|services|profile|overview|details|work|do)\s+(mobiloitte|company|kaira|company_profile_intent|company_intent)\b/i.test(normQuery) || /\b(mobiloitte|company|company_profile_intent)\s+(profile|overview|services|details|work|capabilities)\b/i.test(normQuery)) {
      hasBusinessIntent = true;
    }

    if (categories.includes('Bot Intro')) {
      hasBusinessIntent = false;
    }

    // 5. Category resolution
    let category = categories[0] || 'Standard';
    if (categories.length > 1) {
      category = 'Multiple Greetings';
    }

    // 6. Token calculations for spans
    const tokens = context.normalizedTokens;
    const tokenCount = Math.max(1, tokens.length);

    // Determine position based on presence of residual query
    let position: GreetingPosition = 'Standalone';
    if (residual) {
      const lowerNorm = (normQuery || context.cleanQuery || '').trim().toLowerCase();
      const lowerClean = (context.cleanQuery || '').trim().toLowerCase();
      const lowerG = (matchedGreeting || '').trim().toLowerCase();
      if (lowerG && (lowerNorm.startsWith(lowerG) || lowerClean.startsWith(lowerG))) {
        position = 'Beginning';
      } else if (lowerG && (lowerNorm.endsWith(lowerG) || lowerClean.endsWith(lowerG))) {
        position = 'End';
      } else {
        position = 'Middle';
      }
    }

    return {
      detected: true,
      span: {
        matchedText: matchedGreeting,
        matchedToken: matchedGreeting.split(' ')[0] || matchedGreeting,
        startIndex: 0,
        endIndex: hasBusinessIntent ? 1 : tokenCount,
        tokenCount: hasBusinessIntent ? 1 : tokenCount,
        position,
      },
      category,
      categories,
      confidence,
      hasBusinessIntent,
      residualQuery: hasBusinessIntent ? residual : '',
      residualTokens: hasBusinessIntent ? words : [],
    };
  }

  private normalizeGreetingQuery(query: string): string {
    if (!query) return '';
    let cleaned = query.toLowerCase().trim();
    cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()!?]/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned;
  }

  private hasFuzzyMatch(words: string[], targets: string[], threshold = 1): boolean {
    for (const word of words) {
      if (word.length < 3) continue; // skip very short words
      for (const target of targets) {
        if (fuzzyMatch(word, target, threshold)) {
          return true;
        }
      }
    }
    return false;
  }

  private detectIntents(query: string, context: ProcessingContext): { categories: GreetingCategory[], confidence: number } {
    const categories: GreetingCategory[] = [];
    const normalized = `${this.normalizeGreetingQuery(query)} ${this.normalizeGreetingQuery(context.originalQuery || '')} ${this.normalizeGreetingQuery(context.cleanQuery || '')}`;
    const words = normalized.split(/\s+/).filter(Boolean);

    let maxConfidence = 0.0;
    const updateConfidence = (score: number) => {
      if (score > maxConfidence) maxConfidence = score;
    };

    // 1. Emoji check
    if (context.emojiMetadata && context.emojiMetadata.count > 0) {
      categories.push('Emoji');
      updateConfidence(1.0);
    }

    // 2. Small Talk Intent
    const exactSmallTalk = /\b(how are you|how r u|how're you|howre you|how is it going|how's it going|hows it going|everything good|are you okay|what's up|whats up|what is up|what are you doing|how have you been|how is your day|how's life|hows life|long time no see)\b/i.test(normalized);
    if (exactSmallTalk) {
      categories.push('Small Talk');
      updateConfidence(1.0);
    }

    // 3. User Status Positive
    const exactStatusPos = /\b(i am fine|i am good|i'm good|im good|im fine|doing well|happy today|doing fine|feeling good|feeling great|glad|happy|i am happy|i'm happy|im happy|i got a job|i passed|i am excited|i'm excited|im excited)\b/i.test(normalized) ||
                            /^(great|awesome|fantastic|excellent)$/i.test(normalized);
    if (exactStatusPos) {
      categories.push('User Status Positive');
      updateConfidence(1.0);
    }

    // 4. User Status Negative
    const exactStatusNeg = /\b(i am not well|im not well|i'm not well|i am sad|i'm sad|im sad|feeling stressed|feeling low|bad day|i am tired|i'm tired|im tired|not okay|not ok|i am frustrated|i'm frustrated|im frustrated|i am confused|i'm confused|im confused|i failed|i am stressed|i'm stressed|im stressed)\b/i.test(normalized);
    if (exactStatusNeg) {
      categories.push('User Status Negative');
      updateConfidence(1.0);
    }

    // 5. Bot Introduction
    const exactBotIntro = /\b(kaira|kiara|kyra|kyaraa|kera|who are you|who are u|tell me about yourself|introduce yourself|your name|what is your name|are you a bot|are you bot|are you chatbot|are you a chatbot|are you assistant|are you an assistant|are you ai|are you an ai|are you ai bot|are you ai assistant|are you human|are you real|what are you|what is ur name|ur name|who created you|who made you|who is kaira|what is kaira)\b/i.test(normalized) ||
                          /^(are you|r u|r you)\s+(a\s+)?(bot|chatbot|assistant|ai|human|real)$/i.test(normalized);
    if (exactBotIntro) {
      categories.push('Bot Intro');
      updateConfidence(1.0);
    }

    // 6. Capabilities
    const exactCap = /\b(what can you do|how can you help|how do you help|how can you help me|can you help me|what do you know|what are your capabilities|capabilities|what do you do|what do you do for living|what do you do for a living|what is your job|what's your job|assist me|guide me|show your capabilities)\b/i.test(normalized);
    if (exactCap) {
      categories.push('Capabilities');
      updateConfidence(1.0);
    }

    // 7. Compliments & Appreciation
    const exactCompliment = /\b(love you|love u|like you|like u|nice|great|awesome|cool|excellent|amazing|perfect|fantastic|wonderful|glad|happy|good job|well done|nice work|helpful|supportive|keep it up|great assistant|you're helpful|youre helpful|you are helpful|love your responses)\b/i.test(normalized);
    if (exactCompliment && categories.length === 0) {
      categories.push('Compliments');
      updateConfidence(1.0);
    }

    // 8. Motivation
    const exactMotivation = /\b(motivate me|need motivation|inspire me|give me a quote|feeling lazy|need encouragement|motivate|inspiration)\b/i.test(normalized);
    if (exactMotivation) {
      categories.push('Motivation');
      updateConfidence(1.0);
    }

    // 9. Jokes
    const exactJoke = /\b(tell me a joke|make me laugh|funny joke|say something funny|tell a joke|joke)\b/i.test(normalized);
    if (exactJoke) {
      categories.push('Jokes');
      updateConfidence(1.0);
    }

    // 10. Conversation Continuation
    const exactCont = /\b(ok|okay|cool|sure|sounds good|let's go|lets go|go ahead|continue|proceed)\b/i.test(normalized);
    if (exactCont) {
      categories.push('Conversation Continuation');
      updateConfidence(1.0);
    }

    // 11. Gratitude (Thanks)
    const exactThanks = /\b(thanks|thank you|thnx|tnx|thanx|thankyou|appreciate|appreciated|appreciate it|much appreciated|thanks buddy|thank you so much|many thanks|cheers)\b/i.test(normalized);
    if (exactThanks) {
      categories.push('Thanks');
      updateConfidence(1.0);
    }

    // 12. Farewell
    const exactFarewell = /\b(bye|goodbye|see you|see ya|take care|catch you later|talk to you later|have a nice day|talk later|bye bye|see you later|farewell)\b/i.test(normalized);
    if (exactFarewell) {
      categories.push('Farewell');
      updateConfidence(1.0);
    }

    // 13. Greetings
    const exactTime = /\b(good morning|good afternoon|good evening|good night|morning|afternoon|evening|eve|night)\b/i.test(normalized);
    if (exactTime) {
      categories.push('Time Based');
      updateConfidence(1.0);
    }
    const exactIndian = /\b(namaste|namaskar|ram ram|pranam|sat sri akal|vanakkam|kem cho|salaam|salam|adaab|jai shree ram)\b/i.test(normalized);
    if (exactIndian) {
      categories.push('Indian');
      updateConfidence(1.0);
    }
    const rawCheck = (context.originalQuery || context.cleanQuery || query).toLowerCase();
    const exactHinglish = /\b(kaise ho|kaisi ho|kya haal hai|aur bhai|hi bhai|hello dost|good morning bhai|namaste yaar)\b/i.test(rawCheck);
    if (exactHinglish) {
      categories.push('Hinglish');
      updateConfidence(1.0);
    }
    const exactStandard = /\b(hi|hello|hey|yo|sup|wassup|wasup|what's up|whats up|what is up|greetings|hola|bonjour|howdy|ciao|welcome|heya|good day|hello sir|hello madam|hello team|hello assistant|hi ai)\b/i.test(normalized);
    if (exactStandard) {
      categories.push('Standard');
      updateConfidence(1.0);
    }

    // Deduplicate and maintain logical order
    const orderedCategories: GreetingCategory[] = [];
    const order: GreetingCategory[] = [
      'Standard', 'Time Based', 'Indian', 'Hinglish', 'Small Talk',
      'User Status Positive', 'User Status Negative', 'Bot Intro',
      'Capabilities', 'Compliments', 'Motivation', 'Jokes',
      'Conversation Continuation', 'Thanks', 'Farewell', 'Help', 'Appreciation', 'Emoji'
    ];
    for (const cat of order) {
      if (categories.includes(cat) && !orderedCategories.includes(cat)) {
        orderedCategories.push(cat);
      }
    }

    return {
      categories: orderedCategories,
      confidence: maxConfidence
    };
  }

  private extractResidualQuery(query: string, categories: GreetingCategory[]): { residual: string, matchedGreeting: string } {
    let clean = query.toLowerCase().trim();
    
    const greetingPhrases = [
      // Greetings
      "good morning sir", "good morning team", "good morning bhai",
      "good afternoon", "good evening", "good night", "good morning",
      "hello assistant", "hello madam", "hello team", "hello dost", "hello ji",
      "hello sir", "hi ai", "greetings", "wassup",
      "whats up", "what's up", "hey there", "good day", "jai shree ram",
      "sat sri akal", "pranam ji", "namaste ji", "namaste yaar", "ram ram ji",
      "hi", "hello", "hey", "yo", "sup", "hola", "bonjour", "howdy", "ciao",
      "welcome", "heya", "hii", "heyy", "helo", "hlo", "hy", "morning", "afternoon",
      "evening", "eve", "night", "gm", "gn", "ga", "ge", "namaste", "namaskar",
      "ram ram", "pranam", "vanakkam", "kem cho", "salaam", "salam", "adaab",

      // Small Talk
      "how are you", "how r u", "how're you", "how is it going", "how's it going",
      "everything good", "are you okay", "what are you doing", "how have you been",
      "how is your day", "how's life", "long time no see",

      // Positive status
      "i am fine", "i am good", "i'm good", "im good", "im fine", "doing well", "happy today",
      "doing fine", "feeling good", "feeling great", "great", "awesome",
      "fantastic", "excellent", "glad", "happy",

      // Negative status
      "i am not well", "im not well", "i'm sad", "im sad", "feeling stressed",
      "feeling low", "bad day", "i am tired", "i'm tired", "im tired", "not okay", "not ok",
      "i'm frustrated", "im frustrated", "i'm confused", "im confused",

      // Bot Intro
      "who are you", "who are u", "tell me about yourself", "introduce yourself",
      "your name", "what is your name", "are you a bot", "are you ai", "who created you",

      // Capabilities
      "what can you do", "how can you help", "can you help me", "what do you know",
      "what are your capabilities", "capabilities", "what do you do", "help",

      // Compliments
      "good job", "well done", "great assistant", "you're helpful", "you are helpful",
      "love your responses", "keep it up", "amazing",

      // Motivation
      "motivate me", "need motivation", "inspire me", "give me a quote",
      "feeling lazy", "need encouragement", "motivate", "inspiration",

      // Jokes
      "tell me a joke", "make me laugh", "funny joke", "say something funny",
      "tell a joke", "joke",

      // Continuation
      "ok", "okay", "cool", "sure", "sounds good", "let's go", "lets go",
      "go ahead", "continue", "proceed",

      // Thanks & Goodbye
      "thank you so much", "thanks a lot", "many thanks", "thank you",
      "appreciate it", "much appreciated", "appreciate", "appreciated", "thanks buddy", "thanks", "cheers",
      "bye bye", "see you", "see ya", "take care", "catch you later", "talk to you later",
      "have a nice day", "bye", "goodbye", "byee", "farewell"
    ];

    let matchedGreeting = "";
    const sortedPhrases = [...greetingPhrases].sort((a, b) => b.length - a.length);
    
    let stripped = clean;
    for (const phrase of sortedPhrases) {
      const escapedPhrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
      if (regex.test(stripped)) {
        if (!matchedGreeting) {
          const matchResult = clean.match(regex);
          if (matchResult) {
            matchedGreeting = matchResult[0];
          }
        }
        stripped = stripped.replace(regex, "").trim();
      }
    }
    
    stripped = stripped.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u2700-\u27BF\uFE00-\uFE0F]/gu, '').replace(/\s+/g, ' ').trim();
    
    return {
      residual: stripped,
      matchedGreeting: matchedGreeting || clean
    };
  }

  private buildNotDetected(): GreetingDetectionDetails {
    return {
      detected: false,
      category: 'Standard',
      confidence: 0,
      hasBusinessIntent: false,
      residualQuery: '',
      residualTokens: [],
    };
  }
}
