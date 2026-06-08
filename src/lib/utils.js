import { differenceInDays, parseISO, subDays, format } from 'date-fns';

export const START_DATE = '2026-05-30';

export function getDayNumber(dateStr) {
  return differenceInDays(parseISO(dateStr), parseISO(START_DATE)) + 1;
}

export function calcStreak(sessionDates, todayStr) {
  let streak = 0;
  let d = todayStr;
  if (!sessionDates.includes(d)) {
    d = format(subDays(parseISO(d), 1), 'yyyy-MM-dd');
  }
  while (d >= START_DATE && sessionDates.includes(d)) {
    streak++;
    d = format(subDays(parseISO(d), 1), 'yyyy-MM-dd');
  }
  return streak;
}

export function calcMissed(sessionDates, todayStr) {
  const total = differenceInDays(parseISO(todayStr), parseISO(START_DATE));
  const uploaded = sessionDates.filter(d => d >= START_DATE && d < todayStr).length;
  return Math.max(0, total - uploaded);
}
