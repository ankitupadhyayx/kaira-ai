import { INormalizerStage } from '../interfaces/INormalizer';
import { NormalizationUtils } from '../utils/normalization.utils';
import { TokenValidator } from '../utils/token-validator.utils';
import spellData from '../../data/spell-dictionary.json';

export interface SpellCorrectionRecord {
  original: string;
  replacement: string;
  confidence: number;
}

export interface SymSpellResult {
  text: string;
  corrections: SpellCorrectionRecord[];
  confidenceScore: number;
}

/**
 * Enterprise SymSpell (Symmetric Delete) Spell Checker.
 * Performs sub-millisecond O(1) dictionary deletion lookups for edit distances up to 2.
 */
export class SymSpellChecker implements INormalizerStage<string, SymSpellResult> {
  public readonly name = 'SymSpellChecker';

  private readonly maxEditDistance = 2;
  private readonly dictionary: Set<string> = new Set();
  private readonly deleteDictionary: Map<string, string[]> = new Map();
  private readonly customTypoMap: Map<string, string> = new Map();

  constructor() {
    this.initializeDictionary();
  }

  private initializeDictionary(): void {
    // 1. Load dictionary words from spell-dictionary.json
    const vocabList: string[] = (spellData as any).words || [];
    for (const w of vocabList) {
      if (w && w.trim()) {
        this.dictionary.add(w.toLowerCase().trim());
      }
    }

    // 2. Add domain-specific terms
    const domainTerms = [
      'hi', 'hey', 'hello', 'bye', 'yo', 'sup', 'wassup', 'hola', 'greetings', 'namaste', 'morning', 'afternoon', 'evening', 'night', 'gm', 'gn',
      'goodbye', 'thanks', 'thankyou', 'welcome', 'services', 'service', 'mobiloitte',
      'me', 'am', 'it', 'is', 'in', 'on', 'at', 'to', 'for', 'of', 'be', 'do', 'so', 'up', 'my', 'we', 'he', 'she', 'us', 'an', 'as', 'by', 'if', 'or', 'so',
      'not', 'you', 'your', 'what', 'how', 'who', 'when', 'where', 'why', 'amazing', 'work', 'can', 'i',
      'care', 'fine', 'well', 'good', 'joke', 'laugh', 'job', 'done', 'nice', 'day', 'time', 'see', 'talk', 'take', 'make', 'going',
      'feel', 'feeling', 'tired', 'stressed', 'quote', 'motivate', 'inspire', 'great', 'awesome', 'cool', 'sure', 'okay',
      'cheers', 'appreciated', 'appreciate', 'glad', 'happy', 'ya', 'later', 'catch', 'soon', 'farewell', 'apply', 'application', 'internship', 'intern',
      'technology', 'technologies', 'company', 'leadership', 'career', 'careers',
      'hiring', 'support', 'contact', 'location', 'address', 'office', 'offices',
      'blockchain', 'javascript', 'typescript', 'python', 'react', 'node', 'spring',
      'devops', 'cloud', 'computing', 'artificial', 'intelligence', 'machine', 'learning',
      'generative', 'agentic', 'microservices', 'kubernetes', 'docker', 'terraform',
      'developer', 'senior', 'junior', 'manager', 'director', 'founder', 'history',
      'business', 'overview', 'organization', 'background', 'introduction', 'intro', 'details', 'enterprise', 'profile',
      'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'chro', 'hr', 'owner', 'boss', 'management', 'executive', 'executives', 'directors', 'head', 'team', 'board',
      'skills', 'skill', 'tools', 'tool', 'frontend', 'backend', 'fullstack', 'architecture',
      'genai', 'llm', 'nlp', 'cv', 'rag', 'ocr', 'asr', 'tts', 'ar', 'vr', 'xr', 'api', 'sdk', 'rest', 'graphql', 'db', 'sql', 'nosql', 'iac', 'qc', 'uiux', 'fe', 'be', 'fs', 'sde', 'k8s', 'flutter', 'kotlin', 'swift', 'nextjs', 'angular', 'vue',
      'express', 'ethereum', 'polygon', 'solidity', 'hyperledger', 'crypto', 'tokenization',
      'aws', 'azure', 'gcp', 'cicd', 'embedded', 'iiot', 'erp', 'crm', 'saas', 'ui', 'ux', 'figma',
      'wireframe', 'prototype', 'qa', 'selenium', 'offshore', 'augmentation', 'ai', 'ml', 'dl',
      'deep', 'large', 'smart', 'cross', 'remote', 'manual', 'automation', 'user', 'interface', 'experience', 'application', 'contract',
      'app', 'apps', 'hire', 'hiring', 'chatbot', 'chatbots', 'ios', 'testing', 'test', 'tests', 'next', 'js', 'team', 'teams', 'dev', 'developers', 'developer', 'autonomous', 'agent', 'agents',
      'internship', 'internships', 'intern', 'vacancies', 'vacancy', 'recruitment', 'career', 'careers', 'resume', 'cv', 'jd', 'faq', 'eta', 'poc', 'web3', 'dapp', 'nft', 'dao', 'defi', 'evm', 'btc', 'eth', 'applicant', 'eligibility', 'benefits', 'perks', 'trainee', 'interview', 'rounds', 'openings', 'opening',
      'join', 'employment', 'criteria', 'promotion', 'promotions', 'culture', 'careeer', 'carer', 'carrer', 'aply', 'full', 'life', 'positions', 'portal', 'coding', 'open',
      'office', 'offices', 'location', 'locations', 'address', 'headquarters', 'headquarter', 'hq', 'branches', 'branch', 'noida', 'delhi', 'okhla', 'dubai', 'london', 'singapore', 'registered', 'corporate',
      'adrss', 'adress', 'addres', 'locaton', 'offce', 'offic', 'headquater', 'headquaters', 'brnches', 'branhes', 'dubia', 'singapor',
      'certifications', 'certification', 'certified', 'iso', 'cmmi', 'compliance', 'gdpr', 'hipaa', 'standards', 'awards', 'award', 'recognition', 'achievements', 'accolades', 'honors', 'clutch', 'goodfirms', 'ratings', 'rankings', 'certificaton', 'certfications', 'recogntion', 'achivments', 'goodfirm',
      'contact', 'email', 'phone', 'helpline', 'quotation', 'proposal', 'consultation', 'meeting', 'demo', 'support', 'partnership', 'investor', 'media', 'contct', 'contect', 'cntact', 'emial', 'eamil', 'phne', 'numbr', 'suport', 'supprt', 'projct', 'quatation', 'proposel', 'consultion', 'meting', 'demoo', 'report', 'issue', 'bug', 'touch', 'reach', 'talk', 'call', 'build', 'hire', 'developers', 'dedicated', 'inquiry', 'rfp', 'rfi', 'sales', 'number', 'tesla', 'mobiloitte', 'mobiloite', 'mobilotte', 'mobilloitte', 'mobiloitee', 'mobiliotte', 'moblioitte', 'mobillotte', 'mobillite', 'mobiloit', 'mobiliot'
    ];

    for (const term of domainTerms) {
      this.dictionary.add(term.toLowerCase());
    }

    // 3. Load explicit typo mappings
    const rawTypos: Record<string, string> = (spellData as any).commonTypos || {};
    for (const [typo, replacement] of Object.entries(rawTypos)) {
      this.customTypoMap.set(typo.toLowerCase(), replacement.toLowerCase());
    }

    // Add additional domain typo mappings specified in enterprise requirements
    const enterpriseTypos: Record<string, string> = {
      'helo': 'hello',
      'helllo': 'hello',
      'helllll': 'hello',
      'helloooo': 'hello',
      'helllllooooo': 'hello',
      'helooooooo': 'hello',
      'halo': 'hello',
      'hallo': 'hello',
      'hullo': 'hello',
      'hlo': 'hello',
      'hy': 'hi',
      'hiii': 'hi',
      'hiiii': 'hi',
      'hiiiiiiiii': 'hi',
      'heyy': 'hey',
      'heyyy': 'hey',
      'heyyyy': 'hey',
      'heyyyyyy': 'hey',
      'gud': 'good',
      'god': 'good',
      'gud mrng': 'good morning',
      'gmorning': 'good morning',
      'gud evng': 'good evening',
      'thakyou': 'thank you',
      'thankuu': 'thank you',
      'thankyou': 'thank you',
      'thanx': 'thanks',
      'tnx': 'thanks',
      'thnx': 'thanks',
      'thx': 'thanks',
      'moring': 'morning',
      'mornign': 'morning',
      'servuce': 'services',
      'servuces': 'services',
      'servvice': 'services',
      'servicess': 'services',
      'servic': 'services',
      'servics': 'services',
      'srvice': 'services',
      'servis': 'services',
      'servise': 'services',
      'blockchan': 'blockchain',
      'blockchein': 'blockchain',
      'blokchain': 'blockchain',
      'blok chain': 'blockchain',
      'blok': 'block',
      'machin': 'machine',
      'machien': 'machine',
      'genrative': 'generative',
      'generativ': 'generative',
      'artifical': 'artificial',
      'mobilloite': 'mobiloitte',
      'mobilotte': 'mobiloitte',
      'mobiloite': 'mobiloitte',
      'mobiloitee': 'mobiloitte',
      'mobiloit': 'mobiloitte',
      'mobiliotte': 'mobiloitte',
      'computng': 'computing',
      'sprng': 'spring',
      'javscript': 'javascript',
      'pyhton': 'python',
      'wat': 'what',
      'cn': 'can',
      'yu': 'you',
      'hw': 'how',
      'ceo naem': 'ceo name',
      'ceoo': 'ceo',
      'ceeo': 'ceo',
      'fouder': 'founder',
      'foundr': 'founder',
      'foundar': 'founder',
      'founderr': 'founder',
      'leadrship': 'leadership',
      'ledership': 'leadership',
      'mangement': 'management',
      'managment': 'management',
      'executve': 'executive',
      'offering': 'offerings',
      'offrings': 'offerings',
      'soltions': 'solutions',
      'soluations': 'solutions',
      'devlopment': 'development',
      'developmnt': 'development',
      'capabilties': 'capabilities',
      'expertize': 'expertise',
      'softwere': 'software',
      'softwar': 'software',
      'aplication': 'application',
      'enginering': 'engineering',
      'consultng': 'consulting',
      'digitel transformation': 'digital transformation',
      'technolgies': 'technologies',
      'techonology': 'technology',
      'teck': 'tech',
      'teck stack': 'tech stack',
      'framwork': 'framework',
      'framworks': 'frameworks',
      'libaries': 'libraries',
      'langauges': 'languages',
      'programing': 'programming',
      'programing language': 'programming language',
      'databse': 'database',
      'platfrom': 'platform',
      'artifical intelligence': 'artificial intelligence',
      'genrative ai': 'generative ai',
      'generativ ai': 'generative ai',
      'gen ai': 'generative ai',
      'machin learning': 'machine learning',
      'deep learnng': 'deep learning',
      'etherum': 'ethereum',
      'reactjs': 'react',
      'react js': 'react',
      'next js': 'nextjs',
      'fluter': 'flutter',
      'andrid': 'android',
      'ioss': 'ios',
      'dockr': 'docker',
      'kubernets': 'kubernetes',
      'devopss': 'devops',
      'terrform': 'terraform',
      'iott': 'iot',
      'enterprize software': 'enterprise software',
      'wirefram': 'wireframe',
      'selenim': 'selenium',
      'cyber securty': 'cybersecurity'
    };

    for (const [typo, replacement] of Object.entries(enterpriseTypos)) {
      this.customTypoMap.set(typo.toLowerCase(), replacement.toLowerCase());
    }

    // 4. Index deletion variants for SymSpell O(1) lookups
    for (const word of this.dictionary) {
      if (word.length >= 3) {
        this.indexWordDeletes(word);
      }
    }
  }

  private indexWordDeletes(word: string): void {
    const deletes = this.generateDeletes(word, this.maxEditDistance);
    for (const del of deletes) {
      let list = this.deleteDictionary.get(del);
      if (!list) {
        list = [];
        this.deleteDictionary.set(del, list);
      }
      if (!list.includes(word)) {
        list.push(word);
      }
    }
  }

  private generateDeletes(word: string, distance: number): Set<string> {
    const deletes = new Set<string>();
    if (word.length <= 1) return deletes;

    const queue: Array<{ str: string; depth: number }> = [{ str: word, depth: 0 }];
    const visited = new Set<string>([word]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth >= distance) continue;

      for (let i = 0; i < current.str.length; i++) {
        const del = current.str.substring(0, i) + current.str.substring(i + 1);
        if (del.length >= 3 && !visited.has(del)) {
          visited.add(del);
          deletes.add(del);
          queue.push({ str: del, depth: current.depth + 1 });
        }
      }
    }

    return deletes;
  }

  /**
   * Collapse repeated character runs >= 3 down to 1 or 2 characters.
   */
  public collapseElongations(token: string): string {
    if (!token || token.length < 3) return token;
    
    // Check single run collapse for 2+ repeated characters (e.g., 'hiiii' -> 'hi', 'heyyyy' -> 'hey')
    const singleRun = token.replace(/(.)\1+/g, '$1');
    if (this.dictionary.has(singleRun.toLowerCase()) || this.customTypoMap.has(singleRun.toLowerCase())) {
      return singleRun;
    }

    // Collapse 3+ repeated characters down to 1
    const collapsedOnce = token.replace(/(.)\1{2,}/g, '$1');
    if (this.dictionary.has(collapsedOnce.toLowerCase()) || this.customTypoMap.has(collapsedOnce.toLowerCase())) {
      return collapsedOnce;
    }

    // Collapse 3+ repeated characters down to 2 (e.g., 'good')
    const collapsedTwice = token.replace(/(.)\1{2,}/g, '$1$1');
    if (this.dictionary.has(collapsedTwice.toLowerCase()) || this.customTypoMap.has(collapsedTwice.toLowerCase())) {
      return collapsedTwice;
    }

    return collapsedOnce;
  }

  public correctToken(token: string): { replacement: string; confidence: number } {
    if (!token || token.length < 2 || !/^[a-zA-Z]+$/.test(token)) {
      return { replacement: token, confidence: 1.0 };
    }

    // Short Token Guard: Ignore unapproved tokens shorter than 3 characters
    if (token.length <= 2 && TokenValidator.isUnapprovedShortToken(token)) {
      return { replacement: token, confidence: 1.0 };
    }

    const lower = token.toLowerCase();

    // 1. Direct dictionary match
    if (this.dictionary.has(lower)) {
      return { replacement: lower, confidence: 1.0 };
    }

    // 2. Direct custom typo mapping
    if (this.customTypoMap.has(lower)) {
      return { replacement: this.customTypoMap.get(lower)!, confidence: 0.99 };
    }

    // 3. Elongation collapsing
    const collapsed = this.collapseElongations(lower);
    if (this.dictionary.has(collapsed)) {
      return { replacement: collapsed, confidence: 0.98 };
    }
    if (this.customTypoMap.has(collapsed)) {
      return { replacement: this.customTypoMap.get(collapsed)!, confidence: 0.97 };
    }

    // 4. SymSpell deletion variant lookup
    const candidates = new Map<string, number>(); // word -> best distance
    const inputDeletes = this.generateDeletes(collapsed, this.maxEditDistance);
    inputDeletes.add(collapsed);

    for (const del of inputDeletes) {
      const matches = this.deleteDictionary.get(del);
      if (matches) {
        for (const match of matches) {
          if (Math.abs(match.length - collapsed.length) > this.maxEditDistance) continue;
          const dist = NormalizationUtils.damerauLevenshteinDistance(collapsed, match);
          if (dist <= this.maxEditDistance) {
            const currentBest = candidates.get(match);
            if (currentBest === undefined || dist < currentBest) {
              candidates.set(match, dist);
            }
          }
        }
      }
    }

    if (candidates.size > 0) {
      let bestMatch = '';
      let minDistance = 99;

      for (const [cand, dist] of candidates.entries()) {
        if (dist < minDistance) {
          minDistance = dist;
          bestMatch = cand;
        } else if (dist === minDistance) {
          // Prefer candidate sharing prefix
          if (cand.charAt(0) === collapsed.charAt(0) && bestMatch.charAt(0) !== collapsed.charAt(0)) {
            bestMatch = cand;
          }
        }
      }

      if (bestMatch && minDistance <= this.maxEditDistance) {
        const confidence = minDistance === 1 ? 0.95 : 0.85;
        return { replacement: bestMatch, confidence };
      }
    }

    // No correction found — low confidence unknown token
    return { replacement: token, confidence: 0.10 };
  }

  public process(input: string): SymSpellResult {
    if (!input) return { text: '', corrections: [], confidenceScore: 1.0 };

    const corrections: SpellCorrectionRecord[] = [];
    let currentInput = input;

    // Check multi-word custom typo replacements (e.g., 'blok chain', 'gud mrng', 'gud evng')
    for (const [typo, replacement] of this.customTypoMap.entries()) {
      if (typo.includes(' ') && currentInput.toLowerCase().includes(typo)) {
        const regex = new RegExp(`\\b${typo.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(currentInput)) {
          corrections.push({ original: typo, replacement, confidence: 0.99 });
          currentInput = currentInput.replace(regex, replacement);
        }
      }
    }

    const tokens = currentInput.split(/(\b[a-zA-Z]+\b)/);
    let totalConfidenceSum = 0;
    let countedTokens = 0;

    const resultTokens = tokens.map((token) => {
      if (!/^[a-zA-Z]+$/.test(token)) return token;

      countedTokens++;
      const { replacement, confidence } = this.correctToken(token);
      totalConfidenceSum += confidence;

      if (replacement.toLowerCase() !== token.toLowerCase()) {
        corrections.push({
          original: token,
          replacement,
          confidence,
        });
        return replacement;
      }

      return token;
    });

    const averageConfidence = countedTokens > 0 ? totalConfidenceSum / countedTokens : 1.0;

    return {
      text: resultTokens.join(''),
      corrections,
      confidenceScore: averageConfidence,
    };
  }
}

export const symSpellChecker = new SymSpellChecker();
