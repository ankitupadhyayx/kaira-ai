import { BaseTemplate } from './base.template';
import { GreetingTemplate } from './greeting.template';
import { CompanyTemplate } from './company.template';
import { ServiceTemplate } from './service.template';
import { TechnologyTemplate } from './technology.template';
import { FAQTemplate } from './faq.template';
import { PolicyTemplate } from './policy.template';
import { ComparisonTemplate } from './comparison.template';
import { ListTemplate } from './list.template';
import { ErrorTemplate } from './error.template';
import { FallbackTemplate } from './fallback.template';
import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export class TemplateRegistry {
  private static instance: TemplateRegistry;

  private readonly templates: Map<string, BaseTemplate> = new Map();
  private readonly fallbackTemplate: FallbackTemplate;
  private readonly comparisonTemplate: ComparisonTemplate;
  private readonly greetingTemplate: GreetingTemplate;

  private constructor() {
    this.greetingTemplate = new GreetingTemplate();
    this.fallbackTemplate = new FallbackTemplate();
    this.comparisonTemplate = new ComparisonTemplate();

    this.register('greeting', this.greetingTemplate);
    this.register('company', new CompanyTemplate());
    this.register('services', new ServiceTemplate());
    this.register('technologies', new TechnologyTemplate());
    this.register('faq', new FAQTemplate());
    this.register('policies', new PolicyTemplate());
    this.register('contact', new ListTemplate());
    this.register('locations', new ListTemplate());
    this.register('leadership', new ListTemplate());
    this.register('hiring', new ListTemplate());
    this.register('error', new ErrorTemplate());
    this.register('fallback', this.fallbackTemplate);
    this.register('comparison', this.comparisonTemplate);
  }

  public static getInstance(): TemplateRegistry {
    if (!TemplateRegistry.instance) {
      TemplateRegistry.instance = new TemplateRegistry();
    }
    return TemplateRegistry.instance;
  }

  public register(domainKey: string, template: BaseTemplate): void {
    this.templates.set(domainKey.toLowerCase(), template);
  }

  public resolveTemplate(record?: BaseKnowledgeRecord, query?: string): BaseTemplate {
    const cleanQuery = (query || '').trim().toLowerCase();

    // 1. Comparison Check (e.g., "compare ai vs blockchain", "ai vs blockchain")
    if (/\b(compare|versus|\bvs\b|comparison|difference between)\b/i.test(cleanQuery)) {
      return this.comparisonTemplate;
    }

    if (!record) {
      if (/^(hi|hii|hiii|hello|helo|hlo|hey|heyy|heya|good morning|good afternoon|good evening|good night|bye|goodbye|thanks|thank you|sorry|nice to meet you)$/i.test(cleanQuery)) {
        return this.greetingTemplate;
      }
      return this.fallbackTemplate;
    }

    // 2. Domain & Category Map
    const domain = (record.identity.domain || '').toLowerCase();
    const category = (record.identity.category || '').toLowerCase();

    if (domain === 'company') return this.templates.get('company') || this.fallbackTemplate;
    if (domain === 'services') return this.templates.get('services') || this.fallbackTemplate;
    if (domain === 'technologies' || domain === 'technology') return this.templates.get('technologies') || this.fallbackTemplate;
    if (domain === 'faq' || category === 'faq') return this.templates.get('faq') || this.fallbackTemplate;
    if (domain === 'policies' || category === 'policy') return this.templates.get('policies') || this.fallbackTemplate;
    if (domain === 'contact' || domain === 'locations' || domain === 'leadership' || domain === 'hiring') {
      return this.templates.get(domain) || this.fallbackTemplate;
    }

    return this.templates.get(domain) || this.fallbackTemplate;
  }
}
