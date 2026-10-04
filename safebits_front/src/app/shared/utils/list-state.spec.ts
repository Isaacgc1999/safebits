import { errorListState, listStateOf, loadingListState } from './list-state';

describe('list state helpers', () => {
  it('describes a loading list', () => {
    expect(loadingListState<string>()).toEqual({ status: 'loading' });
  });

  it('describes a failed list with its reason', () => {
    expect(errorListState<string>('network')).toEqual({ status: 'error', reason: 'network' });
  });

  it('describes an empty list', () => {
    expect(listStateOf<string>([])).toEqual({ status: 'empty' });
  });

  it('describes a list with items', () => {
    expect(listStateOf(['lentejas'])).toEqual({ status: 'ready', items: ['lentejas'] });
  });
});
