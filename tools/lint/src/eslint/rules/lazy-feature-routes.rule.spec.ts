import { createRuleTester } from '../rule-tester.js';
import { lazyFeatureRoutesRule } from './lazy-feature-routes.rule.js';

const ruleTester = createRuleTester();
const routes = '/repo/safebits_front/src/app/app.routes.ts';

ruleTester.run('lazy-feature-routes', lazyFeatureRoutesRule, {
  valid: [
    { code: "export const config = { component: 'x' };", filename: '/repo/safebits_front/src/app/app.config.ts' },
    {
      code: "export const routes = [{ path: 'semana', loadComponent: () => import('./features/week/week').then((m) => m.WeekPage) }];",
      filename: routes,
    },
    { code: "import type { WeekPage } from './features/week/week';\nexport type Page = WeekPage;", filename: routes },
    { code: "import type { Routes } from '@angular/router';\nexport const routes: Routes = [];", filename: routes },
    { code: "export const routes = [{ 'component': 'x' }];", filename: routes },
  ],
  invalid: [
    {
      code: "export const routes = [{ path: '', component: WeekPage }];",
      filename: routes,
      errors: [{ messageId: 'eagerComponent' }],
    },
    {
      code: "import { WeekPage } from './features/week/week';\nexport const page = WeekPage;",
      filename: routes,
      errors: [{ messageId: 'eagerFeatureImport' }],
    },
  ],
});
