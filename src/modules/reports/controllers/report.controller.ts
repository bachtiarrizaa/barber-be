import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import * as express from 'express';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ReportService } from '../services/report.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
// import { Permissions } from '../../../common/decorators/permission.decorator';
import { FilterReportRevenueDto } from '../dtos/filter-revenue-report.dto';
import { FilterBarberPerformanceDto } from '../dtos/filter-barber-performance.dto';
import { FilterTopItemsDto } from '../dtos/filter-top-items.dto';
import { FilterReportTransactionDto } from '../dtos/filter-report-transaction.dto';
import { ExportReportDto } from '../dtos/export-report.dto';
import { resolveDateRange } from '../../../common/utils/date-range.utils';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('revenue')
  @ResponseMessage('Revenue report retrieved successfully')
  // @Permissions('reports:read')
  async getRevenueReport(@Query() filter: FilterReportRevenueDto) {
    return this.reportService.getRevenueReport(filter);
  }

  @Get('barber-performance')
  @ResponseMessage('Barber performance retrieved successfully')
  async getBarberPerformanceReport(
    @Query() filter: FilterBarberPerformanceDto,
  ) {
    return this.reportService.getBarberPerformanceReport(filter);
  }

  @Get('top-items')
  @ResponseMessage('Top items report retrieved successfully')
  async getTopItemsReport(@Query() filter: FilterTopItemsDto) {
    return this.reportService.getTopItemsReport(filter);
  }

  @Get('transactions')
  @ResponseMessage('Transaction report retrieved successfully')
  async getTransactionReport(@Query() filter: FilterReportTransactionDto) {
    return this.reportService.getTransactionReport(filter);
  }

  @Get('export')
  async exportReport(
    @Query() filter: ExportReportDto,
    @Res() res: express.Response,
  ) {
    const workbook = await this.reportService.generateReportWorkbook(filter);

    const { startDate, endDate } = resolveDateRange(
      filter.startDate,
      filter.endDate,
    );
    const filename = `report_${startDate}_${endDate}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  }
}
