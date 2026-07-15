import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ReportRepository,
  RevenueReportRow,
} from '../repositories/report.repository';
import {
  FilterReportRevenueDto,
  RevenueReportGroupBy,
} from '../dtos/filter-revenue-report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async getRevenueReport(
    filter: FilterReportRevenueDto,
  ): Promise<RevenueReportRow[]> {
    const timezone = this.getReportTimezone();

    if (
      filter.startDate &&
      filter.endDate &&
      filter.startDate > filter.endDate
    ) {
      throw new BadRequestException(
        'startDate tidak boleh lebih besar dari endDate',
      );
    }

    const groupBy = filter.groupBy ?? RevenueReportGroupBy.DAY;
    const startDate = filter.startDate ?? this.getFirstDayOfCurrentMonth();
    const endDate = filter.endDate ?? this.getToday();

    const rows = await this.reportRepository.getRevenueReport({
      startDate,
      endDate,
      groupBy,
      timezone,
    });

    return rows;
  }

  private getReportTimezone(): string {
    return 'Asia/Jakarta';
  }

  private getFirstDayOfCurrentMonth(): string {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.toDateString(first);
  }

  private getToday(): string {
    return this.toDateString(new Date());
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
