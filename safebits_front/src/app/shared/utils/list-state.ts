import type { ListState } from '../types/list-state.type';

export function loadingListState<T>(): ListState<T> {
  return { status: 'loading' };
}

export function errorListState<T>(reason: string): ListState<T> {
  return { status: 'error', reason };
}

export function listStateOf<T>(items: readonly T[]): ListState<T> {
  return items.length === 0 ? { status: 'empty' } : { status: 'ready', items };
}
