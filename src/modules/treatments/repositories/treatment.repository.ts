import { EntityRepository } from '@mikro-orm/postgresql';
import { ITreatment } from '../entities/treatment.entity';

export class TreatmentRepository extends EntityRepository<ITreatment> {
  async findByName(name: string): Promise<ITreatment | null> {
    return this.findOne({ name });
  }

  async findById(treatmentId: string): Promise<ITreatment | null> {
    return this.findOne({ id: treatmentId });
  }

  async findActiveById(treatmentId: string): Promise<ITreatment | null> {
    return this.findOne({ id: treatmentId, isActive: true });
  }
}
