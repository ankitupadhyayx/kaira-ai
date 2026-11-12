import { BaseTemplate } from './base.template';
import { ResponseType } from '../types/formatter.types';

export class ListTemplate extends BaseTemplate {
  public readonly type: ResponseType = 'List';
}
