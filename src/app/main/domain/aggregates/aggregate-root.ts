import type { DomainEvent } from "../domain-events/domain-event";
import type { Entity } from "../entities/entity";

export interface Aggregate extends Entity {
  domainEvents: DomainEvent[];
}

export const addDomainEvent = (agg: Aggregate, event: DomainEvent): void => {
  agg.domainEvents.push(event);
};

export const clearDomainEvents = (agg: Aggregate): void => {
  agg.domainEvents = [];
};
