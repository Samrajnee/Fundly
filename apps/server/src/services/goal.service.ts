export function calculateMonthlyRequired(
  targetAmount: number,
  currentAmount: number,
  targetDate: Date
): number {
  const now = new Date();
  const monthsRemaining = Math.max(
    (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth()),
    1
  );
  const remaining = Math.max(targetAmount - currentAmount, 0);
  return Math.round((remaining / monthsRemaining) * 100) / 100;
}