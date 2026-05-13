import { nanoid } from "nanoid";

export interface TicketCode {
  readonly value: string;
}

export const createTicketCode = (value: string): TicketCode => {
  if (!value || value.length < 8) throw new Error("Invalid ticket code");
  return { value };
};

export const generateTicketCode = (): TicketCode => ({
  value: nanoid(12).toUpperCase(),
});

export const equalsTicketCode = (a: TicketCode, b: TicketCode): boolean =>
  a.value === b.value;
