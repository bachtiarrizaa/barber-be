import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { CustomerController } from './controllers/customer.controller';
import { CustomerService } from './services/customer.service';

import { PointLog } from './entities/point-log.entity';
import { VoucherRedemption } from '../vouchers/entities/voucher-redemption.entity';
import { Voucher } from '../vouchers/entities/voucher.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Customer, PointLog, VoucherRedemption, Voucher]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
