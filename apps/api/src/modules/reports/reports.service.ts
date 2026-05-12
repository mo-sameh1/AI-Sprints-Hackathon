export class ReportsService {
  submitReport(payload: Record<string, unknown>) {
    return {
      status: 'queued-for-report-processing',
      payload
    };
  }
}

