import { InjectRepository } from '@mikro-orm/nestjs';
import { IVoucher, Voucher } from '../entities/voucher.entity';
import { VoucherRepository } from '../repositories/voucher.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateVoucherDto } from '../dtos/create-voucher.dto';
import { ConflictException } from '@nestjs/common';

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

    const voucher = this.voucherRepository.create(createVoucherDto);
    await this.em.persist(voucher).flush();
    return voucher;
  }
}
