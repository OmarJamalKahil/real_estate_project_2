import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { SubscriptionStatisticsService } from "./services/subscription-statistics.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { PropertyStatisticsService } from "./services/property-statistics.service";
import { CombinedStats } from "./common/interface/property-statistics.interface";
import { GeneralStatisticsService } from "./services/general-statistics.service";


@Controller('statistics')
export class StatisticsController {

  constructor(
    private readonly subscriptionStatisticsService: SubscriptionStatisticsService,
    private readonly propertyStatisticsService: PropertyStatisticsService,
    private readonly generalStatisticsService: GeneralStatisticsService,
  ) { }


  @Get('general')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getCombinedStats() {
    return this.generalStatisticsService.getCombinedStats()
  }

  @Get('subcription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getSubscriptionStats() {
    return this.subscriptionStatisticsService.getSubscriptionStats()
  }

  @Get('property')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getPropertyStats(): Promise<CombinedStats> {
    return this.propertyStatisticsService.getCombinedStats()
  }

  @Get('property-time')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getTimeBasedStats() {
    return this.propertyStatisticsService.getTimeBasedStats()
  }


  @Get('property-operation-type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getOperationTypeStats() {
    return this.propertyStatisticsService.getOperationTypeStats()
  }



}