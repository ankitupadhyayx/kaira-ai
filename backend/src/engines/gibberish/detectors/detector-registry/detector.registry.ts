import { IDetector } from '../base-detector';
import { KeyboardMashDetector } from '../keyboard-mash/keyboard-mash.detector';
import { RandomCharacterDetector } from '../random-character/random-character.detector';
import { EmojiSpamDetector } from '../emoji-spam/emoji-spam.detector';
import { RepeatedCharacterDetector } from '../repeated-character/repeated-character.detector';
import { NoiseDetector } from '../noise/noise.detector';
import { UnknownTokenRatioDetector } from '../unknown-token/unknown-token.detector';
import { MixedScriptDetector } from '../mixed-script/mixed-script.detector';
import { LowEntropyDetector } from '../low-entropy/low-entropy.detector';
import { SecurityInjectionDetector } from '../security-injection/security-injection.detector';
import { UrlSpamDetector } from '../url-spam/url-spam.detector';
import { RandomNumberDetector } from '../random-number/random-number.detector';

export class DetectorRegistry {
  private readonly detectors: Map<string, IDetector> = new Map();

  constructor(customTechVocab?: string[]) {
    this.register(new SecurityInjectionDetector());
    this.register(new KeyboardMashDetector());
    this.register(new RandomCharacterDetector());
    this.register(new EmojiSpamDetector());
    this.register(new RepeatedCharacterDetector());
    this.register(new NoiseDetector());
    this.register(new UrlSpamDetector());
    this.register(new RandomNumberDetector());
    this.register(new UnknownTokenRatioDetector(customTechVocab));
    this.register(new MixedScriptDetector());
    this.register(new LowEntropyDetector());
  }

  public register(detector: IDetector): void {
    this.detectors.set(detector.name, detector);
  }

  public unregister(detectorName: string): boolean {
    return this.detectors.delete(detectorName);
  }

  public getDetector(detectorName: string): IDetector | undefined {
    return this.detectors.get(detectorName);
  }

  public getAllDetectors(): IDetector[] {
    return Array.from(this.detectors.values());
  }
}
