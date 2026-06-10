import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { TreatmentService } from '../services/treatment.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../../config/upload.config';
import { CreateTreatmentDto } from '../dtos/create-treatment.dto';
import { ITreatment } from '../entities/treatment.entity';
import { FilterTreatmentDto } from '../dtos/filter-treatment.dto';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { UpdateTreatmentDto } from '../dtos/update-treatment.dto';
import { UpdateProductStatusDto } from '../../products/dtos/update-product-status.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Permissions } from '../../../common/decorators/permission.decorator';

@Controller('treatments')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TreatmentController {
  constructor(private readonly treatmentService: TreatmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Treatment created successfully')
  @UseInterceptors(FileInterceptor('image', multerConfig('treatments')))
  @Permissions('treatments:create')
  async create(
    @Body() createTreatmentDto: CreateTreatmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ITreatment> {
    return this.treatmentService.create(createTreatmentDto, file);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Treatments retrieved successfully')
  @Permissions('treatments:read')
  async findAll(
    @Query() filterDto: FilterTreatmentDto,
  ): Promise<PaginatedResult<ITreatment>> {
    return this.treatmentService.findAll(filterDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Treatments retrieved successfully')
  @Permissions('treatments:read')
  async findById(@Param('id') id: string): Promise<ITreatment> {
    return this.treatmentService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Treatment updated succesfully')
  @UseInterceptors(FileInterceptor('image', multerConfig('treatments')))
  @Permissions('treatments:update')
  async update(
    @Param('id') id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ITreatment> {
    return this.treatmentService.update(id, updateTreatmentDto, file);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Treatment status updated successfully')
  @Permissions('treatments:update')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateTreatmentStatusDto: UpdateProductStatusDto,
  ): Promise<ITreatment> {
    return this.treatmentService.updateStatus(id, updateTreatmentStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Treatment deleted successfully')
  @Permissions('treatments:delete')
  async delete(@Param('id') id: string): Promise<void> {
    return this.treatmentService.delete(id);
  }
}
