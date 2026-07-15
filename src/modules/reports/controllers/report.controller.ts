import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ReportService } from '../services/report.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
// import { Permissions } from '../../../common/decorators/permission.decorator';
import { FilterReportRevenueDto } from '../dtos/filter-revenue-report.dto';

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
}
