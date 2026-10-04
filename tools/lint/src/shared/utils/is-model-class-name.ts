import { MODEL_CLASS_SUFFIXES } from '../constants/declaration-folders.constants.js';

export function isModelClassName(name: string): boolean {
  return MODEL_CLASS_SUFFIXES.some((suffix) => name.endsWith(suffix));
}
