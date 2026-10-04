import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the root component', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeInstanceOf(App);
  });

  it('renders the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.debugElement.query(By.css('router-outlet'))).not.toBeNull();
  });
});
