// src/lib/utils.ts

export function formatDate(dateInput: string | number | Date, short = false): string {
  const date = new Date(dateInput);

  const options: Intl.DateTimeFormatOptions = short
    ? { month: "short" }
    : { year: "numeric", month: "short", day: "numeric" };

  return date.toLocaleDateString("en-US", options);
}
