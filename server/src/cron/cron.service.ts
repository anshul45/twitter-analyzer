import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TwitterService } from 'src/twitter/twitter.service';

@Injectable()
export class CronService {
  
  constructor(private readonly twitterService: TwitterService) {}

  // Cron job to run at Pacific time 4:00 AM to 8:00 PM  2 hr interval every day
  @Cron('0 4,6,8,9,10,11,13,14,16,18,20,22 * * *', {
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
