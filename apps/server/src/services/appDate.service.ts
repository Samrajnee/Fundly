export function getAppToday(): { year: number; month: number; day: number; daysInMonth: number } {
  const timeZone = process.env.APP_TIMEZONE ?? "Asia/Kolkata";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return { year, month, day, daysInMonth };
}