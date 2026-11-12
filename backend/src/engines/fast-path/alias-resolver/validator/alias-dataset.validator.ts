import { IAliasDatasetValidator, ValidationReport } from '../contracts/alias-validator.interface';
import { AliasDataset, AliasDatasetType } from '../types/alias-dataset.types';

const VALID_DATASET_IDS: AliasDatasetType[] = [
  'aliases',
  'synonyms',
  'abbreviations',
  'acronyms',
  'keyboard_mistakes',
  'spelling_variants',
  'hinglish_variants',
  'multilingual_variants',
  'phonetic_variants',
];

export class AliasDatasetValidator implements IAliasDatasetValidator {
  public validate(dataset: unknown): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!dataset || typeof dataset !== 'object') {
      return { isValid: false, errors: ['Dataset payload must be a valid JSON object.'], warnings: [] };
    }

    const data = dataset as Partial<AliasDataset>;

    if (!data.datasetId || typeof data.datasetId !== 'string') {
      errors.push('Missing or invalid "datasetId".');
    } else if (!VALID_DATASET_IDS.includes(data.datasetId as AliasDatasetType)) {
      errors.push(`Unknown datasetId "${data.datasetId}". Must be one of: ${VALID_DATASET_IDS.join(', ')}.`);
    }

    if (!data.entries || !Array.isArray(data.entries)) {
      errors.push('Missing or non-array "entries" property.');
    } else {
      const seenTerms = new Set<string>();

      data.entries.forEach((entry, index) => {
        if (!entry.term || typeof entry.term !== 'string') {
          errors.push(`Entry at index ${index} missing valid "term".`);
        } else {
          const normTerm = entry.term.trim().toLowerCase();
          if (seenTerms.has(normTerm)) {
            warnings.push(`Duplicate term "${entry.term}" found at index ${index} in dataset "${data.datasetId}".`);
          }
          seenTerms.add(normTerm);
        }

        if (!entry.canonical || typeof entry.canonical !== 'string') {
          errors.push(`Entry at index ${index} ("${entry?.term}") missing valid "canonical".`);
        }

        if (typeof entry.confidence !== 'number' || entry.confidence < 0 || entry.confidence > 1) {
          errors.push(`Entry at index ${index} ("${entry?.term}") has invalid confidence value (must be 0.0 - 1.0).`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      datasetId: data.datasetId,
      errors,
      warnings,
    };
  }
}
