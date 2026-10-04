import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import ts from 'typescript';
import { tsconfigFileSchema } from '../shared/schemas/tsconfig-file.schema.js';

export function compileWithBaseFlags(baseConfigPath: string, fileName: string): readonly number[] {
  const config = tsconfigFileSchema.parse(JSON.parse(readFileSync(baseConfigPath, 'utf8')));
  const converted = ts.convertCompilerOptionsFromJson(config.compilerOptions, dirname(baseConfigPath));
  const options: ts.CompilerOptions = {
    ...converted.options,
    noEmit: true,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    types: [],
  };
  const program = ts.createProgram([fileName], options);
  return ts.getPreEmitDiagnostics(program).map((diagnostic) => diagnostic.code);
}
