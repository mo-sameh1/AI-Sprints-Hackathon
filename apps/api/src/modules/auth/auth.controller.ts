import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '@ai-sprints/shared-types';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('health')
  health() {
    return this.authService.health();
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('whoami')
  whoAmI(@Headers('x-role') role: UserRole) {
    return this.authService.whoAmI(role ?? 'investor');
  }

  @Public()
  @Get('roles')
  listRoles() {
    return this.authService.listRoles();
  }
}
