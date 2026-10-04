import { EntityStore } from './entity-store';

interface Meal {
  readonly id: string;
  readonly name: string;
}

const lentejas: Meal = { id: 'm1', name: 'Lentejas' };
const crema: Meal = { id: 'm2', name: 'Crema de calabaza' };

describe('EntityStore', () => {
  it('starts empty', () => {
    const store = new EntityStore<Meal>();
    expect(store.all()).toEqual([]);
    expect(store.count()).toBe(0);
  });

  it('replaces every entity with setAll', () => {
    const store = new EntityStore<Meal>();
    store.setAll([lentejas]);
    store.setAll([crema]);
    expect(store.all()).toEqual([crema]);
  });

  it('adds a new entity and updates an existing one with upsert', () => {
    const store = new EntityStore<Meal>();
    store.upsert(lentejas);
    store.upsert({ ...lentejas, name: 'Lentejas con verduras' });
    store.upsert(crema);
    expect(store.count()).toBe(2);
    expect(store.byId('m1')()?.name).toBe('Lentejas con verduras');
  });

  it('keeps byId reactive to later changes', () => {
    const store = new EntityStore<Meal>();
    const selected = store.byId('m2');
    expect(selected()).toBeUndefined();
    store.upsert(crema);
    expect(selected()).toEqual(crema);
  });

  it('removes a single entity', () => {
    const store = new EntityStore<Meal>();
    store.setAll([lentejas, crema]);
    store.remove('m1');
    expect(store.all()).toEqual([crema]);
  });

  it('clears every entity', () => {
    const store = new EntityStore<Meal>();
    store.setAll([lentejas, crema]);
    store.clear();
    expect(store.count()).toBe(0);
  });
});
