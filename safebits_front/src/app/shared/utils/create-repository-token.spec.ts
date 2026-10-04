import { TestBed } from '@angular/core/testing';
import type { Repository } from '../interfaces/repository.interface';
import { createRepositoryToken } from './create-repository-token';

interface Meal {
  readonly id: string;
  readonly name: string;
}

class InMemoryMealRepository implements Repository<Meal> {
  private readonly meals = new Map<string, Meal>();

  public list(): Promise<readonly Meal[]> {
    return Promise.resolve([...this.meals.values()]);
  }

  public get(id: string): Promise<Meal | undefined> {
    return Promise.resolve(this.meals.get(id));
  }

  public save(entity: Meal): Promise<Meal> {
    this.meals.set(entity.id, entity);
    return Promise.resolve(entity);
  }

  public remove(id: string): Promise<void> {
    this.meals.delete(id);
    return Promise.resolve();
  }
}

describe('createRepositoryToken', () => {
  it('names the token after the entity', () => {
    expect(createRepositoryToken<Meal>('Meal').toString()).toContain('Repository<Meal>');
  });

  it('lets a feature swap the repository implementation through dependency injection', async () => {
    const token = createRepositoryToken<Meal>('Meal');
    TestBed.configureTestingModule({ providers: [{ provide: token, useClass: InMemoryMealRepository }] });
    const repository = TestBed.inject(token);
    await repository.save({ id: 'm1', name: 'Lentejas' });
    expect(await repository.get('m1')).toEqual({ id: 'm1', name: 'Lentejas' });
    expect(await repository.list()).toHaveLength(1);
    await repository.remove('m1');
    expect(await repository.list()).toEqual([]);
  });
});
