import { Event } from "../../../domain/entities/event";

export interface CreateEventInput {
  title: string;
  description: string;
  date: Date;
  location: string;
  organizerId: string;
}

export interface EventService {
  create(input: CreateEventInput): Promise<Event>;
  publish(eventId: string): Promise<void>;
  cancel(eventId: string): Promise<void>;
}
