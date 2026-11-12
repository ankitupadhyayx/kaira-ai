import { BaseTemplate } from './base.template';
import { ResponseType } from '../types/formatter.types';

export class ServiceTemplate extends BaseTemplate {
  public readonly type: ResponseType = 'Service Information';
}
