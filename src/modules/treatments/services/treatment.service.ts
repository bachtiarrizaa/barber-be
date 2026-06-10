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
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateTreatmentDto } from '../dtos/update-treatment.dto';
import { UpdateTreatmentStatusDto } from '../dtos/update-treatment-status.dto';
import { FileService } from '../../../common/services/file.service';

export class TreatmentService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepository: TreatmentRepository,
    private readonly em: EntityManager,
    private readonly fileService: FileService,
  ) {}

  async create(
    createTreatmentDto: CreateTreatmentDto,
    file?: Express.Multer.File,
  ): Promise<ITreatment> {
    const existName = await this.treatmentRepository.findByName(
      createTreatmentDto.name,
    );
    if (existName) {
      throw new ConflictException('Treatment with this name already exist');
    }

    const treatment = this.treatmentRepository.create({
      ...createTreatmentDto,
      image: file
        ? this.fileService.getImagePath('treatments', file.filename)
        : null,
    });

    await this.em.flush();
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
      orderBy: { createdAt: 'DESC' },
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

    if (updateTreatmentDto.name && updateTreatmentDto.name !== treatment.name) {
      const existName = await this.treatmentRepository.findByName(
        updateTreatmentDto.name,
      );
      if (existName) {
        throw new ConflictException('Treatment with this name already exist');
      }
    }

    const treatmentData: Partial<ITreatment> = {
      ...updateTreatmentDto,
      ...(file && {
        image: this.fileService.getImagePath('treatments', file.filename),
      }),
    };

    if (file && treatment.image) {
      await this.fileService.deleteImage(treatment.image);
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
    this.em.assign(treatment, {
      isActive: updateTreatmentStatusDto.isActive,
    });
    await this.em.flush();
    return treatment;
  }

  async delete(id: string): Promise<void> {
    const treatment = await this.findById(id);
    if (treatment.image) {
      await this.fileService.deleteImage(treatment.image);
    }
    await this.em.remove(treatment).flush();
  }
}
