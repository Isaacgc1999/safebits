import type { Identifiable } from './identifiable.interface';

export interface Repository<TEntity extends Identifiable<TId>, TId extends string = string> {
  list(): Promise<readonly TEntity[]>;
  get(id: TId): Promise<TEntity | undefined>;
  save(entity: TEntity): Promise<TEntity>;
  remove(id: TId): Promise<void>;
}
