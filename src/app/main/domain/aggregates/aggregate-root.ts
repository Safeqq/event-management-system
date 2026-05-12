import { DomainEvent } from "../domain-events/domain-event";

export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];
  public get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
  public clearEvents(): void {
    this._domainEvents = [];
  }
}
