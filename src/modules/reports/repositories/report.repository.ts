import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { sql } from '@mikro-orm/core';
import { RevenueReportGroupBy } from '../dtos/filter-revenue-report.dto';
import { Transaction } from '../../transactions/entities/transaction.entity';

interface RevenueReportRawRow {
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

@Injectable()
export class ReportRepository {
  constructor(private readonly em: EntityManager) {}

  async getRevenueReport(
    params: RevenueReportQueryParams,
  ): Promise<RevenueReportRow[]> {
    const { startDate, endDate, groupBy, timezone } = params;

    const dateFormat =
      groupBy === RevenueReportGroupBy.MONTH ? 'YYYY-MM' : 'YYYY-MM-DD';

    const localPaidAt = sql`t.paid_at at time zone 'UTC' at time zone ${timezone}`;

    const periodAlias = 'period' as unknown as 'id';

    const db = this.em
      .createQueryBuilder(Transaction, 't')
      .select([
        sql`to_char(date_trunc(${groupBy}, ${localPaidAt}), ${dateFormat})`.as(
          'period',
        ),
        sql`sum(t.total)::text`.as('totalRevenue'),
        sql`sum(t.total_service_amount)::text`.as('totalServiceAmount'),
        sql`sum(t.total_product_amount)::text`.as('totalProductAmount'),
        sql`count(*)::int`.as('transactionCount'),
      ])
      .where({ status: 'completed', paidAt: { $ne: null } })
      .andWhere(sql`${localPaidAt} >= ${startDate}::date`)
      .andWhere(sql`${localPaidAt} < (${endDate}::date + interval '1 day')`)
      .groupBy(periodAlias)
      .orderBy({ [periodAlias]: 'asc' });

    const rows = await db.execute<RevenueReportRawRow[]>('all');

    return rows.map((row) => ({
      period: row.period,
      totalRevenue: row.totalRevenue,
      totalServiceAmount: row.totalServiceAmount,
      totalProductAmount: row.totalProductAmount,
      transactionCount: row.transactionCount,
    }));
  }
}
