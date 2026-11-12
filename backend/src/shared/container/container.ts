type Factory<T> = (container: Container) => T;

export class Container {
  private static instance: Container;
  private services = new Map<string, unknown>();
  private factories = new Map<string, Factory<unknown>>();

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  public registerFactory<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory as Factory<unknown>);
  }

  public resolve<T>(key: string): T {
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      const instance = factory(this) as T;
      this.services.set(key, instance);
      return instance;
    }

    throw new Error(`[Container] Service '${key}' not registered.`);
  }

  public clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

export const container = Container.getInstance();

// Lazy default registrations for Fast Path Intent Classifier components
container.registerFactory('IntentDatasetLoader', () => {
  const { IntentDatasetLoader } = require('../../engines/fast-path/intent-classifier/loader/intent-dataset.loader');
  return new IntentDatasetLoader();
});

container.registerFactory('IntentRegistry', (c) => {
  const { IntentRegistry } = require('../../engines/fast-path/intent-classifier/registry/intent.registry');
  const loader = c.resolve('IntentDatasetLoader');
  return new IntentRegistry(loader);
});


container.registerFactory('EnterpriseIntentClassifier', (c) => {
  const { EnterpriseIntentClassifier } = require('../../engines/fast-path/intent-classifier/services/enterprise-intent.classifier');
  const registry = c.resolve('IntentRegistry');
  return new EnterpriseIntentClassifier(registry);
});

// Lazy default registrations for Fast Path Alias Resolution Platform components
container.registerFactory('AliasDatasetLoader', () => {
  const { AliasDatasetLoader } = require('../../engines/fast-path/alias-resolver/loader/alias-dataset.loader');
  return new AliasDatasetLoader();
});

container.registerFactory('AliasResolutionCache', () => {
  const { AliasResolutionCache } = require('../../engines/fast-path/alias-resolver/caching/alias-resolution.cache');
  return new AliasResolutionCache();
});

container.registerFactory('EnterpriseAliasResolver', (c) => {
  const { EnterpriseAliasResolver } = require('../../engines/fast-path/alias-resolver/services/enterprise-alias.resolver');
  const loader = c.resolve('AliasDatasetLoader');
  const cache = c.resolve('AliasResolutionCache');
  return new EnterpriseAliasResolver(undefined, loader, cache);
});

// Lazy default registrations for Fast Path Entity Extraction Engine components
container.registerFactory('EntityDatasetLoader', () => {
  const { EntityDatasetLoader } = require('../../engines/fast-path/entity-extractor/loader/entity-dataset.loader');
  return new EntityDatasetLoader();
});

container.registerFactory('EntityIndexCache', () => {
  const { EntityIndexCache } = require('../../engines/fast-path/entity-extractor/caching/entity-index.cache');
  return new EntityIndexCache();
});

container.registerFactory('LongestMatchEntityMatcher', (c) => {
  const { LongestMatchEntityMatcher } = require('../../engines/fast-path/entity-extractor/matcher/longest-match.entity-matcher');
  const cache = c.resolve('EntityIndexCache');
  return new LongestMatchEntityMatcher(cache);
});

container.registerFactory('EnterpriseEntityExtractor', (c) => {
  const { EnterpriseEntityExtractor } = require('../../engines/fast-path/entity-extractor/services/enterprise-entity.extractor');
  const loader = c.resolve('EntityDatasetLoader');
  const cache = c.resolve('EntityIndexCache');
  const matcher = c.resolve('LongestMatchEntityMatcher');
  return new EnterpriseEntityExtractor(undefined, loader, cache, matcher);
});

// Lazy default registrations for Candidate Generator, Confidence Engine & Intent Matcher components
container.registerFactory('EnterpriseConfidenceEngine', () => {
  const { EnterpriseConfidenceEngine } = require('../../engines/fast-path/confidence-engine/services/enterprise-confidence.engine');
  return new EnterpriseConfidenceEngine();
});

container.registerFactory('EnterpriseCandidateGenerator', (c) => {
  const { EnterpriseCandidateGenerator } = require('../../engines/fast-path/candidate-generator/services/enterprise-candidate.generator');
  const aliasResolver = c.resolve('EnterpriseAliasResolver');
  const entityExtractor = c.resolve('EnterpriseEntityExtractor');
  const intentRegistry = c.resolve('IntentRegistry');
  const confidenceEngine = c.resolve('EnterpriseConfidenceEngine');
  return new EnterpriseCandidateGenerator(undefined, aliasResolver, entityExtractor, intentRegistry, confidenceEngine);
});

// Lazy default registrations for Priority & Conflict Resolver components
container.registerFactory('DisambiguationRulesLoader', () => {
  const { DisambiguationRulesLoader } = require('../../engines/fast-path/priority-resolver/loader/disambiguation-rules.loader');
  return new DisambiguationRulesLoader();
});

container.registerFactory('EnterpriseConflictResolver', (c) => {
  const { EnterpriseConflictResolver } = require('../../engines/fast-path/priority-resolver/services/enterprise-conflict.resolver');
  const loader = c.resolve('DisambiguationRulesLoader');
  return new EnterpriseConflictResolver(loader);
});

container.registerFactory('EnterprisePriorityResolver', (c) => {
  const { EnterprisePriorityResolver } = require('../../engines/fast-path/priority-resolver/services/enterprise-priority.resolver');
  const conflictResolver = c.resolve('EnterpriseConflictResolver');
  const loader = c.resolve('DisambiguationRulesLoader');
  return new EnterprisePriorityResolver(undefined, conflictResolver, loader);
});

container.registerFactory('DeterministicIntentMatcher', (c) => {
  const { DeterministicIntentMatcher } = require('../../engines/fast-path/intent-matcher/services/deterministic-intent.matcher');
  const priorityResolver = c.resolve('EnterprisePriorityResolver');
  return new DeterministicIntentMatcher(undefined, priorityResolver);
});

// Lazy default registrations for Multi-Intent Engine components
container.registerFactory('MultiIntentRulesLoader', () => {
  const { MultiIntentRulesLoader } = require('../../engines/fast-path/multi-intent/loader/multi-intent-rules.loader');
  return new MultiIntentRulesLoader();
});

container.registerFactory('MultiIntentQuerySplitter', (c) => {
  const { MultiIntentQuerySplitter } = require('../../engines/fast-path/multi-intent/splitter/multi-intent-query.splitter');
  const loader = c.resolve('MultiIntentRulesLoader');
  return new MultiIntentQuerySplitter(loader);
});

container.registerFactory('EnterpriseMultiIntentEngine', (c) => {
  const { EnterpriseMultiIntentEngine } = require('../../engines/fast-path/multi-intent/services/enterprise-multi-intent.engine');
  const splitter = c.resolve('MultiIntentQuerySplitter');
  const candidateGenerator = c.resolve('EnterpriseCandidateGenerator');
  const intentMatcher = c.resolve('DeterministicIntentMatcher');
  return new EnterpriseMultiIntentEngine(undefined, splitter, candidateGenerator, intentMatcher);
});

container.registerFactory('EnterpriseFastPathAnalytics', () => {
  const { EnterpriseFastPathAnalytics } = require('../../engines/fast-path/analytics/services/enterprise-fast-path.analytics');
  return new EnterpriseFastPathAnalytics();
});

container.registerFactory('FastPathEngine', (c) => {
  const { FastPathEngine } = require('../../engines/fast-path/services/fast-path.engine');
  const candidateGenerator = c.resolve('EnterpriseCandidateGenerator');
  const intentMatcher = c.resolve('DeterministicIntentMatcher');
  const multiIntentEngine = c.resolve('EnterpriseMultiIntentEngine');
  const analytics = c.resolve('EnterpriseFastPathAnalytics');
  return new FastPathEngine(undefined, undefined, undefined, undefined, candidateGenerator, intentMatcher, multiIntentEngine, analytics);
});

// Lazy default registrations for Fast Path Knowledge Resolution Layer components
container.registerFactory('KnowledgeInMemoryCache', () => {
  const { KnowledgeInMemoryCache } = require('../../engines/fast-path/knowledge-resolver/caching/knowledge-in-memory.cache');
  return new KnowledgeInMemoryCache();
});

container.registerFactory('EnterpriseKnowledgeResolver', (c) => {
  const { EnterpriseKnowledgeResolver } = require('../../engines/fast-path/knowledge-resolver/services/enterprise-knowledge.resolver');
  const cache = c.resolve('KnowledgeInMemoryCache');
  return new EnterpriseKnowledgeResolver(undefined, cache);
});





