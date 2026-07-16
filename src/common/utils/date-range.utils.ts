import { ReportDateRange } from '../../modules/reports/interfaces/report.interface';

export function resolveDateRange(
  startDate?: string,
  endDate?: string,
): ReportDateRange {
  return {
    startDate: startDate ?? getFirstDayOfCurrentMonth(),
    endDate: endDate ?? getToday(),
  };
}

function getFirstDayOfCurrentMonth(): string {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return toDateString(firstDay);
}

function getToday(): string {
  return toDateString(new Date());
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
