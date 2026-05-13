import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@ai-sprints/shared-types';
import { ROLES_KEY } from './decorators/roles.decorator';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{
      user?: JwtPayload;
      headers: Record<string, string>;
    }>();

    // JWT mode
    if (request.user) {
      if (!required.includes(request.user.role)) {
        throw new ForbiddenException(`Role '${request.user.role}' not permitted`);
      }
      return true;
    }

    // Dev fallback: x-role header
    const headerRole = request.headers['x-role'] as UserRole | undefined;
    if (headerRole && required.includes(headerRole)) return true;
    if (headerRole) throw new ForbiddenException(`Role '${headerRole}' not permitted`);

    return true;
  }
}
