import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';
import { ChatResponse, ResponseType, ResponseDepth, ChatResponseSection } from '../types/formatter.types';

export abstract class BaseTemplate {
  public abstract readonly type: ResponseType;

  public render(
    record: BaseKnowledgeRecord,
    query: string,
    matchType: string = 'EXACT_MATCH',
    confidence: number = 1.0
  ): ChatResponse {
    const cleanQuery = query.trim().toLowerCase();
    const depth = this.determineDepth(cleanQuery);
    
    const title = record.content.title || this.getFallbackTitle(record);
    const subtitle = record.identity.category ? `Mobiloitte ${this.capitalize(record.identity.category)} Enterprise Knowledge` : undefined;
    const summary = this.cleanText(record.content.short_summary || '');
    const body = this.cleanText(record.content.detailed_description || '');
    
    const rawHighlights = record.content.highlights || [];
    const highlights = this.deduplicateList(rawHighlights).slice(0, depth === 1 ? 5 : 7);

    const sections = this.buildSections(record, depth);
    const relatedTopics = this.buildRelatedTopics(record);
    const references = this.buildReferences(record);
    const followUpQuestions = this.buildFollowUps(record);

    const markdownText = this.composeMarkdown({
      type: this.type,
      depth,
      title,
      subtitle,
      summary,
      body,
      sections,
      highlights,
      relatedTopics,
      followUpQuestions,
      references,
    });

    return {
      type: this.type,
      depth,
      title,
      subtitle,
      summary,
      body,
      sections,
      highlights,
      relatedTopics,
      followUpQuestions,
      references,
      metadata: {
        domain: record.identity.domain,
        category: record.identity.category,
        confidence,
        matchType,
      },
      markdownText,
    };
  }

  protected determineDepth(query: string): ResponseDepth {
    const isExplicitDetailed = /tell me everything|explain in detail|full details|complete overview|all information|everything about|in-depth|compare/i.test(query);
    if (isExplicitDetailed) return 4;
    
    const tokens = query.split(/\s+/).filter(Boolean);
    if (tokens.length <= 2) return 1;
    if (tokens.length <= 5) return 2;
    return 3;
  }

  protected buildSections(record: BaseKnowledgeRecord, depth: ResponseDepth): ChatResponseSection[] {
    const sections: ChatResponseSection[] = [];

    if (depth >= 2 && record.content.detailed_description) {
      sections.push({
        heading: 'Overview & Details',
        content: this.cleanText(record.content.detailed_description),
      });
    }

    return sections;
  }

  protected buildRelatedTopics(record: BaseKnowledgeRecord): string[] {
    const topics: string[] = [];
    if (record.search?.keywords) {
      topics.push(...record.search.keywords.slice(0, 4));
    }
    return this.deduplicateList(topics);
  }

  protected buildReferences(record: BaseKnowledgeRecord): string[] {
    const refs: string[] = [];
    if (record.references?.official_references) {
      refs.push(...record.references.official_references);
    }
    if (record.references?.documentation_urls) {
      refs.push(...record.references.documentation_urls);
    }
    return this.deduplicateList(refs).map((url) => this.formatMarkdownLink(url));
  }

  protected buildFollowUps(record: BaseKnowledgeRecord): string[] {
    const questions: string[] = [];
    if (record.search?.common_user_questions) {
      questions.push(...record.search.common_user_questions);
    }
    if (questions.length === 0) {
      const domain = record.identity.domain;
      if (domain === 'company') {
        questions.push('Would you like to know about Mobiloitte core services?');
        questions.push('Would you like to explore Mobiloitte leadership & CEO?');
        questions.push('Where are Mobiloitte office locations?');
      } else if (domain === 'services') {
        questions.push('Would you like to know about AI & Machine Learning services?');
        questions.push('Would you like to explore Cloud & DevOps architecture?');
        questions.push('Would you like to discuss custom project pricing?');
      } else {
        questions.push(`Would you like more details on ${record.identity.category}?`);
        questions.push('How can our engineering team assist your business?');
      }
    }
    return this.deduplicateList(questions).slice(0, 3);
  }

  protected composeMarkdown(params: {
    type: ResponseType;
    depth: ResponseDepth;
    title: string;
    subtitle?: string;
    summary: string;
    body?: string;
    sections: ChatResponseSection[];
    highlights: string[];
    relatedTopics: string[];
    followUpQuestions: string[];
    references: string[];
  }): string {
    const blocks: string[] = [];

    // Title
    blocks.push(`# ${params.title}`);

    // Summary
    if (params.summary) {
      blocks.push(`_${params.summary}_`);
    }

    // Depth 1: One-word / Short Query (Summary + Top Highlights)
    if (params.depth === 1) {
      if (params.highlights.length > 0) {
        blocks.push(`### Key Highlights\n` + params.highlights.map((h) => `• ${h}`).join('\n'));
      }
    } else {
      // Depth 2, 3, 4: Detailed Body / Sections
      if (params.body && params.depth >= 2) {
        blocks.push(params.body);
      }

      if (params.highlights.length > 0) {
        blocks.push(`### Key Information\n` + params.highlights.map((h) => `• ${h}`).join('\n'));
      }

      for (const section of params.sections) {
        if (Array.isArray(section.content) && section.content.length > 0) {
          blocks.push(`### ${section.heading}\n` + section.content.map((c) => `• ${c}`).join('\n'));
        } else if (typeof section.content === 'string' && section.content.trim()) {
          blocks.push(`### ${section.heading}\n${section.content}`);
        }
      }
    }

    // References (Level 3 & 4)
    if (params.depth >= 3 && params.references.length > 0) {
      blocks.push(`### References\n` + params.references.map((r) => `• ${r}`).join('\n'));
    }

    // Related Topics (Level 2 & 4)
    if ((params.depth === 2 || params.depth === 4) && params.relatedTopics.length > 0) {
      blocks.push(`**Related Topics**: ${params.relatedTopics.join(', ')}`);
    }

    // Suggested Questions (Max 3)
    if (params.followUpQuestions.length > 0) {
      blocks.push(`### Suggested Questions\n` + params.followUpQuestions.map((q) => `• ${q}`).join('\n'));
    }

    return blocks.join('\n\n').trim();
  }

  protected formatMarkdownLink(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const label = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      return `[Mobiloitte ${label}](${url})`;
    }
    return url;
  }

  protected capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  protected cleanText(text: string): string {
    let cleaned = (text || '').replace(/\s+/g, ' ').trim();
    // Convert raw exposed URLs to markdown links
    cleaned = cleaned.replace(/(?<!\]\()(https?:\/\/[^\s]+)/gi, (match) => {
      let label = 'Map Pin';
      if (match.includes('maps.google')) label = 'Google Maps Pin';
      else if (match.includes('mobiloitte.com')) label = 'Mobiloitte Web Portal';
      return `[${label}](${match})`;
    });
    return cleaned;
  }

  protected deduplicateList(items: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of items) {
      const clean = this.cleanText(item);
      if (clean && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        result.push(clean);
      }
    }
    return result;
  }

  protected getFallbackTitle(record: BaseKnowledgeRecord): string {
    return record.identity.slug
      ? record.identity.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Enterprise Knowledge Overview';
  }
}
