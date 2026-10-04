import type { EntityId } from '@safebits/shared';

export interface Identifiable<TId extends EntityId = EntityId> {
  readonly id: TId;
}
