import { Controller, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '@ai-sprints/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  health() {
    return this.authService.health();
  }

  @Get('whoami')
  whoAmI(@Headers('x-role') role: UserRole) {
    return this.authService.whoAmI(role ?? 'investor');
  }

  @Get('roles')
  listRoles() {
    return this.authService.listRoles();
  }
}
