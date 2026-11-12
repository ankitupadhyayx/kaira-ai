import { ContentLifecycleStatus } from '../types/versioning.types';

export class ContentLifecycleManager {
  private static readonly VALID_TRANSITIONS: Record<ContentLifecycleStatus, ContentLifecycleStatus[]> = {
    DRAFT: ['REVIEW', 'ARCHIVED'],
    REVIEW: ['APPROVED', 'DRAFT', 'ARCHIVED'],
    APPROVED: ['PUBLISHED', 'DRAFT'],
    PUBLISHED: ['DEPRECATED', 'ARCHIVED'],
    DEPRECATED: ['ARCHIVED', 'PUBLISHED'],
    ARCHIVED: ['DRAFT'],
  };

  public canTransition(current: ContentLifecycleStatus, target: ContentLifecycleStatus): boolean {
    const allowed = ContentLifecycleManager.VALID_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  public transition(current: ContentLifecycleStatus, target: ContentLifecycleStatus): ContentLifecycleStatus {
    if (!this.canTransition(current, target)) {
      throw new Error(`[ContentLifecycleManager] Invalid transition from "${current}" to "${target}".`);
    }
    return target;
  }
}
