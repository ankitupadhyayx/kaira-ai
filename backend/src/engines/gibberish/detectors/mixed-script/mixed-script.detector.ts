import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';

export class MixedScriptDetector implements IDetector {
  public readonly name = 'MixedScriptDetector';

  public detect(context: ProcessingContext): DetectorResult {
    const rawText = (context.cleanQuery || context.originalQuery || '').trim();
    if (!rawText) {
      return this.buildResult(0, 0, []);
    }

    const tokens = context.tokens.length > 0 ? context.tokens : rawText.split(/\s+/);
    const mixedScriptTokens: string[] = [];

    for (const token of tokens) {
      if (token.length >= 3) {
        const scripts = this.getUniqueScripts(token);
        // If a single word token mixes Latin, Cyrillic, Greek, Arabic, etc. (excluding common symbols/emojis)
        if (scripts.size >= 2 && !scripts.has('Common') && !scripts.has('Inherited')) {
          mixedScriptTokens.push(token);
        }
      }
    }

    if (mixedScriptTokens.length > 0) {
      const score = Math.min(1.0, 0.6 + mixedScriptTokens.length * 0.2);
      return this.buildResult(score, 0.85, mixedScriptTokens);
    }

    return this.buildResult(0, 0, []);
  }

  private getUniqueScripts(word: string): Set<string> {
    const scripts = new Set<string>();
    for (const char of word) {
      const code = char.charCodeAt(0);
      if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
        scripts.add('Latin');
      } else if (code >= 0x0400 && code <= 0x04ff) {
        scripts.add('Cyrillic');
      } else if (code >= 0x0370 && code <= 0x03ff) {
        scripts.add('Greek');
      } else if (code >= 0x0900 && code <= 0x097f) {
        scripts.add('Devanagari');
      } else if (code >= 0x0600 && code <= 0x06ff) {
        scripts.add('Arabic');
      }
    }
    return scripts;
  }

  private buildResult(score: number, confidence: number, matches: string[]): DetectorResult {
    return {
      detectorName: this.name,
      score,
      confidence,
      matchedReason: 'MIXED_SCRIPT_ANOMALY',
      metadata: {
        matches,
        count: matches.length,
      },
    };
  }
}
