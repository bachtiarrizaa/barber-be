import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Product, IProduct } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly em: EntityManager,
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
        console.error(`Failed to delete image file: ${imagePath}`, error);
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

  async findAll(): Promise<IProduct[]> {
    return this.productRepository.findAll();
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

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);
    if (product.image) {
      await this.deleteImageFile(product.image);
    }
    await this.em.remove(product).flush();
  }
}
