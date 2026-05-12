import { Global, Module } from '@nestjs/common';
import { DatabaseSeeder } from './database.seeder';
import { PrismaService } from './prisma.service';
import {
  AdminRepository,
  DealsRepository,
  FarmsRepository,
  InvestorsRepository,
  MatchesRepository,
  NotificationsRepository,
  OperatorsRepository,
  ReportsRepository,
} from './repositories/platform.repositories';

const repositories = [
  AdminRepository,
  DealsRepository,
  FarmsRepository,
  InvestorsRepository,
  MatchesRepository,
  NotificationsRepository,
  OperatorsRepository,
  ReportsRepository,
];

@Global()
@Module({
  providers: [PrismaService, DatabaseSeeder, ...repositories],
  exports: [PrismaService, ...repositories],
})
export class DatabaseModule {}
