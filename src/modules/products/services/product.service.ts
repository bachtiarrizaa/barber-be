import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Product, IProduct } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { EntityManager } from '@mikro-orm/postgresql';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly em: EntityManager,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<IProduct> {
    const product = this.productRepository.create(createProductDto);
    await this.em.persist(product).flush();
    return product;
  }

  async findAll(): Promise<IProduct[]> {
    return this.em.findAll(Product);
  }

  async findById(id: string): Promise<IProduct> {
    const product = await this.em.findOne(Product, { id });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<IProduct> {
    const product = await this.findById(id);
    this.em.assign(product, updateProductDto);
    await this.em.flush();
    return product;
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);
    await this.em.remove(product).flush();
  }
}
