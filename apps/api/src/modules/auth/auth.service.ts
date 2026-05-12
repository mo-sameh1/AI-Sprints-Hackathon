export class AuthService {
  health() {
    return {
      status: 'ok' as const,
      service: 'auth'
    };
  }
}

