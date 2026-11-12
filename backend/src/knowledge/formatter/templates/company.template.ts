import { BaseTemplate } from './base.template';
import { ResponseType } from '../types/formatter.types';

export class CompanyTemplate extends BaseTemplate {
  public readonly type: ResponseType = 'Company Information';
}
