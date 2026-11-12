import { BaseTemplate } from './base.template';
import { ResponseType } from '../types/formatter.types';

export class FAQTemplate extends BaseTemplate {
  public readonly type: ResponseType = 'FAQ';
}
