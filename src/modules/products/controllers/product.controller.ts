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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { IProduct } from '../entities/product.entity';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { multerConfig } from '../../../config/upload.config';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Product created successfully')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<IProduct> {
    return this.productService.create(dto, file);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Products retrieved successfully')
  async findAll(): Promise<IProduct[]> {
    return this.productService.findAll();
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
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<IProduct> {
    return this.productService.update(id, dto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product deleted successfully')
  async delete(@Param('id') id: string): Promise<void> {
    return this.productService.delete(id);
  }
}
