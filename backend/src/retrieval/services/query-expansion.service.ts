export class QueryExpansionService {
  private static readonly ENTERPRISE_EXPANSIONS: Array<{ pattern: RegExp; expansion: string }> = [
    // ── HR Leave & Time Off ──────────────────────────────────────────────────
    {
      pattern: /\b(public\s+holidays?|annual\s+leave|paid\s+leave|casual\s+leave|earned\s+leave|leave\s+policy|leave\s+policies|holiday\s+policy|pto|time\s+off)\b/i,
      expansion: 'leave policy paid leave annual leave public holiday holiday list employee leave',
    },
    {
      pattern: /\b(medical\s+leave|sick\s+leave|health\s+leave)\b/i,
      expansion: 'sick leave medical leave emergency leave employee leave policy',
    },
    {
      pattern: /\b(maternity\s+leave|paternity\s+leave|parental\s+leave)\b/i,
      expansion: 'parental leave maternity paternity employee leave policy HR',
    },
    {
      pattern: /\b(leave\s+encashment|earned\s+leave\s+surrender)\b/i,
      expansion: 'leave encashment earned leave surrender balance policy',
    },
    // ── Attendance & Working Hours ───────────────────────────────────────────
    {
      pattern: /\b(attendance|work\s+timing|office\s+hours?|working\s+hours?|shift)\b/i,
      expansion: 'attendance policy working hours office timing shift schedule check-in',
    },
    // ── Compensation (Precise — no over-expansion) ───────────────────────────
    {
      pattern: /\b(salary|salaries|payroll|ctc|compensation|wage|stipend)\b/i,
      expansion: 'salary structure compensation payroll CTC employee pay',
    },
    {
      pattern: /\b(increment|appraisal|performance\s+review|merit|raise)\b/i,
      expansion: 'salary increment appraisal merit performance review promotion policy',
    },
    {
      pattern: /\b(promotion)\b/i,
      expansion: 'promotion career growth merit appraisal increment employee policy',
    },
    // ── Benefits (Targeted — removed over-broad generic terms) ───────────────
    {
      pattern: /\b(employee\s+benefits?|perks|allowances?|welfare)\b/i,
      expansion: 'employee benefits perks welfare allowance HR policy',
    },
    {
      pattern: /\b(health\s+insurance|medical\s+insurance|insurance\s+coverage)\b/i,
      expansion: 'health insurance medical coverage employee benefits premium policy',
    },
    // ── Security & Access ────────────────────────────────────────────────────
    {
      pattern: /\b(password|passwords|mfa|multi.?factor|authentication|security\s+policy|login\s+security)\b/i,
      expansion: 'multi factor authentication mfa password security policy access control',
    },
    // ── Onboarding & HR Processes ────────────────────────────────────────────
    {
      pattern: /\b(onboarding|joining\s+process|new\s+hire)\b/i,
      expansion: 'employee onboarding joining process HR orientation policy checklist',
    },
    {
      pattern: /\b(code\s+of\s+conduct|conduct\s+policy|workplace\s+ethics)\b/i,
      expansion: 'code of conduct employee guidelines workplace ethics HR policy',
    },
    // ── Training & Development ───────────────────────────────────────────────
    {
      pattern: /\b(training|development\s+program|upskilling|learning\s+program)\b/i,
      expansion: 'employee training development program upskilling workshop learning',
    },
    {
      pattern: /\b(career\s+growth|career\s+development|career\s+path)\b/i,
      expansion: 'career growth development promotion mentorship learning path policy',
    },
    // ── Technology Stack ─────────────────────────────────────────────────────
    {
      pattern: /\b(frameworks?|libraries|tech\s+stack|technology\s+stack|stacks?)\b/i,
      expansion: 'technology stack frameworks languages swift kotlin flutter react node python web mobile cloud',
    },
    {
      pattern: /\b(blocksuite|block\s+suite|accelerator)\b/i,
      expansion: 'blocksuite accelerator modular smart contract blockchain deployment framework proprietary platform',
    },
    {
      pattern: /\b(agile|scrum|methodology|development\s+process|engineering\s+lifecycle)\b/i,
      expansion: 'engineering lifecycle development process agile methodology requirement gathering QA deployment',
    },
    // ── Domain Verticals ─────────────────────────────────────────────────────
    {
      pattern: /\b(fintech|fin\s+tech|banking|payments)\b/i,
      expansion: 'fintech payment gateway crypto wallets algorithmic trading pci-dss financial technology',
    },
    {
      pattern: /\b(healthcare|hipaa|telemedicine|ehr)\b/i,
      expansion: 'healthcare hipaa compliant patient portals telemedicine ehr integration ai diagnostics',
    },
    // ── Compliance & Certifications ──────────────────────────────────────────
    {
      pattern: /\b(compliance|certifi|iso|cmmi|gdpr)\b/i,
      expansion: 'iso 9001 iso 27001 cmmi level 3 gdpr hipaa compliance security certifications quality assurance',
    },
  ];

  /**
   * Expands enterprise domain terms in a normalized query to enrich vector search semantic coverage.
   * Uses precise, topic-focused expansions to avoid diluting the embedding signal.
   */
  public expandQuery(normalizedQuery: string): string {
    if (!normalizedQuery || typeof normalizedQuery !== 'string') return '';

    let expanded = normalizedQuery.trim();
    const additions: string[] = [];

    for (const rule of QueryExpansionService.ENTERPRISE_EXPANSIONS) {
      if (rule.pattern.test(normalizedQuery)) {
        // Avoid adding duplicates already in the normalized query
        const newTerms = rule.expansion.split(' ').filter((t) => !expanded.includes(t));
        if (newTerms.length > 0) {
          additions.push(newTerms.join(' '));
        }
      }
    }

    if (additions.length > 0) {
      expanded = `${expanded} ${additions.join(' ')}`.trim();
    }

    return expanded;
  }
}

export const queryExpansionService = new QueryExpansionService();
