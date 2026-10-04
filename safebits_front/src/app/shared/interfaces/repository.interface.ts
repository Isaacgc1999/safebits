import type { EntityId } from '@safebits/shared';
import type { Identifiable } from './identifiable.interface';

export interface Repository<TEntity extends Identifiable<TId>, TId extends EntityId = EntityId> {
  list(): Promise<readonly TEntity[]>;
  get(id: TId): Promise<TEntity | undefined>;
  save(entity: TEntity): Promise<TEntity>;
  remove(id: TId): Promise<void>;
}
