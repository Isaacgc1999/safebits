export type ListState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'empty' }
  | { readonly status: 'error'; readonly reason: string }
  | { readonly status: 'ready'; readonly items: readonly T[] };
