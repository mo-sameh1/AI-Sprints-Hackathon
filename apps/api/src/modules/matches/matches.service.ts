export class MatchesService {
  rankMatches(payload: Record<string, unknown>) {
    return {
      status: 'queued-for-ranking',
      focus: 'investor-first-discovery',
      payload
    };
  }
}

