export class DomainRouter {
  private static readonly DOMAIN_KEYWORDS: Record<string, string[]> = {
    leadership: ['ceo', 'founder', 'boss', 'owner', 'head', 'president', 'management', 'executive', 'director'],
    services: ['services', 'development', 'building', 'mobile', 'web', 'ai', 'cloud', 'devops', 'blockchain'],
    technologies: ['react', 'node', 'python', 'java', 'aws', 'docker', 'mongodb', 'flutter', 'swift'],
    contact: ['contact', 'email', 'phone', 'address', 'office', 'reach', 'mail'],
    hiring: ['job', 'career', 'internship', 'hiring', 'apply', 'vacancy', 'campus'],
    policies: ['privacy', 'terms', 'refund', 'policy', 'leave', 'attendance'],
    faq: ['faq', 'question', 'help', 'info'],
    support: ['support', 'helpdesk', 'ticket', 'sla'],
  };

  public routeDomain(normalizedQuery: string, domainHint?: string): string[] {
    if (domainHint) {
      return [domainHint.toLowerCase()];
    }

    const tokens = normalizedQuery.toLowerCase().split(/\s+/);
    const matchedDomains = new Set<string>();

    for (const [domain, keywords] of Object.entries(DomainRouter.DOMAIN_KEYWORDS)) {
      for (const kw of keywords) {
        if (tokens.includes(kw) || normalizedQuery.includes(kw)) {
          matchedDomains.add(domain);
          break;
        }
      }
    }

    return matchedDomains.size > 0 ? Array.from(matchedDomains) : [];
  }
}
