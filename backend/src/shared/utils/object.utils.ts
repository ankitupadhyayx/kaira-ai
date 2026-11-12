export class ObjectUtils {
  public static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }

  public static isNonNullable<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
  }
}
