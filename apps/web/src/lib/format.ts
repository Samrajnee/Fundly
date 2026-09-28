export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function formatDaysLeft(daysAfterToday: number): string {
  if (daysAfterToday <= 0) return "Today is the last day of the month";
  return `${daysAfterToday} ${daysAfterToday === 1 ? "day" : "days"} left after today`;
}