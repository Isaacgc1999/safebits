import { TestBed } from '@angular/core/testing';
import { Router, TitleStrategy } from '@angular/router';
import { appConfig } from './app.config';
import { routes } from './app.routes';
import { ProductTitleStrategy } from './core/title/product-title.strategy';

describe('appConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  it('uses the product title strategy', () => {
    expect(TestBed.inject(TitleStrategy)).toBeInstanceOf(ProductTitleStrategy);
  });

  it('registers the application routes', () => {
    expect(TestBed.inject(Router).config).toEqual(routes);
  });
});
