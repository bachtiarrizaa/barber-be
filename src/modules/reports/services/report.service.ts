import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import type * as ExcelJS from 'exceljs';
import { ReportRepository } from '../repositories/report.repository';
import { generateReportExcel } from '../exporters/report-excel.exporter';
import {
  FilterReportRevenueDto,
  RevenueReportGroupBy,
} from '../dtos/filter-revenue-report.dto';
import { RevenueReportRow } from '../interfaces/revenue-report.interfaces';
import { FilterBarberPerformanceDto } from '../dtos/filter-barber-performance.dto';
import { BarberPerformanceRow } from '../interfaces/barber-performance-report.interfaces';
import { FilterTopItemsDto } from '../dtos/filter-top-items.dto';
import { TopItemsRow } from '../interfaces/top-items-report.interfaces';
import { FilterReportTransactionDto } from '../dtos/filter-report-transaction.dto';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import {
  ITransaction,
  Transaction,
} from '../../transactions/entities/transaction.entity';
import { TransactionRepository } from '../../transactions/repositories/transaction.repository';
import { ExportReportDto } from '../dtos/export-report.dto';
import { resolveDateRange } from '../../../common/utils/date-range.utils';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    @InjectRepository(Transaction)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async getRevenueReport(
    filter: FilterReportRevenueDto,
  ): Promise<RevenueReportRow[]> {
    const timezone = this.getReportTimezone();

    this.validateDateRange(filter.startDate, filter.endDate);

    const groupBy = filter.groupBy ?? RevenueReportGroupBy.DAY;
    const { startDate, endDate } = resolveDateRange(
      filter.startDate,
      filter.endDate,
    );

    const rows = await this.reportRepository.getRevenueReport({
      startDate,
      endDate,
      groupBy,
      timezone,
    });

    return rows;
  }

  async getBarberPerformanceReport(
    filter: FilterBarberPerformanceDto,
  ): Promise<BarberPerformanceRow[]> {
    const timezone = this.getReportTimezone();

    this.validateDateRange(filter.startDate, filter.endDate);

    const { startDate, endDate } = resolveDateRange(
      filter.startDate,
      filter.endDate,
    );

    const rows = await this.reportRepository.getBarberPerformanceReport({
      startDate,
      endDate,
      timezone,
    });

    return rows;
  }

  async getTopItemsReport(filter: FilterTopItemsDto): Promise<TopItemsRow[]> {
    const timezone = this.getReportTimezone();

    this.validateDateRange(filter.startDate, filter.endDate);

    const { startDate, endDate } = resolveDateRange(
      filter.startDate,
      filter.endDate,
    );

    const limit = filter.limit ?? 10;

    const rows = await this.reportRepository.getTopItemsReport({
      startDate,
      endDate,
      timezone,
      itemType: filter.itemType,
      limit,
    });

    return rows;
  }

  async getTransactionReport(
    filter: FilterReportTransactionDto,
  ): Promise<PaginatedResult<ITransaction>> {
    const timezone = this.getReportTimezone();

    this.validateDateRange(filter.startDate, filter.endDate);

    const { startDate, endDate } = resolveDateRange(
      filter.startDate,
      filter.endDate,
    );

    const { status, barberId, customerId, paymentMethod, ...paginationQuery } =
      filter;

    const where = this.reportRepository.getTransactionFilters({
      timezone,
      startDate,
      endDate,
      status,
      barberId,
      customerId,
      paymentMethod,
    });

    return paginate<ITransaction>(this.transactionRepository, paginationQuery, {
      filters: where,
      orderBy: { paidAt: 'DESC' },
      populate: ['customer', 'barber', 'cashier'] as const,
    });
  }

  async generateReportWorkbook(
    filter: ExportReportDto,
  ): Promise<ExcelJS.Workbook> {
    const timezone = this.getReportTimezone();

    this.validateDateRange(filter.startDate, filter.endDate);

    const { startDate, endDate } = resolveDateRange(
      filter.startDate,
      filter.endDate,
    );

    // Fetch all data in parallel
    const [revenueRows, barberRows, topItemsRows, transactionResult] =
      await Promise.all([
        this.reportRepository.getRevenueReport({
          startDate,
          endDate,
          groupBy: RevenueReportGroupBy.DAY,
          timezone,
        }),
        this.reportRepository.getBarberPerformanceReport({
          startDate,
          endDate,
          timezone,
        }),
        this.reportRepository.getTopItemsReport({
          startDate,
          endDate,
          timezone,
          limit: 50,
        }),
        this.getTransactionReport({
          page: 1,
          limit: 100,
          startDate,
          endDate,
        }),
      ]);

    return generateReportExcel({
      timezone,
      revenueRows,
      barberRows,
      topItemsRows,
      transactions: transactionResult.items,
    });
  }

  private getReportTimezone(): string {
    return 'Asia/Jakarta';
  }

  private validateDateRange(startDate?: string, endDate?: string): void {
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'startDate tidak boleh lebih besar dari endDate',
      );
    }
  }
}
