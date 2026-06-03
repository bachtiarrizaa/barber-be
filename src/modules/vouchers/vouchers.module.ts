import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Voucher } from './entities/voucher.entity';
import { VoucherController } from './controllers/voucher.controller';
import { VoucherService } from './services/voucher.service';

@Module({
  imports: [MikroOrmModule.forFeature([Voucher])],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
