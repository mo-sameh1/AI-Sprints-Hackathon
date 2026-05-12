import { Injectable } from '@nestjs/common';
import { OperatorProfile } from '@ai-sprints/shared-types';

const operatorStore = new Map<string, OperatorProfile>();

// Seed operators
[
  { id: 'op-001', name: 'Mohamed Hassan', phone: '+20-100-000-0001', region: 'Delta', farmIds: ['farm-001'] },
  { id: 'op-002', name: 'Fatima Ibrahim', phone: '+20-100-000-0002', region: 'Upper Egypt', farmIds: ['farm-002'] },
  { id: 'op-003', name: 'Karim Saleh', phone: '+20-100-000-0003', region: 'Fayoum', farmIds: ['farm-003'] },
  { id: 'op-004', name: 'Layla Mostafa', phone: '+20-100-000-0004', region: 'Sinai', farmIds: ['farm-004'] },
  { id: 'op-005', name: 'Omar Abdel-Aziz', phone: '+20-100-000-0005', region: 'Upper Egypt', farmIds: ['farm-005'] },
].forEach(op => {
  operatorStore.set(op.id, {
    ...op,
    userId: `user-${op.id}`,
    whatsappNumber: op.phone,
    verificationStatus: op.id === 'op-004' ? 'pending' : 'verified',
    createdAt: new Date('2025-01-01').toISOString(),
  });
});

@Injectable()
export class OperatorsService {
  getAllOperators(): OperatorProfile[] {
    return Array.from(operatorStore.values());
  }

  getOperatorById(id: string): OperatorProfile | { error: string } {
    return operatorStore.get(id) ?? { error: `Operator ${id} not found` };
  }

  registerOperator(payload: Record<string, unknown>): OperatorProfile {
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
    operatorStore.set(id, profile);
    return profile;
  }
}
