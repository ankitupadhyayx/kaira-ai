export class TokenValidator {
  public static readonly APPROVED_SHORT_TOKENS: Set<string> = new Set([
    'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'rag', 'ocr', 'asr', 'tts',
    'iot', 'ar', 'vr', 'xr', 'hr', 'qa', 'qc', 'ui', 'ux', 'ui/ux',
    'api', 'sdk', 'rest', 'sql', 'db', 'aws', 'gcp', 'azure', 'k8s',
    'ceo', 'cto', 'coo', 'cfo', 'cmo', 'cio', 'chro', 'hq', 'faq', 'jd', 'resume'
  ]);

  /**
   * Returns true if a short token (length <= 2 or technical 3-letter abbreviation) is in the approved whitelist.
   */
  public static isApprovedShortToken(token: string): boolean {
    if (!token) return false;
    const lower = token.trim().toLowerCase();
    return this.APPROVED_SHORT_TOKENS.has(lower);
  }

  /**
   * Returns true if an alphabetic token should be ignored for business intent matching because its length <= 2 and it's not in the approved whitelist.
   */
  public static isUnapprovedShortToken(token: string): boolean {
    if (!token) return false;
    const cleaned = token.trim().toLowerCase();
    // Only check alphabetic / short alphanumeric tokens of length <= 2
    if (/^[a-z0-9]{1,2}$/i.test(cleaned)) {
      return !this.isApprovedShortToken(cleaned);
    }
    return false;
  }
}
