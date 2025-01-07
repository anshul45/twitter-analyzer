import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class CronService{
    @Cron('0 5 * * *')
    handleMorningJob() {
        console.log('Cron job will run at 5:00 AM every day');
      }

    @Cron('0 16 * * *')  
    handleFourPM() {
        console.log('Cron job will run at 4:00 PM every day');
      }
}