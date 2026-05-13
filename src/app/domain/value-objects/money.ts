export interface Money {
  readonly amount: number;
  readonly currency: string;
}

export const createMoney = (
  amount: number,
  currency: string = "IDR",
): Money => {
  if (amount < 0) throw new Error("Amount cannot be negative");
  return { amount, currency };
};

export const addMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) throw new Error("Currency mismatch");
  return { amount: a.amount + b.amount, currency: a.currency };
};

export const multiplyMoney = (money: Money, factor: number): Money => ({
  amount: money.amount * factor,
  currency: money.currency,
});

export const equalsMoney = (a: Money, b: Money): boolean =>
  a.amount === b.amount && a.currency === b.currency;
