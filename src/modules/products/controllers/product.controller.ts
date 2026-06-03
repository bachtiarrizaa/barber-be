import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { FilterProductDto } from '../dtos/filter-product.dto';
import { IProduct } from '../entities/product.entity';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { multerConfig } from '../../../config/upload.config';
import { PaginatedResult } from '../../../common/utils/pagination.util';
import { UpdateProductStatusDto } from '../dtos/update-product-status.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Product created successfully')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<IProduct> {
    return this.productService.create(createProductDto, file);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Products retrieved successfully')
  async findAll(
    @Query() filterDto: FilterProductDto,
  ): Promise<PaginatedResult<IProduct>> {
    return this.productService.findAll(filterDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product retrieved successfully')
  async findById(@Param('id') id: string): Promise<IProduct> {
    return this.productService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product updated successfully')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<IProduct> {
    return this.productService.update(id, updateProductDto, file);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product status updated successfully')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateProductStatusDto: UpdateProductStatusDto,
  ): Promise<IProduct> {
    return this.productService.updateStatus(id, updateProductStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product deleted successfully')
  async delete(@Param('id') id: string): Promise<void> {
    return this.productService.delete(id);
  }
}
