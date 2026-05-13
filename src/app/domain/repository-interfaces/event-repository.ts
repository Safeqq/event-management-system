import type { EventState } from "../aggregates/event";

export interface EventRepository {
  findById(id: string): Promise<EventState | null>;
  findAll(): Promise<EventState[]>;
  findByOrganizer(organizerId: string): Promise<EventState[]>;
  save(event: EventState): Promise<void>;
  update(event: EventState): Promise<void>;
  delete(id: string): Promise<void>;
}
