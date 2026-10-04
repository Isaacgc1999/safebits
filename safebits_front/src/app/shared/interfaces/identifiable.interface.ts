export interface Identifiable<TId extends string = string> {
  readonly id: TId;
}
