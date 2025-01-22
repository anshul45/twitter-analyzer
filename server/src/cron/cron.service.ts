import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TwitterService } from 'src/twitter/twitter.service';

@Injectable()
export class CronService {
  
  constructor(private readonly twitterService: TwitterService) {}

  // Cron job to run at Pacific time 5:00 AM every day
  @Cron('0 4-20/2 * * *', {
    timeZone: 'America/Los_Angeles',
  })
  async handleMorningJob() {
    try {
        await this.twitterService.savetoDB();
    } catch (error) {
      console.error('Error in morning cron job:', error.message);
    }
  }
}
