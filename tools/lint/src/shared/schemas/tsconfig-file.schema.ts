import { z } from 'zod';

export const tsconfigFileSchema = z.object({
  compilerOptions: z.record(z.string(), z.unknown()),
});
