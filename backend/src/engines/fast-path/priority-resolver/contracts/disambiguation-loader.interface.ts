import { DisambiguationDataset } from '../types/priority-resolver.types';

export interface IDisambiguationRulesLoader {
  loadDisambiguationDataset(): DisambiguationDataset;
}
