export interface Email {
  readonly value: string;
}

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const createEmail = (value: string): Email => {
  if (!isValidEmail(value)) throw new Error("Invalid email format");
  return { value };
};

export const equalsEmail = (a: Email, b: Email): boolean => a.value === b.value;
