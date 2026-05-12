import { Injectable } from '@nestjs/common';
import { UserRole } from '@ai-sprints/shared-types';

const users = [
  { id: 'user-001', email: 'ahmed@investor.com', role: 'investor' as UserRole, name: 'Ahmed Mansour' },
  { id: 'user-op-001', email: 'mohamed@operator.com', role: 'operator' as UserRole, name: 'Mohamed Hassan' },
  { id: 'user-admin-001', email: 'admin@aisprints.com', role: 'admin' as UserRole, name: 'Platform Admin' },
];

@Injectable()
export class AuthService {
  health() {
    return { status: 'ok' as const, service: 'auth', timestamp: new Date().toISOString() };
  }

  whoAmI(role: UserRole): { user: typeof users[0]; role: UserRole } | { error: string } {
    const user = users.find(u => u.role === role);
    if (!user) return { error: `No mock user for role: ${role}` };
    return { user, role };
  }

  listRoles(): UserRole[] {
    return ['investor', 'operator', 'admin'];
  }
}
