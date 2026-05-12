export abstract class Entity {
  constructor(public readonly id: string) {}

  public equals(other: Entity): boolean {
    if (other === null || other === undefined) return false;
    if (other.constructor !== this.constructor) return false;
    return this.id === other.id;
  }
}
