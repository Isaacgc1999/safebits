import { describe, expect, it } from 'vitest';
import { API_BASE_PATH, PRODUCT_NAME } from './product.constants.js';

describe('product constants', () => {
  it('names the product', () => {
    expect(PRODUCT_NAME).toBe('safebits');
  });

  it('serves the API under /api', () => {
    expect(API_BASE_PATH).toBe('/api');
  });
});
