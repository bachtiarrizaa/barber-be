import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IStockLog, StockLog } from '../entities/stock-log.entity';
import { StockLogRepository } from '../repositories/stock-log.repository';
import { Product } from '../../products/entities/product.entity';
import { ProductRepository } from '../../products/repositories/product.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { FilterStockLogDto } from '../dtos/filter-stock-log.dto';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import { RestockDto } from '../dtos/restock.dto';
import { StockAdjustmentDto } from '../dtos/stock-adjustment.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockLog)
    private readonly stockLogRepository: StockLogRepository,
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly em: EntityManager,
  ) {}

  async findAllLogs(
    filterDto: FilterStockLogDto,
  ): Promise<PaginatedResult<IStockLog>> {
    const { type, ...paginationQuery } = filterDto;

    const filters: Record<string, unknown> = {};
    if (type) filters.type = type;

    return paginate<IStockLog>(this.stockLogRepository, paginationQuery, {
      filters,
      orderBy: { createdAt: 'DESC' },
      populate: ['product'] as const,
    });
  }

  async findlogsByProduct(productId: string): Promise<IStockLog[]> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.stockLogRepository.findByProduct(productId);
  }

  async restock(restockDto: RestockDto): Promise<IStockLog> {
    const product = await this.productRepository.findById(restockDto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let log!: IStockLog;

    await this.em.transactional((tem) => {
      product.stock += restockDto.quantity;

      log = tem.create(StockLog, {
        product,
        qtyChange: restockDto.quantity,
        type: 'restock',
        referenceId: null,
        note: restockDto.note ?? null,
      } as IStockLog);
    });

    return log;
  }

  async stockAdjustment(
    stockAdjustmentDto: StockAdjustmentDto,
  ): Promise<IStockLog> {
    const product = await this.productRepository.findById(
      stockAdjustmentDto.productId,
    );
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStock = product.stock + stockAdjustmentDto.qtyChange;
    if (newStock < 0) {
      throw new BadRequestException(
        `Adjustment would result in negative stock. Current: ${product.stock}, change: ${stockAdjustmentDto.qtyChange}`,
      );
    }

    let log!: IStockLog;

    await this.em.transactional((tem) => {
      product.stock = newStock;

      log = tem.create(StockLog, {
        product,
        qtyChange: stockAdjustmentDto.qtyChange,
        type: 'adjustment',
        referenceId: null,
        note: stockAdjustmentDto.note,
      } as IStockLog);
    });

    return log;
  }
}
