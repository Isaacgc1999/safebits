import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { formatDocumentTitle } from '../../shared/utils/format-document-title';

@Injectable({ providedIn: 'root' })
export class ProductTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  public override updateTitle(snapshot: RouterStateSnapshot): void {
    this.title.setTitle(formatDocumentTitle(this.buildTitle(snapshot)));
  }
}
