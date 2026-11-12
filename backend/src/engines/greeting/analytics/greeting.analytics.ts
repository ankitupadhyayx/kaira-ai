import { GreetingAnalyticsRecord, GreetingCategory, GreetingPosition } from '../types/greeting.types';

export class GreetingAnalytics {
  private static instance: GreetingAnalytics;
  private readonly records: GreetingAnalyticsRecord[] = [];

  public static getInstance(): GreetingAnalytics {
    if (!GreetingAnalytics.instance) {
      GreetingAnalytics.instance = new GreetingAnalytics();
    }
    return GreetingAnalytics.instance;
  }

  public record(data: {
    sessionId?: string;
    greetingCategory: GreetingCategory;
    language: string;
    style?: string;
    emotion?: string;
    persona?: string;
    confidence: number;
    position: GreetingPosition;
    hasBusinessQuery: boolean;
    isRepeatedGreeting: boolean;
    latencyMs: number;
  }): GreetingAnalyticsRecord {
    const record: GreetingAnalyticsRecord = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    this.records.push(record);
    if (this.records.length > 1000) {
      this.records.shift();
    }

    return record;
  }

  public getRecent(count = 50): GreetingAnalyticsRecord[] {
    return this.records.slice(-count);
  }

  public clear(): void {
    this.records.length = 0;
  }
}

export const greetingAnalytics = GreetingAnalytics.getInstance();
