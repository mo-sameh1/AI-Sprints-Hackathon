import { Injectable } from '@nestjs/common';
import { OperatorReport } from '@ai-sprints/shared-types';
import { ReportsRepository } from '../database/repositories/platform.repositories';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  submitReport(payload: Record<string, unknown>): Promise<OperatorReport> {
    const id = `report-${Date.now()}`;
    const report: OperatorReport = {
      id,
      farmId: String(payload['farmId'] ?? ''),
      operatorId: String(payload['operatorId'] ?? ''),
      reportType: (payload['reportType'] as OperatorReport['reportType']) ?? 'status',
      period: String(payload['period'] ?? new Date().toISOString().slice(0, 7)),
      content: (payload['content'] as Record<string, unknown>) ?? {},
      notes: String(payload['notes'] ?? ''),
      submittedAt: new Date().toISOString(),
    };
    return this.reportsRepository.save(report);
  }

  getReportsForFarm(farmId: string): Promise<OperatorReport[]> {
    return this.reportsRepository.findForFarm(farmId);
  }

  getReportsForOperator(operatorId: string): Promise<OperatorReport[]> {
    return this.reportsRepository.findForOperator(operatorId);
  }
}
