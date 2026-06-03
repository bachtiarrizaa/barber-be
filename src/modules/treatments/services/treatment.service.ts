import { InjectRepository } from '@mikro-orm/nestjs';
import { CreateTreatmentDto } from '../dtos/create-treatment.dto';
import { ITreatment, Treatment } from '../entities/treatment.entity';
import { TreatmentRepository } from '../repositories/treatment.repository';
import { EntityManager } from '@mikro-orm/postgresql';

export class TreatmentService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepository: TreatmentRepository,
    private readonly em: EntityManager,
  ) {}
  async create(
    createTreatmentDto: CreateTreatmentDto,
    file?: Express.Multer.File,
  ): Promise<ITreatment> {
    const treatment = this.treatmentRepository.create({
      ...createTreatmentDto,
      image: file ? `/uploads/treatments/${file.filename}` : null,
    });
    await this.em.persist(treatment).flush();
    return treatment;
  }
}
