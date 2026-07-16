import { RevenueReportGroupBy } from '../dtos/filter-revenue-report.dto';

export interface RevenueReportRawRow {
  period: string;
  totalRevenue: string;
  totalServiceAmount: string;
  totalProductAmount: string;
  transactionCount: number;
}

export interface RevenueReportQueryParams {
  startDate: string;
  endDate: string;
  groupBy: RevenueReportGroupBy;
  timezone: string;
}

export interface RevenueReportRow {
  period: string;
  totalRevenue: string;
  totalServiceAmount: string;
  totalProductAmount: string;
  transactionCount: number;
}
