import { Component, Input } from '@angular/core';

@Component({ selector: 'sb-decorator-input', template: '' })
export class DecoratorInput {
  @Input() public name = '';
}
