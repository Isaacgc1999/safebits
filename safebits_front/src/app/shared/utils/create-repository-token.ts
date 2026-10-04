import { InjectionToken } from '@angular/core';
import type { Identifiable } from '../interfaces/identifiable.interface';
import type { Repository } from '../interfaces/repository.interface';

export function createRepositoryToken<TEntity extends Identifiable<TId>, TId extends string = string>(
  entityName: string,
): InjectionToken<Repository<TEntity, TId>> {
  return new InjectionToken<Repository<TEntity, TId>>(`Repository<${entityName}>`);
}
