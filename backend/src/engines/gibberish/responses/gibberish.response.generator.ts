import * as gibberishResponses from '../../../data/gibberish-response.json';

export class GibberishResponseGenerator {
  private static lastUsedIndices: Record<string, number> = {};

  public static generateResponse(category: string): string {
    let key = category;
    // Map any categories to corresponding keys in the JSON dictionary
    if (key === 'OUT_OF_DOMAIN' || key === 'OUT_OF_SCOPE_DOMAIN' || key === 'Out of Scope Domain' || key === 'Unknown' || key === 'GIBBERISH_FALLBACK') {
      key = 'OUT_OF_DOMAIN_FALLBACK';
    }

    const dict = gibberishResponses as unknown as Record<string, string[]>;
    const templates = dict[key] || dict.GIBBERISH_FALLBACK || [
      "Hmm, I didn't quite catch that. 😊 Could you try rephrasing? I'm happy to tell you about our software services, careers, or office locations."
    ];
    const lastIndex = this.lastUsedIndices[key] ?? -1;
    const nextIndex = (lastIndex + 1) % templates.length;
    this.lastUsedIndices[key] = nextIndex;
    return templates[nextIndex];
  }
}
