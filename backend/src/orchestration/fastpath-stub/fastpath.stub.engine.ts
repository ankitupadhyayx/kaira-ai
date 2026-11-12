import { IEngine, EngineResult } from '../../shared/interfaces/engine.interface';
import { ProcessingContext } from '../../normalization/types/processing-context.types';
import { TokenValidator } from '../../normalization/utils/token-validator.utils';

export class FastPathStubEngine implements IEngine<EngineResult<any>> {
  public readonly name: string = 'FastPathEngine';

  private static readonly INTENT_RULES: Array<{ pattern: RegExp; intent: string; category: string; response: string }> = [
    {
      pattern: /(what is mobiloitte|tell me about mobiloitte|about mobiloitte|about company|^(company|mobiloitte|mobiloite|mobilotte|mobilloitte|mobiloitee|mobiliotte|moblioitte)$|company info|company information|company profile|company overview|mobiloitte profile|mobiloitte overview|introduce mobiloitte|about your company|who is mobiloitte|tell me about your company|company introduction|company details|company background|business overview|organization overview|enterprise profile|company_profile_intent)/i,
      intent: 'COMPANY_PROFILE',
      category: 'Company Profile',
      response: 'Mobiloitte is an AI-first software engineering company established in 2004.\n• 20+ years of experience & 500+ software engineers\n• Global offices in India (HQ), USA, UK, UAE, and Singapore\n• Official Website: [www.mobiloitte.com](https://www.mobiloitte.com)',
    },
    {
      pattern: /\b(ceo|cfo|cto|coo|cmo|cio|chro|leadership|founder|boss|owner|management|executive|executives|directors|board|who runs|who started|who founded|who created|who owns|company head|lead team|top management|ceoo|ceeo|ceo name|fouder|foundr|foundar|founderr|leadrship|ledership|mangement|managment|executve|ownership|founding|jagdish|harsh|jagdish harsh)\b/i,
      intent: 'LEADERSHIP_INFO',
      category: 'Leadership & Executive Team',
      response: 'Jagdish Harsh is the Founder & Group CEO of Mobiloitte, leading global corporate strategy and software engineering operations since founding the company in 2004.',
    },
    {
      pattern: /\b(head office|headquarter|headquarters|hq|corporate office|main office|registered office|corporate hq|headquater|headquaters|head office kaha hai|headquarters_intent|^\s*hq\s*$)\b/i,
      intent: 'HEADQUARTERS',
      category: 'Corporate Headquarters & Main Office',
      response: 'Mobiloitte Corporate Headquarters:\nPocket D, Okhla Phase I, Okhla Industrial Estate, New Delhi, Delhi 110020, India.\n• Phone: +91-9999525501 | +91-11-49998888\n• Email: sales@mobiloitte.com',
    },
    {
      pattern: /\b(india office|delhi office|new delhi office|okhla office|india headquarters|indian office|india_office_intent)\b/i,
      intent: 'INDIA_OFFICE',
      category: 'India Office & Engineering Hub',
      response: 'Mobiloitte India Office (Corporate Headquarters):\nPocket D, Okhla Phase I, New Delhi, Delhi 110020, India.\n• Primary engineering hub and executive corporate office.',
    },
    {
      pattern: /\b(usa office|us office|america office|boston office|new york office|usa_office_intent)\b/i,
      intent: 'USA_OFFICE',
      category: 'USA Office & North America Hub',
      response: 'Mobiloitte USA Office:\nBoston, Massachusetts, USA.\n• North American enterprise client engagement & business consulting hub.',
    },
    {
      pattern: /\b(uk office|london office|britain office|uk_office_intent)\b/i,
      intent: 'UK_OFFICE',
      category: 'UK Office & European Hub',
      response: 'Mobiloitte UK Office:\nLondon, United Kingdom.\n• European enterprise operations & regional consulting hub.',
    },
    {
      pattern: /\b(uae office|dubai office|middle east office|uae_office_intent)\b/i,
      intent: 'UAE_OFFICE',
      category: 'UAE & Middle East Office',
      response: 'Mobiloitte UAE Office:\nDubai Silicon Oasis, Dubai, UAE.\n• Middle East & GCC regional enterprise consulting hub.',
    },
    {
      pattern: /\b(singapore office|singapore branch|singapore_office_intent)\b/i,
      intent: 'SINGAPORE_OFFICE',
      category: 'Singapore & APAC Office',
      response: 'Mobiloitte Singapore Office:\nSingapore.\n• Asia-Pacific regional enterprise operations hub.',
    },
    {
      pattern: /\b(branches|branch|branch office|branch offices|global offices|international offices|worldwide offices|all offices|office network|global_offices_intent)\b/i,
      intent: 'GLOBAL_OFFICES',
      category: 'Global Offices & Branches',
      response: 'Mobiloitte Global Offices:\n• Corporate HQ: New Delhi, India (Okhla Phase I)\n• Regional Hubs: USA (Boston), UK (London), UAE (Dubai), and Singapore\n• Website: [www.mobiloitte.com](https://www.mobiloitte.com)',
    },
    {
      pattern: /\b(address|office address|company address|registered address|office_address_intent)\b/i,
      intent: 'OFFICE_ADDRESS',
      category: 'Office Address & Registered Details',
      response: 'Mobiloitte Registered Office Address:\nPocket D, Okhla Phase I, Okhla Industrial Estate, New Delhi, Delhi 110020, India.',
    },
    {
      pattern: /\b(sales email|official email|support email|hr email|business email|email address|email id|email_contact_intent)\b/i,
      intent: 'EMAIL_CONTACT',
      category: 'Email Contact Directory',
      response: 'Mobiloitte Official Email Directory:\n• Sales & Business: sales@mobiloitte.com\n• Technical Support: support@mobiloitte.com\n• HR & Careers: hr@mobiloitte.com',
    },
    {
      pattern: /\b(phone number|office number|mobile number|contact number|helpline|office phone|office_phone_intent)\b/i,
      intent: 'OFFICE_PHONE',
      category: 'Office Phone Numbers',
      response: 'Mobiloitte Official Phone Numbers:\n• Sales Hotline: +91-9999525501\n• Corporate HQ: +91-11-49998888\n• USA Office: +1-781-808-3488\n• UK Office: +44-203-287-9099',
    },
    {
      pattern: /\b(contact sales|talk to sales|sales team|sales support|sales_contact_intent)\b/i,
      intent: 'SALES_CONTACT',
      category: 'Sales & Business Development',
      response: 'Mobiloitte Sales & Business Development Desk:\n• Email: sales@mobiloitte.com\n• Phone: +91-9999525501\n• Operating Hours: Monday – Friday, 9:30 AM – 6:30 PM IST',
    },
    {
      pattern: /\b(technical support|customer support|support team|report issue|bug report|support_intent)\b/i,
      intent: 'TECHNICAL_SUPPORT',
      category: 'Technical & Customer Support',
      response: 'Mobiloitte Technical Support Desk:\n• Support Email: support@mobiloitte.com\n• Support Hotline: +91-11-49998888\n• Portal: [support.mobiloitte.com](https://support.mobiloitte.com)',
    },
    {
      pattern: /\b(hr email|hr contact|recruitment contact|career contact|hr_contact_intent|human resources)\b/i,
      intent: 'HR_CONTACT',
      category: 'HR & Talent Acquisition Contact',
      response: 'Mobiloitte Human Resources & Talent Acquisition Desk:\n• HR Email: hr@mobiloitte.com\n• Careers Portal: [mobiloitte.com/careers](https://mobiloitte.com/careers)',
    },
    {
      pattern: /\b(contact information|contact details|contact overview|contact_overview_intent)\b/i,
      intent: 'CONTACT_OVERVIEW',
      category: 'Contact Overview',
      response: 'Mobiloitte Official Contacts:\n• Sales: sales@mobiloitte.com | +91-9999525501\n• Support: support@mobiloitte.com | +91-11-49998888\n• HR & Careers: hr@mobiloitte.com\n• Headquarters: Pocket D, Okhla Phase I, New Delhi, India',
    },
    {
      pattern: /\b(contact|contact us|get in touch|reach mobiloitte|how can i contact you|how do i reach you|contact team|contact_intent)\b/i,
      intent: 'GENERAL_CONTACT',
      category: 'General Contact & Reach',
      response: 'Mobiloitte Official Contacts:\n• Sales: sales@mobiloitte.com | +91-9999525501\n• Support: support@mobiloitte.com | +91-11-49998888\n• HR & Careers: hr@mobiloitte.com\n• Headquarters: Pocket D, Okhla Phase I, New Delhi, India',
    },
    {
      pattern: /\b(office|offices|office location|office locations|location|locations|where is office|where are you located|where is mobiloitte located|where are your offices|office_overview_intent)\b/i,
      intent: 'OFFICE_OVERVIEW',
      category: 'Office Overview & Locations',
      response: 'Mobiloitte Global Offices:\n• Corporate HQ: New Delhi, India (Okhla Phase I)\n• Regional Hubs: USA (Boston), UK (London), UAE (Dubai), and Singapore\n• Website: [www.mobiloitte.com](https://www.mobiloitte.com)',
    },
    {
      pattern: /(^\s*website\s*$|\b(website|official website|company website|portal|web portal|site|url|website_intent)\b)/i,
      intent: 'WEBSITE',
      category: 'Official Website & Portals',
      response: 'Mobiloitte Official Portals:\n• Main Website: [www.mobiloitte.com](https://www.mobiloitte.com)\n• Careers Portal: [mobiloitte.com/careers](https://mobiloitte.com/careers)\n• Support Portal: [support.mobiloitte.com](https://support.mobiloitte.com)',
    },
    {
      pattern: /\b(apply|job application|careers portal|careers page|career page|how to apply|send resume|submit resume|cv|jd|job_application_intent)\b/i,
      intent: 'JOB_APPLICATION',
      category: 'Job Application & Resume Submission',
      response: 'To apply for open technology positions at Mobiloitte:\n• Careers Portal: [mobiloitte.com/careers](https://mobiloitte.com/careers)\n• Submit Resume to: hr@mobiloitte.com',
    },
    {
      pattern: /\b(social media|facebook|twitter|linkedin|youtube|instagram|social channels|social_media_intent)\b/i,
      intent: 'SOCIAL_MEDIA',
      category: 'Social Media Channels',
      response: 'Mobiloitte Official Social Media Channels:\n• LinkedIn: [linkedin.com/company/mobiloitte](https://linkedin.com/company/mobiloitte)\n• Twitter/X: [twitter.com/mobiloitte](https://twitter.com/mobiloitte)\n• YouTube: [youtube.com/c/mobiloitte](https://youtube.com/c/mobiloitte)\n• Facebook: [facebook.com/mobiloitte](https://facebook.com/mobiloitte)',
    },
    {
      pattern: /\b(internship|internships|intern|industrial training|fresher internship|internships_intent)\b/i,
      intent: 'INTERNSHIPS',
      category: 'Internships & Training',
      response: 'Mobiloitte Internships:\nIndustrial training and internship opportunities for students and graduates.\n• Apply via Email: hr@mobiloitte.com\n• Careers Portal: [mobiloitte.com/careers](https://mobiloitte.com/careers)',
    },
    {
      pattern: /\b(career|careers|employment|career opportunities|work at mobiloitte|join mobiloitte|job|jobs|careers_intent)\b/i,
      intent: 'CAREERS',
      category: 'Careers & Employment',
      response: 'Mobiloitte Careers:\nExplore open technology roles and engineering positions at Mobiloitte.\n• Careers Portal: [mobiloitte.com/careers](https://mobiloitte.com/careers)\n• Submit CV: hr@mobiloitte.com',
    },
    {
      pattern: /(help_capabilities_intent|\b(help|how can you help|what do you do|who are you|about yourself|what can you do)\b)/i,
      intent: 'HELP_CAPABILITIES',
      category: 'Help & Bot Capabilities',
      response: "I'm Kaira, Mobiloitte's Enterprise AI Assistant! 👋\n\nI can assist you with:\n• Company identity, leadership & headquarters\n• Office locations, emails, phone hotlines & business hours\n• Careers & job portals\n\nFor detailed technology services, framework expertise, engineering processes, or company policies, ask me any specific question and I will consult our enterprise knowledge base!",
    },
  ];

  public process(context: ProcessingContext, _sessionId?: string): EngineResult<any> {
    const rawInput = (context.originalQuery || context.cleanQuery || '').trim().toLowerCase();
    if (rawInput.length <= 2 && TokenValidator.isUnapprovedShortToken(rawInput)) {
      return {
        engineName: this.name,
        handled: false,
        confidence: 0.0,
        metadata: {},
      };
    }

    const query = `${context.originalQuery || ''} ${context.cleanQuery || ''} ${context.normalizedQuery || ''}`.trim().toLowerCase();

    // DOCUMENT & RAG KNOWLEDGE GUARD (aligned with fast-path.engine.ts RAG_ONLY_PATTERNS)
    // Any query about services, tech stack, frameworks, cloud, AI, blockchain, devops,
    // policies, leave, benefits, security, compliance, pricing, milestones, data engineering,
    // IoT/firmware, or case studies MUST bypass FastPath and route directly to RAG.
    const documentKnowledgePattern = /\b(service|services|technology|technologies|tech\s+stack|ai|generative\s+ai|llm|rag|blockchain|web3|cloud|aws|azure|gcp|devops|docker|kubernetes|react|angular|vue|flutter|node|python|java|solidity|policy|policies|leave|attendance|salary|pricing|price|cost|quote|budget|case\s+stud|portfolio|architecture|security|encryption|gdpr|hipaa|pci|certification|certifications|award|awards|employee\s+count|headcount|work\s+culture|interview|hiring\s+process|milestone|milestones|company\s+history|accolades|data\s+engineering|etl|lakehouse|kafka|spark|flink|firmware|mqtt|embedded\s+systems|chapter\s*\d+)\b/i;

    if (documentKnowledgePattern.test(query)) {
      return {
        engineName: this.name,
        handled: false,
        confidence: 0.0,
        metadata: { query, reason: 'document-knowledge-guard: deferred to RAG pipeline' },
      };
    }

    const matchedIntents: Array<{ intent: string; category: string; response: string }> = [];

    for (const rule of FastPathStubEngine.INTENT_RULES) {
      if (rule.pattern.test(query)) {
        if (!matchedIntents.some((m) => m.intent === rule.intent)) {
          matchedIntents.push({ intent: rule.intent, category: rule.category, response: rule.response });
        }
      }
    }

    if (matchedIntents.length > 0) {
      const combinedResponse = matchedIntents.map((m) => m.response).join('\n\n');
      const intentName = matchedIntents.map((m) => m.intent).join(' + ');
      const categoryName = matchedIntents.length > 1 ? 'Multi-Intent Match' : matchedIntents[0].category;

      return {
        engineName: this.name,
        handled: true,
        confidence: 0.95,
        intent: intentName,
        category: categoryName,
        responseCandidate: combinedResponse,
        payload: {
          intents: matchedIntents,
          matchedCount: matchedIntents.length,
        },
        metadata: {
          query,
          intents: matchedIntents.map((m) => m.intent),
        },
      };
    }

    return {
      engineName: this.name,
      handled: false,
      confidence: 0.0,
      metadata: { query },
    };
  }
}
