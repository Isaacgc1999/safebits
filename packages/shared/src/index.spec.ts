import { describe, expect, it } from 'vitest';
import { API_BASE_PATH, PRODUCT_NAME } from './index.js';

describe('shared package entry point', () => {
  it('exposes the product constants', () => {
    expect({ API_BASE_PATH, PRODUCT_NAME }).toEqual({ API_BASE_PATH: '/api', PRODUCT_NAME: 'safebits' });
  });
});
