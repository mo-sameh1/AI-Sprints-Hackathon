import { Injectable } from '@nestjs/common';
import { OperatorProfile } from '@ai-sprints/shared-types';
import { notFoundError } from '../../common/http.types';
import { OperatorsRepository } from '../database/repositories/platform.repositories';

@Injectable()
export class OperatorsService {
  constructor(private readonly operatorsRepository: OperatorsRepository) {}

  getAllOperators(): Promise<OperatorProfile[]> {
    return this.operatorsRepository.findAll();
  }

  async getOperatorById(id: string) {
    const operator = await this.operatorsRepository.findById(id);
    return operator ?? notFoundError('Operator', id);
  }

  registerOperator(payload: Record<string, unknown>): Promise<OperatorProfile> {
    const id = `op-${Date.now()}`;
    const profile: OperatorProfile = {
      id,
      userId: String(payload['userId'] ?? id),
      name: String(payload['name'] ?? 'Operator'),
      phone: String(payload['phone'] ?? ''),
      whatsappNumber: payload['whatsappNumber'] ? String(payload['whatsappNumber']) : undefined,
      region: String(payload['region'] ?? 'Unknown'),
      farmIds: [],
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
    };
    return this.operatorsRepository.save(profile);
  }
}
