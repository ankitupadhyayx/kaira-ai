import { ProcessingContext } from '../../normalization/types/processing-context.types';

export type DomainType = 'MOBILOITTE_DOMAIN' | 'GENERAL_CONVERSATION' | 'OUT_OF_DOMAIN' | 'GIBBERISH';

export interface DomainClassificationResult {
  domainType: DomainType;
  confidence: number;
  responseCandidate?: string;
  matchedCategory?: string;
}

export class DomainClassifier {
  private static readonly OUT_OF_DOMAIN_PATTERNS: Array<{ category: string; pattern: RegExp }> = [
    {
      category: 'Food & Dining',
      pattern: /\b(pizza|burger|food|restaurant|restaurants|zomato|swiggy|biryani|pasta|sushi|dominos|mcdonalds|kfc|dosa|recipe|recipes|cooking|dinner|lunch|breakfast|coffee|tea|cafe|pizza service|food service)\b/i,
    },
    {
      category: 'Healthcare & Medical',
      pattern: /\b(hospital|hospitals|doctor|doctors|medicine|medicines|medical clinic|pharma|patient appointment|health insurance|hospital services?|doctor services?)\b/i,
    },
    {
      category: 'Banking & Consumer Finance',
      pattern: /\b(bank|banking|savings account|credit card|debit card|personal loan|home loan|mortgage|atm|crypto trading|crypto exchange|stock market|bank services?|banking services?)\b/i,
    },
    {
      category: 'Sports & Games',
      pattern: /\b(ipl|cricket|sports|sport|football|soccer|basketball|tennis|badminton|match|score|world cup|virat|dhoni|rohit|messi|ronaldo|t20|stadium|tournament|games|gaming|playstation|xbox)\b/i,
    },
    {
      category: 'Real Estate & Housing',
      pattern: /\b(2 bhk|3 bhk|1 bhk|flat|apartment|real estate|rent|house for sale|property|plots|land for sale|builder|housing)\b/i,
    },
    {
      category: 'Entertainment & Movies & Music',
      pattern: /\b(movies|movie|cinema|netflix|actor|actress|film|films|song|songs|music|hollywood|bollywood|series|tv show|theater|box office)\b/i,
    },
    {
      category: 'Weather & Climate',
      pattern: /\b(weather|temperature|rain today|forecast|humidity|climate|rainfall|sunny|cloudy)\b/i,
    },
    {
      category: 'Travel & Transportation & Vehicles',
      pattern: /\b(flight|flights|hotel|hotels|hotel booking|resort|travel|cab|cabs|uber|ola|taxi|car|cars|vehicle|bus ticket|train ticket|vacation package|cab services?|hotel services?)\b/i,
    },
    {
      category: 'Education & Politics & General Non-Enterprise',
      pattern: /\b(school|schools|college|university|politics|political|election|elections|government news)\b/i,
    },
    {
      category: 'Math & Multiplication Tables & Utilities',
      pattern: /\b(table of \d+|multiplication table|math problem|solve equation|square root|trigonometry|calculus|algebra|\d+\s*[\+\-\*\/\^]\s*\d+)\b/i,
    },
    {
      category: 'Programming Puzzles & Riddles',
      pattern: /\b(programming puzzle|code puzzle|riddle|riddles|brain teaser|sudoku|crossword)\b/i,
    },
    {
      category: 'Jokes & Humor & Creative Writing',
      pattern: /\b(tell me a joke|tell a joke|make me laugh|funny joke|write a poem|poem about|write a story|song lyrics)\b/i,
    },
    {
      category: 'Translation',
      pattern: /\b(translate to|translate this|language translation|translation into)\b/i,
    },
    {
      category: 'General Knowledge & Trivia',
      pattern: /\b(who is president of|who is prime minister of|capital of [a-z]+|population of [a-z]+|who discovered|who invented|gk question|general trivia)\b/i,
    },
    {
      category: 'General Science & Uncontextualized Coding',
      pattern: /\b(explain recursion|what is photosynthesis|how does gravity work|how to sort array in|quicksort in python)\b/i,
    },
  ];

  private static readonly OUT_OF_DOMAIN_RESPONSES = [
    "I couldn't find information about this topic in Mobiloitte's enterprise knowledge base. As Mobiloitte's Enterprise AI Assistant, I specialize in Mobiloitte's software engineering services, AI/ML capabilities, technology stack, company leadership, and enterprise solutions.",
    "I'm Kaira, Mobiloitte's Enterprise AI Assistant. I don't have documentation or information about this topic in our enterprise knowledge base. My focus is strictly on Mobiloitte's technical expertise, engineering services, office locations, and corporate policies.",
    "No relevant information regarding this topic was found in Mobiloitte's enterprise knowledge base. As Mobiloitte's Enterprise AI Assistant, I am here to help you explore Mobiloitte's software development services, cloud solutions, and digital engineering practices.",
    "I focus on answering questions about Mobiloitte's corporate profile, technical expertise, software solutions, and careers. General web queries, math problems, or out-of-domain topics are outside Mobiloitte's enterprise knowledge base."
  ];

  public classify(context: ProcessingContext): DomainClassificationResult {
    const combinedQuery = `${context.originalQuery || ''} ${(context as any).rawInput || ''} ${context.cleanQuery || ''} ${context.normalizedQuery || ''}`.trim().toLowerCase();

    // Company Context Guard: If query contains explicit company/enterprise terms, it belongs to Mobiloitte domain
    const hasCompanyContext = /\b(mobiloitte|company|corporate|service|services|technology|technologies|pricing|leadership|ceo|founder|office|location|career|job|hiring|vacancies|policy|policies|leave|salary|payroll|project|case study)\b/i.test(combinedQuery);
    if (hasCompanyContext) {
      return {
        domainType: 'MOBILOITTE_DOMAIN',
        confidence: 1.0,
      };
    }

    // Check Gibberish metadata if present in context
    const gibberishMeta = (context as any).gibberishMetadata;
    if (gibberishMeta?.isGibberish) {
      return {
        domainType: 'GIBBERISH',
        confidence: gibberishMeta.overallConfidence || 0.95,
      };
    }

    // Check for Out Of Domain topics (Math, Tables, Puzzles, Weather, Jokes, Poems, Translation, Trivia, etc.)
    for (const rule of DomainClassifier.OUT_OF_DOMAIN_PATTERNS) {
      if (rule.pattern.test(combinedQuery)) {
        // Select deterministic response variation based on input text hash
        const index = Math.abs(this.hashCode(combinedQuery)) % DomainClassifier.OUT_OF_DOMAIN_RESPONSES.length;
        return {
          domainType: 'OUT_OF_DOMAIN',
          confidence: 0.95,
          matchedCategory: 'Out of Scope Domain',
          responseCandidate: DomainClassifier.OUT_OF_DOMAIN_RESPONSES[index],
        };
      }
    }

    // Default: Input belongs to Mobiloitte domain or general conversation
    return {
      domainType: 'MOBILOITTE_DOMAIN',
      confidence: 1.0,
    };
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
