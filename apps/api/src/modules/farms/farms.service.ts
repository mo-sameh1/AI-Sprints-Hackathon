import { Injectable } from '@nestjs/common';
import { FarmProfile } from '@ai-sprints/shared-types';
import { buildFarmProfile } from '@ai-sprints/ai-worker';
import { FarmsRepository } from '../database/repositories/platform.repositories';

@Injectable()
export class FarmsService {
  constructor(private readonly farmsRepository: FarmsRepository) {}

  getAllFarms(): Promise<FarmProfile[]> {
    return this.farmsRepository.findAll();
  }

  async getFarmById(id: string): Promise<FarmProfile | { error: string }> {
    const farm = await this.farmsRepository.findById(id);
    if (!farm) return { error: `Farm ${id} not found` };
    return farm;
  }

  getActiveFarms(): Promise<FarmProfile[]> {
    return this.farmsRepository.findActive();
  }

  createFarm(raw: Record<string, unknown>, operatorId: string): Promise<FarmProfile> {
    const farm = buildFarmProfile(raw, operatorId);
    return this.farmsRepository.save(farm);
  }

  async updateFarmStatus(id: string, status: FarmProfile['status']): Promise<FarmProfile | { error: string }> {
    const farm = await this.farmsRepository.updateStatus(id, status);
    if (!farm) return { error: `Farm ${id} not found` };
    return farm;
  }
}
