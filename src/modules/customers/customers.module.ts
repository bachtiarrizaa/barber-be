import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { CustomerController } from './controllers/customer.controller';
import { CustomerService } from './services/customer.service';

@Module({
  imports: [MikroOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
