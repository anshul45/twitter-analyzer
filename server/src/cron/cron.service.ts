import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TwitterService } from 'src/twitter/twitter.service';

@Injectable()
export class CronService {
  // Injecting the TwitterService and defining the list of usernames
  private readonly usernames = [
    'pakpakchicken',
    'fundstrat',
    'BourbonCap',
    'ripster47',
    'Micro2Macr0',
    'LogicalThesis',
    'RichardMoglen',
    'Couch_Investor',
    'StockMarketNerd',
    'MCins_',
    'unusual_whales',
  ];

  constructor(private readonly twitterService: TwitterService) {}

  // Cron job to run at Pacific time 5:00 AM every day
  @Cron('0 5-16/3 * * *', {
    timeZone: 'America/Los_Angeles',
  })
  async handleMorningJob() {
    try {
      await Promise.all(
        this.usernames.map(async (user) => {
          try {
            await this.twitterService.savetoDB(user);
            console.log(`Successfully added user: ${user}`);
          } catch (error) {
            console.error(`Error adding user ${user}:`, error.message);
          }
        }),
      );
    } catch (error) {
      console.error('Error in morning cron job:', error.message);
    }
  }
}
