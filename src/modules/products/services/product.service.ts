import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Product, IProduct } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { FilterProductDto } from '../dtos/filter-product.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';
import { UpdateProductStatusDto } from '../dtos/update-product-status.dto';
import { FileService } from '../../../common/services/file.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly em: EntityManager,
    private readonly fileService: FileService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<IProduct> {
    const existName = await this.productRepository.findByName(
      createProductDto.name,
    );
    if (existName) {
      throw new ConflictException('Product with this name already exist');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      image: file
        ? this.fileService.getImagePath('products', file.filename)
        : null,
    });

    await this.em.flush();
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
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<IProduct> {
    const product = await this.findById(id);

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existName = await this.productRepository.findByName(
        updateProductDto.name,
      );
      if (existName) {
        throw new ConflictException('Product with this name already exists');
      }
    }

    const productData: Partial<IProduct> = {
      ...updateProductDto,
      ...(file && {
        image: this.fileService.getImagePath('products', file.filename),
      }),
    };

    if (file && product.image) {
      await this.fileService.deleteImage(product.image);
    }

    this.em.assign(product, productData);
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
      await this.fileService.deleteImage(product.image);
    }
    await this.em.remove(product).flush();
  }
}
