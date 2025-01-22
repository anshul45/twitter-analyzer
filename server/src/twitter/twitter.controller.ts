import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Body,
  Delete,
} from '@nestjs/common';
import { TwitterService } from './twitter.service';

@Controller('twitter')
export class TwitterController {
  constructor(private readonly twitter: TwitterService) {}

  @Post()
  async addText() {
      try {
       await this.twitter.savetoDB();
      } catch (error) {
        console.error(`Error adding user:`, error.message);
      }
    }
  

  @Get()
  async processText() {
    try {
      const tweets = await this.twitter.getAnalysis();
      return tweets
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

  @Get('cashtag/tweets')
  async getCashtagTweets(){
    const tweets = await this.twitter.getTweetsForCashtag()
    return tweets;
  }

  @Get('users')
  async getUsers(){
    const users = await this.twitter.getUsers()
    return users;
  }

  @Post('user')
  async addUser(@Body() body: { username: string;}){
    const {username} = body;
    const users = await this.twitter.addUser(username)
    return users;
  }


  @Delete('user')
  async removeUser(@Body() body: { id: string;}){
    const {id} = body;
    const users = await this.twitter.removeUser(id)
    return users;
  }
}
