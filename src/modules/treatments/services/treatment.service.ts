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
import { Logger, NotFoundException } from '@nestjs/common';
import { UpdateTreatmentDto } from '../dtos/update-treaatment.dto';
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
    const treatment = this.treatmentRepository.create({
      ...createTreatmentDto,
      image: file ? `/uploads/treatments/${file.filename}` : null,
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
    if (!treatment) throw new NotFoundException('Treatment not found');
    return treatment;
  }

  async update(
    id: string,
    updateTreatmentDto: UpdateTreatmentDto,
    file?: Express.Multer.File,
  ): Promise<ITreatment> {
    const treatment = await this.findById(id);
    const updateData: UpdateTreatmentDto & { image?: string | null } = {
      ...updateTreatmentDto,
    };

    if (file) {
      if (treatment.image) {
        await this.deleteImageFile(treatment.image);
      }
      updateData.image = `/uploads/products/${file.filename}`;
    }

    this.em.assign(treatment, updateData);
    await this.em.flush();
    return treatment;
  }

  async updateStatus(
    id: string,
    updateTreatmentStatusDto: UpdateTreatmentStatusDto,
  ): Promise<ITreatment> {
    const treaatment = await this.findById(id);
    this.em.assign(treaatment, { isActive: updateTreatmentStatusDto.isActive });
    await this.em.flush();
    return treaatment;
  }

  async delete(id: string): Promise<void> {
    const treaatment = await this.findById(id);
    if (treaatment.image) {
      await this.deleteImageFile(treaatment.image);
    }
    await this.em.remove(treaatment).flush();
  }
}
