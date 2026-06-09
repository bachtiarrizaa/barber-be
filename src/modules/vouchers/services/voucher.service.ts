import { InjectRepository } from '@mikro-orm/nestjs';
import { IVoucher, Voucher } from '../entities/voucher.entity';
import { VoucherRepository } from '../repositories/voucher.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateVoucherDto } from '../dtos/create-voucher.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import { FilterVoucherDto } from '../dtos/filter-voucher.dto';
import { UpdateVoucherDto } from '../dtos/update-voucher.dto';

export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: VoucherRepository,
    private readonly em: EntityManager,
  ) {}

  async create(createVoucherDto: CreateVoucherDto): Promise<IVoucher> {
    const existVoucher = await this.voucherRepository.findOne({
      name: createVoucherDto.name,
    });
    if (existVoucher) {
      throw new ConflictException('Voucher with this name already exist');
    }

    const voucherData = {
      name: createVoucherDto.name,
      description: createVoucherDto.description ?? null,
      pointsRequired: createVoucherDto.pointsRequired,
      type: createVoucherDto.type,
      value: createVoucherDto.value,
      isActive: createVoucherDto.isActive ?? true,
    };

    const voucher = this.voucherRepository.create(voucherData);
    await this.em.persist(voucher).flush();
    return voucher;
  }

  async findAll(
    filterDto: FilterVoucherDto,
  ): Promise<PaginatedResult<IVoucher>> {
    const { isActive, ...paginationQuery } = filterDto;

    const filters: Partial<{ isActive }> = {};
    if (isActive !== undefined) {
      filters.isActive = isActive;
    }

    return paginate<IVoucher>(this.voucherRepository, paginationQuery, {
      searchFields: ['name'],
      filters,
      orderBy: { createdAt: 'Desc' },
    });
  }

  async findById(id: string): Promise<IVoucher> {
    const voucher = await this.voucherRepository.findOne({ id });
    if (!voucher) throw new NotFoundException('Voucher not found');
    return voucher;
  }

  async update(
    id: string,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<IVoucher> {
    const voucher = await this.findById(id);

    if (updateVoucherDto.name && updateVoucherDto.name !== voucher.name) {
      const existing = await this.voucherRepository.findOne({
        name: updateVoucherDto.name,
      });
      if (existing) {
        throw new ConflictException('Voucher with this name already exists');
      }
    }

    const voucherData = {
      ...(updateVoucherDto.name && { name: updateVoucherDto.name }),
      ...(updateVoucherDto.description && {
        description: updateVoucherDto.description,
      }),
      ...(updateVoucherDto.pointsRequired && {
        pointsRequired: updateVoucherDto.pointsRequired,
      }),
      ...(updateVoucherDto.type && { type: updateVoucherDto.type }),
      ...(updateVoucherDto.value && { value: updateVoucherDto.value }),
    };

    this.em.assign(voucher, voucherData);
    await this.em.flush();
    return voucher;
  }

  async updateStatus(
    id: string,
    updateVoucherStatusDto: UpdateVoucherDto,
  ): Promise<IVoucher> {
    const voucher = await this.findById(id);

    const voucherData = {
      ...(updateVoucherStatusDto.isActive !== undefined && {
        isActive: updateVoucherStatusDto.isActive,
      }),
    };

    this.em.assign(voucher, voucherData);
    await this.em.flush();
    return voucher;
  }

  async delete(id: string): Promise<void> {
    const voucher = await this.findById(id);
    await this.em.remove(voucher).flush();
  }
}
