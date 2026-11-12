import { EngineResult, IEngine } from '../../../shared/interfaces/engine.interface';
import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { IFastPathConfig } from '../interfaces/fast-path-config.interface';
import { IFastPathCache } from '../interfaces/fast-path-cache.interface';
import { IFastPathLogger } from '../interfaces/fast-path-logger.interface';
import { IFastPathMetrics } from '../interfaces/fast-path-metrics.interface';
import { DEFAULT_FAST_PATH_CONFIG, createFastPathConfig } from '../config/fast-path.config';
import { FastPathInMemoryCache } from '../caching/fast-path-in-memory.cache';
import { FastPathLogger } from '../telemetry/fast-path.logger';
import { FastPathMetrics } from '../telemetry/fast-path.metrics';
import { ILogger } from '../../../shared/interfaces/logger.interface';
import { FastPathCacheStats, FastPathIntentPayload, FastPathMatch, FastPathMetricsSnapshot } from '../types/fast-path.types';
import { ICandidateGenerator } from '../candidate-generator/contracts/candidate-generator.interface';
import { EnterpriseCandidateGenerator } from '../candidate-generator/services/enterprise-candidate.generator';
import { IIntentMatcher } from '../intent-matcher/contracts/intent-matcher.interface';
import { DeterministicIntentMatcher } from '../intent-matcher/services/deterministic-intent.matcher';

import { IMultiIntentEngine } from '../multi-intent/contracts/multi-intent-engine.interface';
import { EnterpriseMultiIntentEngine } from '../multi-intent/services/enterprise-multi-intent.engine';
import { IFastPathAnalytics } from '../analytics/contracts/fast-path-analytics.interface';
import { EnterpriseFastPathAnalytics } from '../analytics/services/enterprise-fast-path.analytics';
import { FastPathAnalyticsSnapshot } from '../analytics/types/fast-path-analytics.types';
import { FastPathStubEngine } from '../../../orchestration/fastpath-stub/fastpath.stub.engine';

export class FastPathEngine implements IEngine<EngineResult<FastPathIntentPayload>> {
  public readonly name: string = 'FastPathEngine';

  private config: IFastPathConfig;
  private readonly cache: IFastPathCache;
  private readonly logger?: IFastPathLogger;
  private readonly metrics?: IFastPathMetrics;
  private readonly analytics?: IFastPathAnalytics;
  private readonly candidateGenerator: ICandidateGenerator;
  private readonly intentMatcher: IIntentMatcher;
  private readonly multiIntentEngine: IMultiIntentEngine;
  private readonly stubEngine: FastPathStubEngine;

  constructor(
    config?: Partial<IFastPathConfig>,
    cache?: IFastPathCache,
    logger?: IFastPathLogger | ILogger,
    metrics?: IFastPathMetrics,
    candidateGenerator?: ICandidateGenerator,
    intentMatcher?: IIntentMatcher,
    multiIntentEngine?: IMultiIntentEngine,
    analytics?: IFastPathAnalytics
  ) {
    this.config = createFastPathConfig(config);
    this.cache = cache || new FastPathInMemoryCache(this.config.maxCacheSize, this.config.cacheTtlMs);

    if (logger) {
      if ('logMatchAttempt' in logger) {
        this.logger = logger as IFastPathLogger;
      } else {
        this.logger = new FastPathLogger(logger as ILogger);
      }
    }
    this.metrics = metrics || new FastPathMetrics();
    this.analytics = analytics || new EnterpriseFastPathAnalytics();
    this.candidateGenerator = candidateGenerator || new EnterpriseCandidateGenerator();
    this.intentMatcher = intentMatcher || new DeterministicIntentMatcher();
    this.multiIntentEngine = multiIntentEngine || new EnterpriseMultiIntentEngine(undefined, undefined, this.candidateGenerator, this.intentMatcher);
    this.stubEngine = new FastPathStubEngine();
  }

  public static resolveIntentResponse(intentId: string, query: string = '', template?: string, defaultCategory: string = ''): string {
    const q = (query || '').toLowerCase();

    if (['LEADERSHIP_INFO', 'LEADERSHIP.CEO', 'LEADERSHIP.CTO', 'LeadershipInquiry', 'leadership_info_intent'].includes(intentId)) {
      if (/(founder|who founded|who started|who created|founding|fouder|foundr|foundar|founderr)/i.test(q)) {
        return `Mobiloitte was founded by Jagdish Harsh in 2004.\nHe continues to lead the company as Founder & Group CEO.`;
      }
      if (/(owner|who owns|ownership|malik)/i.test(q)) {
        return `Mobiloitte is owned and led by Mr. Jagdish Harsh, who serves as the Founder & Group CEO.`;
      }
      if (/(leadership|management|executive|board|directors|lead team|company head|top management)/i.test(q) && !/\bceo\b/i.test(q)) {
        return `Mobiloitte is led by Founder & Group CEO Jagdish Harsh, supported by an experienced executive leadership team.`;
      }
      return `Jagdish Harsh is the Founder & Group CEO of Mobiloitte, leading global strategy and software engineering operations since founding the company in 2004.`;
    }
    if (['COMPANY_PROFILE', 'COMPANY.INFO', 'company_profile_intent'].includes(intentId)) {
      return `Mobiloitte is an AI-first software engineering company established in 2004.\n• 20+ years of experience & 500+ software engineers\n• Global offices in India (HQ), USA, UK, UAE, and Singapore\n• Website: [www.mobiloitte.com](https://www.mobiloitte.com)`;
    }
    if (['INTERNSHIPS', 'CAREER.INTERNSHIP', 'internships_intent'].includes(intentId) || /(intern|internship)/i.test(q)) {
      return `Mobiloitte Internships & Industrial Training:\nExplore internship and training opportunities for students and graduates.\n• Careers Portal: [mobiloitte.com/careers](https://mobiloitte.com/careers)\n• Submit CV: hr@mobiloitte.com`;
    }
    if (['CAREERS', 'careers_intent', 'CAREER.TRAINING', 'JOB_APPLICATION'].includes(intentId)) {
      return `Mobiloitte Careers:\nExplore open technology roles and engineering positions at Mobiloitte.\n• Careers Portal: [mobiloitte.com/careers](https://mobiloitte.com/careers)\n• Submit CV: hr@mobiloitte.com`;
    }
    if (['OFFICE_OVERVIEW', 'COMPANY.LOCATION', 'LocationInquiry', 'office_overview_intent', 'HEADQUARTERS', 'INDIA_OFFICE', 'USA_OFFICE', 'UK_OFFICE', 'UAE_OFFICE', 'SINGAPORE_OFFICE', 'GLOBAL_OFFICES', 'OFFICE_ADDRESS'].includes(intentId)) {
      if (/(headquarters|hq)/i.test(q)) {
        return `Mobiloitte Corporate Headquarters:\nPocket D, Okhla Phase I, Okhla Industrial Estate, New Delhi, Delhi 110020, India.\n• Phone: +91-9999525501 | +91-11-49998888\n• Email: sales@mobiloitte.com`;
      }
      return `Mobiloitte Global Offices:\n• Corporate HQ: New Delhi, India (Okhla Phase I)\n• Regional Hubs: USA (Boston), UK (London), UAE (Dubai), and Singapore\n• Website: [www.mobiloitte.com](https://www.mobiloitte.com)`;
    }
    if (['WEBSITE', 'OFFICIAL_WEBSITE', 'website_intent'].includes(intentId) || /(^\s*website\s*$|official website|company website)/i.test(q)) {
      return `Mobiloitte Official Portals:\n• Main Website: [www.mobiloitte.com](https://www.mobiloitte.com)\n• Careers Portal: [mobiloitte.com/careers](https://mobiloitte.com/careers)\n• Support Portal: [support.mobiloitte.com](https://support.mobiloitte.com)`;
    }
    if (['GENERAL_CONTACT', 'CONTACT.EMAIL', 'ContactInquiry', 'general_contact_intent', 'SALES_CONTACT', 'BUSINESS_INQUIRY', 'PROJECT_DISCUSSION', 'PROJECT_PROPOSAL', 'CONSULTATION', 'BOOK_MEETING', 'BOOK_DEMO', 'HR_CONTACT', 'OFFICE_PHONE', 'EMAIL_CONTACT', 'HEADQUARTERS_CONTACT', 'CONTACT_OVERVIEW'].includes(intentId)) {
      if (/(hr|career|job)/i.test(q)) {
        return `Mobiloitte Careers & HR Contact:\n• Email: hr@mobiloitte.com\n• Careers Portal: [mobiloitte.com/careers](https://mobiloitte.com/careers)`;
      }
      return `Mobiloitte Official Contacts:\n• Sales Email: sales@mobiloitte.com | Phone: +91-9999525501\n• Support Email: support@mobiloitte.com | Phone: +91-11-49998888\n• HR Email: hr@mobiloitte.com\n• Headquarters: Pocket D, Okhla Phase I, New Delhi, India`;
    }
    if (['TECHNICAL_SUPPORT', 'SUPPORT.HELP', 'CUSTOMER_SUPPORT', 'CLIENT_SUPPORT'].includes(intentId)) {
      return `Mobiloitte Technical Support Desk:\n• Email: support@mobiloitte.com\n• Support Line: +91-11-49998888\n• Portal: [support.mobiloitte.com](https://support.mobiloitte.com)`;
    }
    return template || defaultCategory;
  }

  public process(context: ProcessingContext, sessionId?: string): EngineResult<FastPathIntentPayload> {
    const startTime = Date.now();
    const query = (context.normalizedQuery || context.cleanQuery || context.originalQuery || '').trim();

    this.logger?.logMatchAttempt(query, sessionId);

    if (!this.config.enabled || !query) {
      const duration = Date.now() - startTime;
      this.metrics?.recordMiss(duration);
      return this.buildUnhandledResult(query, duration);
    }

    // ── DOCUMENT-KNOWLEDGE GUARD ───────────────────────────────────────────────
    // ALL topics below are served EXCLUSIVELY by Enterprise RAG (pgvector + Gemini).
    // FastPath must NEVER answer them. Return unhandled → KnowledgeEngine → RAG.
    const RAG_ONLY_PATTERNS = [
      /\b(service|services|technology|technologies|tech\s+stack|pricing|price|cost|quote|budget|rate|pricing_inquiry)\b/i,
      /\b(leave|leaves|sick\s+leave|casual\s+leave|vacation|holiday|holidays|attendance|salary|payroll|compensation|ctc|increment|appraisal|hike|insurance|medical\s+cover|health\s+cover|maternity|paternity|parental|bereavement|wfh|remote\s+work|hybrid\s+policy|leave\s+encashment|leave\s+balance)\b/i,
      /\b(password|mfa|multi-factor|authentication|access\s+control|sso|security\s+policy|cyber\s+security|gdpr|nda|non-disclosure|confidentiality|hipaa|soc\s*2|cmmi|compliance\s+audit|accreditation)\b/i,
      /\b(machine\s+learning|deep\s+learning|computer\s+vision|generative\s+ai|gen\s*ai|llm|gpt|ai\s+agent|prompt\s+engineering|rag|retrieval\s+augmented|blockchain\s+solution|smart\s+contract|defi|web3|nft|hyperledger|ethereum|polygon|cloud\s+architecture|cloud\s+native|cloud\s+migration|devops|kubernetes|docker|microservice|terraform|test\s+automation|selenium|figma|embedded\s+system)\b/i,
      /\b(web\s+development|flutter|react|angular|vue|node|express|spring\s+boot|java|python|mobile\s+app|mobile\s+development|android|ios|kotlin|swift|ci\/cd|bitrise|fastlane|github\s+actions|database|postgresql|mongodb|redis|architecture)\b/i,
      /\b(edtech|healthtech|medtech|fintech|banking\s+solution|proptech|manufacturing\s+industry|healthcare|education|manufacturing)\b/i,
      /\b(milestone|milestones|company\s+history|certifications|certification|accolades|delivery\s+statistics|project\s+statistics|business\s+metrics|sdlc|scrum|agile\s+process|case\s+studies|portfolio|awards|delivery\s+model|engineering\s+practices)\b/i,
      /\b(data\s+engineering|analytics|data\s+pipeline|data\s+lakehouse|lakehouse|etl|elt|snowflake|databricks|bigquery|data\s+modeling|business\s+intelligence|iot|internet\s+of\s+things|edge\s+computing|telemetry|embedded\s+systems|firmware|mqtt|coap|kafka|flink|spark|ui\s*\/\s*ux|design\s+systems|quality\s+engineering|chapter\s*\d+)\b/i,
    ];

    const rawAndClean = `${query} ${context.cleanQuery || ''} ${context.normalizedQuery || ''}`.toLowerCase();
    if (RAG_ONLY_PATTERNS.some((p) => p.test(rawAndClean))) {
      const duration = Date.now() - startTime;
      this.metrics?.recordMiss(duration);
      if (process.env.NODE_ENV !== 'test') {
        console.log('[RoutingDecisionEngine] Query:', query, '| Selected Route: RAG | Reason: RAG-Only Document Knowledge Pattern Matched');
      }
      return this.buildUnhandledResult(query, duration);
    }

    const cacheKey = query.toLowerCase();

    // Check Cache Infrastructure
    if (this.config.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.metrics?.recordCacheHit();
        this.logger?.logCacheHit(query, sessionId);
        return {
          ...cached,
          payload: cached.payload ? { ...cached.payload, cacheHit: true } : undefined,
        };
      }
      this.metrics?.recordCacheMiss();
      this.logger?.logCacheMiss(query, sessionId);
    }

    // Step 1: Check Multi-Clause Multi-Intent Processing (Stage 6.8)
    const multiResult = this.multiIntentEngine.processMultiIntent(context, sessionId);
    const unrecognized = (multiResult.metadata as any)?.unrecognizedSegments || [];

    // If any unrecognized segment touches document knowledge patterns, bypass FastPath → RAG
    const hasRagPatternInUnrecognized = unrecognized.some((unrec: string) => RAG_ONLY_PATTERNS.some((p) => p.test(unrec)));
    if (hasRagPatternInUnrecognized) {
      const duration = Date.now() - startTime;
      this.metrics?.recordMiss(duration);
      return this.buildUnhandledResult(query, duration);
    }

    if (multiResult.isMultiIntent && (multiResult.orderedMatches.length > 1 || (multiResult.orderedMatches.length >= 1 && unrecognized.length >= 1))) {
      const duration = Date.now() - startTime;
      let combinedResponse = multiResult.orderedMatches.map((m) => m.response).join('\n\n---\n\n');
      if (unrecognized.length > 0) {
        const unrecNotice = `I couldn't find relevant information about this topic in the current enterprise knowledge base.`;
        combinedResponse = combinedResponse ? `${combinedResponse}\n\n---\n\n${unrecNotice}` : unrecNotice;
      }

      const result: EngineResult<FastPathIntentPayload> = {
        engineName: this.name,
        handled: true,
        confidence: multiResult.orderedMatches[0]?.confidence || 0.80,
        intent: multiResult.orderedMatches.map((m) => m.intentId).join(', '),
        category: 'Multi-Clause Intent Sequence',
        responseCandidate: combinedResponse,
        payload: {
          intents: multiResult.orderedMatches,
          primaryIntent: multiResult.orderedMatches[0],
          matchedCount: multiResult.orderedMatches.length,
          executionLatencyMs: duration,
          cacheHit: false,
        },
        metadata: {
          query,
          isMultiIntentClause: true,
          isMultiIntent: true,
          clauseCount: multiResult.segments.length,
          unrecognizedSegments: unrecognized,
        },
      };

      if (this.config.enableCache) {
        this.cache.set(cacheKey, result);
      }
      this.metrics?.recordMatch('MULTI_INTENT' as any, result.confidence, duration);
      return result;
    }

    // Step 2: Candidate Generation (Stage 6.5)
    const generationResult = this.candidateGenerator.generateCandidates(context, sessionId);

    // Step 3: Deterministic Intent Matching (Stage 6.5)
    const selectionResult = this.intentMatcher.matchBestIntent(generationResult, sessionId);

    const duration = Date.now() - startTime;

    // Strict 98% Confidence Threshold Guard (0.98) for FastPath execution
    const FASTPATH_MIN_CONFIDENCE = 0.98;

    if (
      selectionResult.selectionType !== 'UNKNOWN' &&
      selectionResult.confidence >= FASTPATH_MIN_CONFIDENCE &&
      selectionResult.selectedCandidates.length > 0
    ) {
      const primary = selectionResult.primaryCandidate || selectionResult.selectedCandidates[0];

      // Whitelist intent check: FastPath handles ONLY deterministic identity & contact facts
      // SERVICES and TECHNOLOGIES pages are EXCLUDED (must be served by Enterprise RAG)
      const ALLOWED_FASTPATH_INTENT_IDS = new Set<string>([
        'LEADERSHIP_INFO', 'LEADERSHIP.CEO', 'LEADERSHIP.CTO', 'LEADERSHIPINQUIRY', 'LEADERSHIP_INFO_INTENT', 'FOUNDER_INFO',
        'COMPANY_PROFILE', 'COMPANY.INFO', 'COMPANY_PROFILE_INTENT', 'EMPLOYEE_COUNT',
        'CAREERS', 'CAREERS_INTENT', 'INTERNSHIPS', 'CAREER.INTERNSHIP', 'CAREER.TRAINING', 'HIRING_PROCESS', 'JOB_APPLICATION', 'INTERVIEW_PROCESS', 'CURRENT_OPENINGS',
        'OFFICE_OVERVIEW', 'COMPANY.LOCATION', 'LOCATIONINQUIRY', 'OFFICE_OVERVIEW_INTENT', 'HEADQUARTERS', 'INDIA_OFFICE', 'USA_OFFICE', 'UK_OFFICE', 'UAE_OFFICE', 'SINGAPORE_OFFICE', 'OFFICE_ADDRESS', 'GLOBAL_OFFICES', 'CONTACT_LOCATION',
        'GENERAL_CONTACT', 'CONTACT.EMAIL', 'CONTACTINQUIRY', 'GENERAL_CONTACT_INTENT', 'SALES_CONTACT', 'BUSINESS_INQUIRY', 'PROJECT_DISCUSSION', 'PROJECT_QUOTATION', 'PROJECT_PROPOSAL', 'CONSULTATION', 'BOOK_MEETING', 'BOOK_DEMO', 'HR_CONTACT', 'OFFICE_PHONE', 'EMAIL_CONTACT', 'HEADQUARTERS_CONTACT', 'CONTACT_OVERVIEW', 'WEBSITE_INFO', 'SOCIAL_MEDIA',
        'TECHNICAL_SUPPORT', 'SUPPORT.HELP', 'CUSTOMER_SUPPORT', 'CLIENT_SUPPORT', 'ABOUT_KAIRA', 'HELP_INFO'
        // NOTE: PRICING_INQUIRY intentionally excluded — pricing is RAG-exclusive per FastPath scope directive
      ]);

      const primaryIdUpper = (primary.intent.id || '').trim().toUpperCase();
      if (!ALLOWED_FASTPATH_INTENT_IDS.has(primaryIdUpper)) {
        this.metrics?.recordMiss(duration);
        if (process.env.NODE_ENV !== 'test') {
          console.log('[RoutingDecisionEngine] Query:', query, '| Intent:', primaryIdUpper, '| Selected Route: RAG | Reason: Intent Not Whitelisted for FastPath');
        }
        return this.buildUnhandledResult(query, duration);
      }

      const matches: FastPathMatch[] = selectionResult.selectedCandidates.map((cand) => ({
        intentId: cand.intent.id,
        intentName: cand.intent.category,
        category: cand.intent.category,
        confidence: cand.score,
        strategy: selectionResult.strategy,
        matchedTerm: cand.matchedRules.join('; '),
        response: FastPathEngine.resolveIntentResponse(cand.intent.id, query, cand.intent.responseTemplate, cand.intent.category),
        priority: cand.intent.priority as any,
        metadata: {
          aliasesUsed: cand.aliasesUsed,
          entitiesMatched: cand.entitiesMatched,
          breakdown: cand.confidenceBreakdown,
        },
      }));

      const result: EngineResult<FastPathIntentPayload> = {
        engineName: this.name,
        handled: true,
        confidence: selectionResult.confidence,
        intent: primary.intent.id,
        category: selectionResult.selectionType === 'MULTI' ? 'Multi-Intent Match' : primary.intent.category,
        responseCandidate: FastPathEngine.resolveIntentResponse(primary.intent.id, query, primary.intent.responseTemplate, primary.intent.category),
        payload: {
          intents: matches,
          primaryIntent: matches[0],
          matchedCount: matches.length,
          executionLatencyMs: duration,
          cacheHit: false,
          strategyUsed: selectionResult.strategy,
        },
        metadata: {
          query,
          resolvedQuery: generationResult.resolvedQuery,
          selectionType: selectionResult.selectionType,
          aliasesAppliedCount: generationResult.aliasesApplied.length,
          entitiesExtractedCount: generationResult.extractedEntities.length,
        },
      };

      if (this.config.enableCache) {
        this.cache.set(cacheKey, result);
      }

      this.metrics?.recordMatch(selectionResult.strategy, selectionResult.confidence, duration);
      this.analytics?.recordMatch({
        intentId: primary.intent.id,
        confidence: selectionResult.confidence,
        latencyMs: duration,
        aliases: generationResult.aliasesApplied,
        entities: generationResult.extractedEntities,
      });

      if (this.logger && matches.length > 0) {
        this.logger.logMatchSuccess(query, matches[0], selectionResult.strategy, duration, sessionId);
      }

      return result;
    }

    // Step 4: Fallback to Stub Engine Regex Match
    const stubResult = this.stubEngine.process(context);
    if (stubResult.handled && stubResult.confidence >= 0.60) {
      const intentId = stubResult.intent || 'COMPANY_PROFILE';
      const resolvedText = FastPathEngine.resolveIntentResponse(intentId, query, stubResult.responseCandidate, stubResult.category);
      if (resolvedText) {
        return {
          engineName: this.name,
          handled: true,
          confidence: stubResult.confidence,
          intent: intentId,
          category: stubResult.category || 'Company Profile',
          responseCandidate: resolvedText,
          payload: {
            intents: [],
            primaryIntent: {
              intentId: intentId,
              intentName: stubResult.category || 'Company Profile',
              category: stubResult.category || 'Company Profile',
              confidence: stubResult.confidence,
              strategy: 'REGEX' as any,
              matchedTerm: query,
              response: resolvedText,
              priority: 1 as any,
            },
            matchedCount: 1,
            executionLatencyMs: duration,
            cacheHit: false,
          },
          metadata: {
            query,
            resolvedQuery: context.normalizedQuery,
          },
        };
      }
    }

    this.metrics?.recordMiss(duration);
    this.analytics?.recordMiss({ query, latencyMs: duration });
    return this.buildUnhandledResult(query, duration);
  }

  public getConfig(): IFastPathConfig {
    return { ...this.config };
  }

  public updateConfig(overrides: Partial<IFastPathConfig>): void {
    this.config = { ...this.config, ...overrides };
  }

  public getCacheStats(): FastPathCacheStats {
    return this.cache.getStats();
  }

  public getMetricsSnapshot(): FastPathMetricsSnapshot | null {
    return this.metrics ? this.metrics.getSnapshot() : null;
  }

  public getAnalyticsSnapshot(): FastPathAnalyticsSnapshot | null {
    return this.analytics ? this.analytics.getSnapshot() : null;
  }

  private buildUnhandledResult(query: string, latencyMs: number): EngineResult<FastPathIntentPayload> {
    return {
      engineName: this.name,
      handled: false,
      confidence: 0.0,
      payload: {
        intents: [],
        matchedCount: 0,
        executionLatencyMs: latencyMs,
        cacheHit: false,
      },
      metadata: {
        query,
      },
    };
  }
}
