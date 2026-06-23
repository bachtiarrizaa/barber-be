import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { StockLog } from './entities/stock-log.entity';
import { StockController } from './controllers/stock-log.controller';
import { StockService } from './services/stock-log.service';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [MikroOrmModule.forFeature([StockLog, Product])],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService, MikroOrmModule],
})
export class StockModule {}
