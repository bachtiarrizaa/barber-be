import { Injectable } from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/postgresql';
import { sql } from '@mikro-orm/core';
import { RevenueReportGroupBy } from '../dtos/filter-revenue-report.dto';
import { ITransaction, Transaction } from '../../transactions/entities/transaction.entity';
import {
  RevenueReportQueryParams,
  RevenueReportRawRow,
  RevenueReportRow,
} from '../interfaces/revenue-report.interfaces';
import {
  BarberPerformanceQueryParams,
  BarberPerformanceRawRow,
} from '../interfaces/barber-performance-report.interfaces';
import {
  TopItemsQueryParams,
  TopItemsRawRow,
  TopItemsRow,
} from '../interfaces/top-items-report.interfaces';

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

  async getBarberPerformanceReport(
    params: BarberPerformanceQueryParams,
  ): Promise<BarberPerformanceRawRow[]> {
    const { startDate, endDate, timezone } = params;

    const sqlQuery = `
      select
        u.id as "barberId",
        u.name as "barberName",
        coalesce(sum(t.total), 0)::numeric(12,2)::text as "totalRevenue",
        count(t.id)::int as "transactionCount",
        coalesce(sum(t.service_commission_amount), 0)::numeric(12,2)::text as "serviceCommissionAmount",
        coalesce(sum(t.product_commission_amount), 0)::numeric(12,2)::text as "productCommissionAmount",
        coalesce(sum(t.total_commission_amount), 0)::numeric(12,2)::text as "totalCommissionAmount"
      from users u
      inner join roles r on r.id = u.role_id
      left join transactions t
        on t.barber_id = u.id
        and t.status = 'completed'
        and t.paid_at is not null
        and (t.paid_at at time zone 'UTC' at time zone ?) >= ?::date
        and (t.paid_at at time zone 'UTC' at time zone ?) < (?::date + interval '1 day')
      where r.name = 'barber'
      group by u.id, u.name
      order by "totalRevenue" desc
    `;

    const bindings: unknown[] = [timezone, startDate, timezone, endDate];

    const rows = await this.em
      .getConnection()
      .execute<BarberPerformanceRawRow[]>(sqlQuery, bindings);

    return rows.map((row) => ({
      barberId: row.barberId,
      barberName: row.barberName,
      totalRevenue: row.totalRevenue,
      transactionCount: Number(row.transactionCount),
      serviceCommissionAmount: row.serviceCommissionAmount,
      productCommissionAmount: row.productCommissionAmount,
      totalCommissionAmount: row.totalCommissionAmount,
    }));
  }

  async getTopItemsReport(params: TopItemsQueryParams): Promise<TopItemsRow[]> {
    const { startDate, endDate, timezone, itemType, limit } = params;

    const bindings: unknown[] = [timezone, startDate, timezone, endDate];
    let itemTypeFilter = '';

    if (itemType) {
      itemTypeFilter = 'AND ti.item_type = ?';
      bindings.push(itemType);
    }

    bindings.push(limit);

    const sqlQuery = `
      SELECT
        ti.item_id AS "itemId",
        ti.item_name AS "itemName",
        ti.item_type AS "itemType",
        SUM(ti.quantity)::int AS "totalQuantity",
        SUM(ti.subtotal)::numeric(12,2)::text AS "totalRevenue",
        COUNT(DISTINCT ti.transaction_id)::int AS "transactionCount"
      FROM transaction_items ti
      INNER JOIN transactions t ON t.id = ti.transaction_id
        AND t.status = 'completed'
        AND t.paid_at IS NOT NULL
        AND (t.paid_at AT TIME ZONE 'UTC' AT TIME ZONE ?) >= ?::date
        AND (t.paid_at AT TIME ZONE 'UTC' AT TIME ZONE ?) < (?::date + interval '1 day')
      WHERE ti.item_id IS NOT NULL
        ${itemTypeFilter}
      GROUP BY ti.item_id, ti.item_name, ti.item_type
      ORDER BY "totalQuantity" DESC
      LIMIT ?
    `;

    const rows = await this.em
      .getConnection()
      .execute<TopItemsRawRow[]>(sqlQuery, bindings);

    return rows.map((row) => ({
      itemId: row.itemId,
      itemName: row.itemName,
      itemType: row.itemType,
      totalQuantity: Number(row.totalQuantity),
      totalRevenue: row.totalRevenue,
      transactionCount: Number(row.transactionCount),
    }));
  }

  getTransactionFilters(params: {
    timezone: string;
    startDate: string;
    endDate: string;
    status?: string;
    barberId?: string;
    customerId?: string;
    paymentMethod?: string;
  }): FilterQuery<ITransaction> {
    const { timezone, startDate, endDate, status, barberId, customerId, paymentMethod } = params;

    const where: FilterQuery<ITransaction> = {
      paidAt: { $ne: null },
    };

    if (status) {
      (where as Record<string, unknown>).status = status;
    }
    if (barberId) {
      (where as Record<string, unknown>).barber = barberId;
    }
    if (customerId) {
      (where as Record<string, unknown>).customer = customerId;
    }
    if (paymentMethod) {
      (where as Record<string, unknown>).paymentMethod = paymentMethod;
    }

    // paidAt date range filter (local timezone aware via raw condition)
    const localPaidAt = sql<string>`(paid_at AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})`;
    (where as Record<string, unknown>).$and = [
      sql`${localPaidAt} >= ${startDate}::date`,
      sql`${localPaidAt} < (${endDate}::date + interval '1 day')`,
    ];

    return where;
  }
}
