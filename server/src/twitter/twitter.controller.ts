import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Body,
} from '@nestjs/common';
import { TwitterService } from './twitter.service';

@Controller('twitter')
export class TwitterController {
  constructor(private readonly twitter: TwitterService) {}

  @Post()
  async addText() {
    const usernames = [
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
      'mukund',
    ];

    // Sequential execution
    for (const user of usernames) {
      try {
        await this.twitter.savetoDB(user);
        console.log(`Successfully added user: ${user}`);
      } catch (error) {
        console.error(`Error adding user ${user}:`, error.message);
      }
    }
  }

  @Get()
  async processText(
    @Query('cashtag') cashtag?: string,
    @Query('date') date?: string,
    @Query('username') username?: string,
  ) {
    try {
      const { tweets, report } = await this.twitter.getAnalysis(cashtag, {
        date,
        username,
      });
      return { tweets, report };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error processing text',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('reports')
  async getReports() {
    try {
      const reports = await this.twitter.getReports();
      return reports;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error fetching reports',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('report')
  async generateReport(
    @Query('date') date: string,
    @Query('cashtag') cashtag: string,
  ) {
    try {
      const report = await this.twitter.saveReport(date.trim(), cashtag);
      return report;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error fetching reports',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('cashtag')
  async getCashtag() {
    try {
      const cashtags = await this.twitter.getCashtagCountsByDate();
      return cashtags;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error fetching reports',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Get('summary')
  async getSummary() {
    try {
      const summary = await this.twitter.getTweetsSummary()
      return summary;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error fetching reports',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('summary')
  async generateSummary(
    @Body() body: { tweets: any; title:string},
  ): Promise<{ summary: string }> {
    const { tweets, title} = body;
    const summary = await this.twitter.generateSummaryFromTweets(
      tweets,
      title
    );

    return { summary };
  }

  @Post('summary/cashtag')
  async generateCashtagSummary(
    @Body() body: { cashtag: string;},
  ): Promise<{ summary: string }> {
    const { cashtag} = body;
    const summary = await this.twitter.generateSummaryFromCashtag(
      cashtag,
    );
    return { summary };
  }
}
