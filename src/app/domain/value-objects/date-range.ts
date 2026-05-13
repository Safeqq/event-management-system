export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

export const createDateRange = (start: Date, end: Date): DateRange => {
  if (end < start)
    throw new Error("End date cannot be earlier than start date");
  return { start, end };
};

export const dateRangeContains = (range: DateRange, date: Date): boolean =>
  date >= range.start && date <= range.end;

export const isDateRangeActive = (
  range: DateRange,
  now: Date = new Date(),
): boolean => now >= range.start && now <= range.end;
