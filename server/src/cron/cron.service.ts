import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class CronService{
    @Cron('0 5 * * *')
    handleDailyJob() {
        console.log('Cron job running at 5:00 AM every day');
      }
}