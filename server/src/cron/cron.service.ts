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
    'EventuallyWLTHY',
    'ftr_investors',
    'DataDInvesting',
    'simpleinvest01',
    'EarningsHubHQ',
    'amitisinvesting',
    'seekvalue1990',
    'techfund1',
    'alc2022',
    'fs_insight',
    'stocktalkweekly',
    'mvcinvesting',
    'Speculator_io',
    'preetkailon',
    'StockMKTNewz',
    'EconomyApp',
    'borrowed_ideas',
    'joecarlsonshow',
    'StockSavvyShay',
    'SixSigmaCapital',
    'saxena_puru',
    'FromValue',
    'TechFundies',
    'Kross_Roads',
    'svarncapital',
    'RihardJarc',
    'LogicalThesis',
    'dixit1978',
    'derekquick1',
    'Soumyazen',
    'KrisPatel99',
    'Kawcak20',
    'rhemrajani9',
    'ecommerceshares',
    'WallStJesus',
    'TicTocTick',
    'Brian_Stoffel_',
    'MarkNewtonCMT',
    'gurgavin',
    'BrianFeroldi',
    'dhaval_kotecha',
    'fundamentell',
    'BigBullCap',
    'JonahLupton',
    'mukund'
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
