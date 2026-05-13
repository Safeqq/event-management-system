import { Event } from "../aggregates/event";

export interface EventRepository {
  findById(id: string): Promise<Event | null>;
  findAll(): Promise<Event[]>;
  findByOrganizer(organizerId: string): Promise<Event[]>;
  save(event: Event): Promise<void>;
  update(event: Event): Promise<void>;
  delete(id: string): Promise<void>;
}
