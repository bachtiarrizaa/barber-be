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
    if (existVoucher)
      throw new ConflictException('Voucher with this name already exist');

    const voucher = this.voucherRepository.create(createVoucherDto);
    await this.em.persist(voucher).flush();
    return voucher;
  }

  async findAll(
    filterDto: FilterVoucherDto,
  ): Promise<PaginatedResult<IVoucher>> {
    const { ...paginationQuery } = filterDto;

    return paginate<IVoucher>(this.voucherRepository, paginationQuery, {
      searchFields: ['name'],
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

    this.em.assign(voucher, updateVoucherDto);
    await this.em.flush();
    return voucher;
  }

  async updateStatus(
    id: string,
    updateVoucherStatusDto: UpdateVoucherDto,
  ): Promise<IVoucher> {
    const voucher = await this.findById(id);
    this.em.assign(voucher, { isActive: updateVoucherStatusDto.isActive });
    await this.em.flush();
    return voucher;
  }

  async delete(id: string): Promise<void> {
    const voucher = await this.findById(id);
    await this.em.remove(voucher).flush();
  }
}
