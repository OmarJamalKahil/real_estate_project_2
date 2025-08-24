import { Controller, Post } from "@nestjs/common";
import { GeneralStatisticsService } from "./services/general_statistics.service";


@Controller('stati')
export class StatisticsController{

    constructor(
            private readonly stati: GeneralStatisticsService
        
    ){}


    @Post('g')
    async login() {
        console.log('fdsjfl');
    return this.stati.createFirstStatistic();
  }
}
