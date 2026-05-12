import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { seedFarms, seedInvestors, seedOperators, seedReviewItems } from './database.seed-data';
import { PrismaService } from './prisma.service';
import {
  adminReviewItemData,
  farmProfileData,
  investorProfileData,
  operatorProfileData,
} from './database.mappers';

@Injectable()
export class DatabaseSeeder implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.seedInvestors();
    await this.seedOperators();
    await this.seedFarms();
    await this.seedAdminReviews();
  }

  private async seedInvestors() {
    const count = await this.prisma.investorProfile.count();
    if (count > 0) return;

    for (const investor of seedInvestors) {
      await this.prisma.investorProfile.create({ data: investorProfileData(investor) });
    }
  }

  private async seedOperators() {
    const count = await this.prisma.operatorProfile.count();
    if (count > 0) return;

    for (const operator of seedOperators) {
      await this.prisma.operatorProfile.create({ data: operatorProfileData(operator) });
    }
  }

  private async seedFarms() {
    const count = await this.prisma.farmProfile.count();
    if (count > 0) return;

    for (const farm of seedFarms) {
      await this.prisma.farmProfile.create({ data: farmProfileData(farm) });
    }
  }

  private async seedAdminReviews() {
    const count = await this.prisma.adminReviewItem.count();
    if (count > 0) return;

    for (const item of seedReviewItems) {
      await this.prisma.adminReviewItem.create({ data: adminReviewItemData(item) });
    }
  }
}
