import { BaseTemplate } from './base.template';
import { ResponseType } from '../types/formatter.types';

export class PolicyTemplate extends BaseTemplate {
  public readonly type: ResponseType = 'Policy';
}
