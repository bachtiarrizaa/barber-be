import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TreatmentService } from '../services/treatment.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../../config/upload.config';
import { CreateTreatmentDto } from '../dtos/create-treatment.dto';
import { ITreatment } from '../entities/treatment.entity';

@Controller('treatments')
export class TreatmentController {
  constructor(private readonly treatmentService: TreatmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Treatment created successfully')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() createTreatmentDto: CreateTreatmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ITreatment> {
    return this.treatmentService.create(createTreatmentDto, file);
  }
}
