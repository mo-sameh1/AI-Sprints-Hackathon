import { Injectable } from '@nestjs/common';
import { OperatorReport } from '@ai-sprints/shared-types';

const reportStore = new Map<string, OperatorReport>();

@Injectable()
export class ReportsService {
  submitReport(payload: Record<string, unknown>): OperatorReport {
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
    reportStore.set(id, report);
    return report;
  }

  getReportsForFarm(farmId: string): OperatorReport[] {
    return Array.from(reportStore.values()).filter(r => r.farmId === farmId);
  }

  getReportsForOperator(operatorId: string): OperatorReport[] {
    return Array.from(reportStore.values()).filter(r => r.operatorId === operatorId);
  }
}
