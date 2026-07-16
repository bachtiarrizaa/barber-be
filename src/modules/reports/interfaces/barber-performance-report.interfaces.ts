export interface BarberPerformanceQueryParams {
  startDate: string;
  endDate: string;
  timezone: string;
}

export interface BarberPerformanceRawRow {
  barberId: string;
  barberName: string;
  totalRevenue: string;
  transactionCount: number;
  serviceCommissionAmount: string;
  productCommissionAmount: string;
  totalCommissionAmount: string;
}

export interface BarberPerformanceRow {
  barberId: string;
  barberName: string;
  totalRevenue: string;
  transactionCount: number;
  serviceCommissionAmount: string;
  productCommissionAmount: string;
  totalCommissionAmount: string;
}
