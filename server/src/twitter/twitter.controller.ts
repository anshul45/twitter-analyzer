import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
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
    ];
    await Promise.all(
      usernames.map(async (user) => {
        try {
          await this.twitter.savetoDB(user);
          console.log(`Successfully added user: ${user}`);
        } catch (error) {
          console.error(`Error adding user ${user}:`, error.message);
        }
      }),
    );
  }

  @Get('cashtag')
  async processText(@Query('cashtag') cashtag: string) {
    try {
      console.log('processing text');
      // const { tweets, report, rawTweets } =
      await this.twitter.getAnalysis(cashtag);
      // return { tweets, report, rawTweets };
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
}
