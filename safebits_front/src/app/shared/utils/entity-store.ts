import { type Signal, computed, signal } from '@angular/core';
import type { Identifiable } from '../interfaces/identifiable.interface';

export class EntityStore<TEntity extends Identifiable<TId>, TId extends string = string> {
  private readonly entities = signal<ReadonlyMap<TId, TEntity>>(new Map());

  public readonly all: Signal<readonly TEntity[]> = computed(() => [...this.entities().values()]);

  public readonly count: Signal<number> = computed(() => this.entities().size);

  public byId(id: TId): Signal<TEntity | undefined> {
    return computed(() => this.entities().get(id));
  }

  public setAll(items: readonly TEntity[]): void {
    this.entities.set(new Map(items.map((item) => [item.id, item])));
  }

  public upsert(item: TEntity): void {
    this.entities.update((current) => new Map(current).set(item.id, item));
  }

  public remove(id: TId): void {
    this.entities.update((current) => {
      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }

  public clear(): void {
    this.entities.set(new Map());
  }
}
