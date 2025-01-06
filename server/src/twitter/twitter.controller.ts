import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { TwitterService } from './twitter.service';

@Controller('twitter')
export class TwitterController {
  constructor(private readonly twitter: TwitterService) {}

  @Get()
  async processText(
    @Query('username') username: string,
    @Query('cashtag') cashtag: string,
  ) {
    try {
      console.log('processing text');
      console.log(username, cashtag);

      const usernames = username.split(',').map((u) => u.trim());

      const results = await Promise.all(
        usernames.map(async (user) => {
          const { tweets, report, rawTweets } = await this.twitter.getTweets(user, cashtag);
          return { user, tweets, report, rawTweets };
        }),
      );

      return {
        cashtag,
        results,
      };
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
