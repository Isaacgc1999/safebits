import {
  CONSTANT_FOLDERS,
  ENUM_FOLDER,
  INTERFACE_FOLDER,
  MODEL_FOLDER,
  TYPE_FOLDER,
} from '../constants/declaration-folders.constants.js';
import type { DeclarationKind } from '../types/declaration-kind.type.js';

export function expectedFolders(kind: DeclarationKind): readonly string[] {
  switch (kind) {
    case 'interface':
      return [INTERFACE_FOLDER];
    case 'type':
      return [TYPE_FOLDER];
    case 'enum':
      return [ENUM_FOLDER];
    case 'constant':
      return CONSTANT_FOLDERS;
    case 'model':
      return [MODEL_FOLDER];
  }
}
