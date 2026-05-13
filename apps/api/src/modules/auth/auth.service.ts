import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@ai-sprints/shared-types';
import { JwtPayload } from './jwt.strategy';

// Dev-only in-memory store. Replace with Prisma User lookup once real user creation is wired.
const MOCK_USERS = [
  {
    id: 'user-001',
    email: 'ahmed@investor.com',
    // bcrypt hash of "password123"
    password: '$2a$10$aox/ynGsIWk4.XJXsJZWuONNoY1gQt1y4J.NiatCYHM5q8BmgPReS',
    role: 'investor' as UserRole,
    name: 'Ahmed Mansour',
  },
  {
    id: 'user-op-001',
    email: 'mohamed@operator.com',
    password: '$2a$10$aox/ynGsIWk4.XJXsJZWuONNoY1gQt1y4J.NiatCYHM5q8BmgPReS',
    role: 'operator' as UserRole,
    name: 'Mohamed Hassan',
  },
  {
    id: 'user-admin-001',
    email: 'admin@aisprints.com',
    password: '$2a$10$aox/ynGsIWk4.XJXsJZWuONNoY1gQt1y4J.NiatCYHM5q8BmgPReS',
    role: 'admin' as UserRole,
    name: 'Platform Admin',
  },
];

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  health() {
    return { status: 'ok' as const, service: 'auth', timestamp: new Date().toISOString() };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; user: Omit<(typeof MOCK_USERS)[0], 'password'> }> {
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const { password: _pw, ...safeUser } = user;
    return { accessToken: this.jwtService.sign(payload), user: safeUser };
  }

  whoAmI(role: UserRole): { user: Omit<(typeof MOCK_USERS)[0], 'password'>; role: UserRole } | { error: string } {
    const user = MOCK_USERS.find((u) => u.role === role);
    if (!user) return { error: `No mock user for role: ${role}` };
    const { password: _pw, ...safeUser } = user;
    return { user: safeUser, role };
  }

  listRoles(): UserRole[] {
    return ['investor', 'operator', 'admin'];
  }
}
