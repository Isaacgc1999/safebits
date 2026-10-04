import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, TitleStrategy, provideRouter } from '@angular/router';
import { ProductTitleStrategy } from './product-title.strategy';

@Component({ template: '' })
class EmptyPage {}

describe('ProductTitleStrategy', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'semana', title: 'Semana', component: EmptyPage },
          { path: 'sin-titulo', component: EmptyPage },
        ]),
        { provide: TitleStrategy, useClass: ProductTitleStrategy },
      ],
    });
  });

  it('sets the page title followed by the product name', async () => {
    await TestBed.inject(Router).navigateByUrl('/semana');
    expect(TestBed.inject(Title).getTitle()).toBe('Semana · safebits');
  });

  it('falls back to the product name', async () => {
    await TestBed.inject(Router).navigateByUrl('/sin-titulo');
    expect(TestBed.inject(Title).getTitle()).toBe('safebits');
  });
});
