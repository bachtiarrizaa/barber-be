import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Product, IProduct } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { FilterProductDto } from '../dtos/filter-product.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import * as fs from 'fs';
import { join } from 'path';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import { UpdateProductStatusDto } from '../dtos/update-product-status.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly em: EntityManager,
    private readonly logger = new Logger(ProductService.name),
  ) {}

  private async deleteImageFile(
    imagePath: string | null | undefined,
  ): Promise<void> {
    if (!imagePath) return;
    try {
      const fullPath = join(process.cwd(), imagePath);
      await fs.promises.access(fullPath);
      await fs.promises.unlink(fullPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error(`Failed to delete image file: ${imagePath}`, error);
      }
    }
  }

  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<IProduct> {
    const product = this.productRepository.create({
      ...createProductDto,
      image: file ? `/uploads/products/${file.filename}` : null,
    });
    await this.em.persist(product).flush();
    return product;
  }

  async findAll(
    filterDto: FilterProductDto,
  ): Promise<PaginatedResult<IProduct>> {
    const { isActive, ...paginationQuery } = filterDto;

    const filters: Partial<{ isActive: boolean }> = {};
    if (isActive !== undefined) {
      filters.isActive = isActive;
    }

    return paginate<IProduct>(this.productRepository, paginationQuery, {
      searchFields: ['name', 'description'],
      filters,
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<IProduct> {
    const product = await this.productRepository.findOne({ id });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<IProduct> {
    const product = await this.findById(id);
    const updateData: UpdateProductDto & { image?: string | null } = {
      ...updateProductDto,
    };

    if (file) {
      if (product.image) {
        await this.deleteImageFile(product.image);
      }
      updateData.image = `/uploads/products/${file.filename}`;
    }

    this.em.assign(product, updateData);
    await this.em.flush();
    return product;
  }

  async updateStatus(
    id: string,
    updateProductStatusDto: UpdateProductStatusDto,
  ): Promise<IProduct> {
    const product = await this.findById(id);
    this.em.assign(product, { isActive: updateProductStatusDto.isActive });
    await this.em.flush();
    return product;
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);
    if (product.image) {
      await this.deleteImageFile(product.image);
    }
    await this.em.remove(product).flush();
  }
}
