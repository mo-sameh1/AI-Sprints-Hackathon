export class NotificationsService {
  evaluateSignals(payload: Record<string, unknown>) {
    return {
      status: 'queued-for-alert-reasoning',
      payload
    };
  }
}

