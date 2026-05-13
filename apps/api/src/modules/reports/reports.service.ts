import { Injectable } from '@nestjs/common';
import { OperatorReport } from '@ai-sprints/shared-types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async submitReport(payload: Record<string, unknown>): Promise<OperatorReport> {
    const id = `report-${Date.now()}`;
    const report = {
      id,
      farmId: String(payload['farmId'] ?? ''),
      operatorId: String(payload['operatorId'] ?? ''),
      reportType: (payload['reportType'] as OperatorReport['reportType']) ?? 'status',
      period: String(payload['period'] ?? new Date().toISOString().slice(0, 7)),
      content: (payload['content'] as Record<string, unknown>) ?? {},
      notes: String(payload['notes'] ?? ''),
      submittedAt: new Date()
    };
    
    await this.prisma.operatorReport.create({
      data: report
    });
    
    return {
      ...report,
      submittedAt: report.submittedAt.toISOString()
    } as OperatorReport;
  }

  async getReportsForFarm(farmId: string): Promise<OperatorReport[]> {
    const reports = await this.prisma.operatorReport.findMany({
      where: { farmId }
    });
    
    return reports.map(r => ({
      ...r,
      content: r.content as any,
      submittedAt: r.submittedAt.toISOString()
    })) as OperatorReport[];
  }

  async getReportsForOperator(operatorId: string): Promise<OperatorReport[]> {
    const reports = await this.prisma.operatorReport.findMany({
      where: { operatorId }
    });
    
    return reports.map(r => ({
      ...r,
      content: r.content as any,
      submittedAt: r.submittedAt.toISOString()
    })) as OperatorReport[];
  }
}
