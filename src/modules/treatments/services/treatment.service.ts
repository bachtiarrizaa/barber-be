import { InjectRepository } from '@mikro-orm/nestjs';
import { CreateTreatmentDto } from '../dtos/create-treatment.dto';
import { ITreatment, Treatment } from '../entities/treatment.entity';
import { TreatmentRepository } from '../repositories/treatment.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import { FilterTreatmentDto } from '../dtos/filter-treatment.dto';
import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { UpdateTreatmentDto } from '../dtos/update-treatment.dto';
import { join } from 'path';
import * as fs from 'fs';
import { UpdateTreatmentStatusDto } from '../dtos/update-treatment-status.dto';

export class TreatmentService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepository: TreatmentRepository,
    private readonly em: EntityManager,
  ) {}

  private readonly logger = new Logger(TreatmentService.name);

  private async deleteImageFile(
    imagePath: string | null | undefined,
  ): Promise<void> {
    if (!imagePath) return;
    try {
      const fullPath = join(process.cwd(), imagePath);
      await fs.promises.access(fullPath);
      await fs.promises.unlink(fullPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error(`Failed to delete image file: ${imagePath}`, error);
      }
    }
  }

  async create(
    createTreatmentDto: CreateTreatmentDto,
    file?: Express.Multer.File,
  ): Promise<ITreatment> {
    const existName = await this.treatmentRepository.findOne({
      name: createTreatmentDto.name,
    });
    if (existName) {
      throw new ConflictException('Treatment with this name already exist');
    }

    const treatmentData = {
      name: createTreatmentDto.name,
      description: createTreatmentDto.description ?? null,
      price: createTreatmentDto.price,
      isActive: createTreatmentDto.isActive ?? true,
    };

    const imageData = file ? `/uploads/treatments${file.filename}` : null;

    const treatment = this.treatmentRepository.create({
      ...treatmentData,
      image: imageData,
    });

    await this.em.persist(treatment).flush();
    return treatment;
  }

  async findAll(
    filterDto: FilterTreatmentDto,
  ): Promise<PaginatedResult<ITreatment>> {
    const { isActive, ...paginationQuery } = filterDto;

    const filters: Partial<{ isActive: boolean }> = {};
    if (isActive !== undefined) {
      filters.isActive = isActive;
    }

    return paginate<ITreatment>(this.treatmentRepository, paginationQuery, {
      searchFields: ['name'],
      filters,
      orderBy: { createdAt: 'Desc' },
    });
  }

  async findById(id: string): Promise<ITreatment> {
    const treatment = await this.treatmentRepository.findOne({ id });
    if (!treatment) {
      throw new NotFoundException('Treatment not found');
    }
    return treatment;
  }

  async update(
    id: string,
    updateTreatmentDto: UpdateTreatmentDto,
    file?: Express.Multer.File,
  ): Promise<ITreatment> {
    const treatment = await this.findById(id);

    const treatmentData = {
      ...(updateTreatmentDto.name && { name: updateTreatmentDto.name }),
      ...(updateTreatmentDto.description && {
        description: updateTreatmentDto.description,
      }),
      ...(updateTreatmentDto.price && { price: updateTreatmentDto.price }),
      ...(file && { image: `/uploads/treatments/${file.filename}` }),
    };

    if (file && treatment.image) {
      await this.deleteImageFile(treatment.image);
    }

    this.em.assign(treatment, treatmentData);
    await this.em.flush();
    return treatment;
  }

  async updateStatus(
    id: string,
    updateTreatmentStatusDto: UpdateTreatmentStatusDto,
  ): Promise<ITreatment> {
    const treatment = await this.findById(id);

    const treatmentData = {
      ...(updateTreatmentStatusDto.isActive !== undefined && {
        isActive: updateTreatmentStatusDto.isActive,
      }),
    };

    this.em.assign(treatment, treatmentData);
    await this.em.flush();
    return treatment;
  }

  async delete(id: string): Promise<void> {
    const treatment = await this.findById(id);
    if (treatment.image) {
      await this.deleteImageFile(treatment.image);
    }
    await this.em.remove(treatment).flush();
  }
}
