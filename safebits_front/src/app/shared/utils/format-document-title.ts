import { PRODUCT_NAME } from '@safebits/shared';
import { DOCUMENT_TITLE_SEPARATOR } from '../constants/document-title.constants';

export function formatDocumentTitle(pageTitle: string | undefined): string {
  if (pageTitle === undefined || pageTitle.trim() === '') {
    return PRODUCT_NAME;
  }
  return `${pageTitle}${DOCUMENT_TITLE_SEPARATOR}${PRODUCT_NAME}`;
}
