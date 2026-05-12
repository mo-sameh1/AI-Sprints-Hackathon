export class InvestorsService {
  getPreferenceTemplate() {
    return {
      persona: 'investor',
      fields: ['riskTolerance', 'investmentHorizonMonths', 'capitalBudget', 'liquidityPreference']
    };
  }

  savePreferences(payload: Record<string, unknown>) {
    return {
      status: 'captured',
      next: 'matching',
      payload
    };
  }
}

