export class StringUtils {
  public static sanitize(input: string): string {
    if (!input) return '';
    return input.trim().replace(/\s+/g, ' ');
  }

  public static truncate(input: string, maxLength: number): string {
    if (!input || input.length <= maxLength) return input;
    return `${input.slice(0, maxLength)}...`;
  }
}
