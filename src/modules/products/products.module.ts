import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { StockLog } from './entities/stock-log.entity';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [MikroOrmModule.forFeature([Product, StockLog]), CommonModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService, MikroOrmModule],
})
export class ProductModule {}
