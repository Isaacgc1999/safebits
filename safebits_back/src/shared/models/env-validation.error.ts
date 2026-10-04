export class EnvValidationError extends Error {
  public readonly problems: readonly string[];

  public constructor(problems: readonly string[]) {
    super(`Invalid environment configuration: ${problems.join('; ')}`);
    this.name = 'EnvValidationError';
    this.problems = problems;
  }
}
