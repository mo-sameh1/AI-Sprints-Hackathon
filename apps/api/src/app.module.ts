import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { InvestorsModule } from './modules/investors/investors.module';
import { OperatorsModule } from './modules/operators/operators.module';
import { FarmsModule } from './modules/farms/farms.module';
import { MatchesModule } from './modules/matches/matches.module';
import { DealsModule } from './modules/deals/deals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';

import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    InvestorsModule,
    OperatorsModule,
    FarmsModule,
    MatchesModule,
    DealsModule,
    NotificationsModule,
    ReportsModule,
    AdminModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
