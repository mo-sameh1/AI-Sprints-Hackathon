import { Module } from '@nestjs/common';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { FarmsModule } from '../farms/farms.module';
import { InvestorsModule } from '../investors/investors.module';

@Module({
  imports: [FarmsModule, InvestorsModule],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
