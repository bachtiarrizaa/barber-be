import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Transaction } from './entities/transaction.entity';
import { TransactionItem } from './entities/transaction-item.entity';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionService } from './services/transaction.service';
import { User } from '../users/entities/user.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { VoucherRedemption } from '../vouchers/entities/voucher-redemption.entity';
import { SettingModule } from '../settings/settings.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Transaction,
      TransactionItem,
      User,
      Treatment,
      Customer,
      Product,
      VoucherRedemption,
    ]),
    SettingModule,
    CommonModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionsModule {}
