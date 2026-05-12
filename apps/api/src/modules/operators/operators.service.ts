export class OperatorsService {
  createProfileDraft(payload: Record<string, unknown>) {
    return {
      status: 'queued-for-ai-profile-builder',
      payload
    };
  }
}

