import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { FarmsModule } from '../farms/farms.module';
import { InvestorsModule } from '../investors/investors.module';

@Module({
  imports: [FarmsModule, InvestorsModule],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
