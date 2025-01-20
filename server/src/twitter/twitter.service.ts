/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ActorRun, ApifyClient } from 'apify-client';
import { OpenAIWrapper } from 'src/modules/openai/openai.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DateUtil } from 'src/common/utils/format.date.utils';
import { FormatTweets } from 'src/common/utils/format.tweets.utils';
dotenv.config();

interface InputData {
  username: string;
  max_posts: number;
}

interface allTweetsData {
  tweetId: string;
  text: string;
  createdAt: string;
  username: string;
  date: string;
}

interface TweetInput {
  cashtags: string[];
  createdAt: string;
  qualityScore: number;
  text: string;
  tweetId: string;
  username: string;
  type:string
}

@Injectable()
export class TwitterService {
  private client: ApifyClient;
  private input: InputData;
  private tweets: Record<string | number, unknown>[];
  private allTweets: allTweetsData[];

  constructor(
    private readonly openAiService: OpenAIWrapper,
    private prismaService: PrismaService,
  ) {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      throw new Error('Apify API key is required. Set it in environment.');
    }
    this.client = new ApifyClient({ token: apiKey });
    this.input = { username: '', max_posts: 20 };
  }


  async getAnalysis(): Promise<any> {
    try {
     const tweets = await this.prismaService.tweet.findMany();
      return tweets;
    } catch (error) {
      console.error('Error fetching tweets:', error);
      throw new Error('Failed to fetch tweets.');
    }
  }



  // async formatUserTweetsToMarkdown(tweets: any[]): Promise<string> {
  //   // tweets = [{username: 'pakpakchicken', tweets: ['tweet1', 'tweet2']}, {username: 'fundstrat', tweets: ['tweet1', 'tweet2']}]
  //   const formattedTweets = tweets.map((user) => {
  //     const userTweets = user.tweets
  //       .map(
  //         (tweet) =>
  //           `- ${tweet.text} \n - tweet url: https://x.com/${user.username}/status/${tweet.tweetId}`,
  //       )
  //       .join('\n');
  //     return `### ${user.username}\n -${userTweets}`;
  //   });

  //   const markdown = formattedTweets.join('\n\n');
  //   return markdown;
  // }

  async savetoDB(username: string): Promise<void> {
    try {
      this.input.username = username;
      const run: ActorRun = await this.client
        .actor('SfyC2ifoAKkAUvjTt')
        .call(this.input);

      const { items } = await this.client
        .dataset(run.defaultDatasetId)
        .listItems();

      if (!items.length) {
        console.log(`No tweets found for username: ${username}`);
        return;
      }

      const extractedTweets = items.map(
        (
          tweet: any,
        ): {
          tweetId: string;
          createdAt: string;
          date: string;
          text: string;
          username: string;
          conversationId: string;
          retweet: boolean;
          quote: boolean;
        } => ({
          tweetId: tweet.tweet_id,
          createdAt: tweet.created_at,
          date: DateUtil.dateOutput(tweet.created_at),
          text: tweet.retweeted_tweet
            ? `${tweet.text.split(":")[0]}  /n  ${tweet.retweeted_tweet.text}`
            : tweet.quoted ? tweet.text +"  " + tweet.quoted?.text 
            : tweet.text,
          username: username,
          conversationId: tweet.conversation_id,
          retweet:!!tweet.retweeted_tweet?.text,
          quote:!!tweet.quoted?.text,
        }),
      );

      // combine tweets with same conversationId
      const combinedTweets = extractedTweets.reduce((acc, tweet) => {
        const existingTweet = acc.find(
          (existing) => existing.conversationId === tweet.conversationId,
        );

        if (existingTweet) {
          existingTweet.text += '\n' + tweet.text;
        } else {
          acc.push(tweet);
        }

        return acc;
      }, [] as any[]);

      
      const uniqueDates = [
        ...new Set(combinedTweets.map((tweet) => tweet.date)),
      ];

      let user = await this.prismaService.user.findUnique({
        where: { username: username },
      });

      if (!user) {
        user = await this.prismaService.user.create({
          data: { username: username },
        });
      }

      for (const date of uniqueDates) {
        const tweetsForDate = extractedTweets.filter(
          (tweet) => tweet.date === date,
        );

        let tweetDate = await this.prismaService.tweetDate.findUnique({
          where: { date:date },
        });

        if (!tweetDate) {
          tweetDate = await this.prismaService.tweetDate.create({
            data: {date:date},
          });
        }

       
        for (const tweet of tweetsForDate) {
          const existingTweet = await this.prismaService.tweet.findUnique({
            where: { tweetId: tweet.tweetId },
          });

          if(!existingTweet){
          const tweetsCashtags = await this.openAiService.generateResponse(
            `classify ${tweet.text} into cashtag category.`,
            `You are a helpful AI that determines if tweets belongs to any twitter cashtags and assign qualityScore. 
              Cashtags on Twitter are a way to refer to specific stocks, cryptocurrencies, or other financial instruments using a dollar sign ($) followed by a ticker symbol (e.g., $AAPL for Apple, $BTC for Bitcoin). 
              They are similar to hashtags but are used for financial conversations.

              qualityScore is a number between 0 and 10 that indicates how the quality of tweet, whether tweet has some insights or it is more like a spam. The insights should be related to financial information. 0 indicates spam and 10 indicates high quality tweet.
              Classify the tweet into tweetType. tweetType signals if tweet contains falls into either of TWEET_TAGS.
              TWEET_TAGS:
                "breaking_news_announcements",
                "earnings_financial_results",
                "mergers_acquisitions",
                "fundamental_analysis",
                "market_sentiment_opinions",
                "industry_macroeconomic_impact",
                "miscellaneous_noise"

            Return Json with list of cashtags in the following format:
              {
                "cashtags": [
                  "$APPL",
                ],
                "qualityScore": 5,
                "tweetType": "breaking_news_announcements"
              }
             `,
            {
              outputFormat: 'json',
            },
          );

         const cashtags = tweetsCashtags?.content;

          // store cashtag count in the database by date
          //@ts-ignore
          await this.updateCashtagCounts(tweet.date,tweet.createdAt, cashtags);
        
          await this.prismaService.tweet.upsert({
            where: { tweetId: tweet.tweetId },
            update: {},
            create: {
              tweetId: tweet.tweetId,
              text: tweet.text,
              createdAt: tweet.createdAt,
              date: tweet.date,
              retweet: tweet.retweet,
              quote:tweet.quote,
              username: tweet.username,
              user: { connect: { id: user.id } },
              tweetDate: { connect: { id: tweetDate.id } },
              cashtags: cashtags['cashtags'] || { set: [] },
              qualityScore: cashtags['qualityScore'] || 0,
              type: cashtags['tweetType'] || '',
            },
          });
        }
        }

    }
      console.log(`Tweets successfully saved for username: ${username}`);
    } catch (error) {
      console.error('Error saving tweets:', error);
      throw new Error('Failed to save tweets.');
    }
  }

  async getCashtagCountsByDate(): Promise<void> {
    const dates = DateUtil.getDatesForLastSevenDays();
    const daysCount = DateUtil.getDaysCount();

  
    // const sevenDaysdata = await this.prismaService.cashtagCount.findMany({
    //   select: {
    //     cashtag: true,
    //     createdAt: true,
    //     date: true,
    //     types: true,
    //     count: true,
    //   },
    //   where: {
    //     date: {
    //       in: dates,
    //     },
    //   },
    // });
  
    const allData = await this.prismaService.cashtagCount.findMany({
      select: {
        cashtag: true,
        createdAt: true,
        date: true,
        types: true,
        count: true,
      },
    });

    const sevenDaysdata = allData.filter((item) => dates.includes(item.date));
  
  
    // Calculate the average and standard deviation for each cashtag
    const cashtagStats: Record<string, { total: number; values: number[] }> = {};
  
    allData.forEach((item) => {
      if (!cashtagStats[item.cashtag]) {
        cashtagStats[item.cashtag] = { total: 0, values: [] };
      }
      cashtagStats[item.cashtag].total += item.count;
      cashtagStats[item.cashtag].values.push(item.count);
    });
  
    const avgCashtagData = Object.entries(cashtagStats).map(([cashtag, data]) => {
      const avg = data.total / daysCount;
      const variance =
        data.values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / daysCount;
      const stdDev = Math.sqrt(variance);
  
      return {
        cashtag,
        avg,
        stdDev,
      };
    });
  
    return {
      sevenDaysdata,
      avgCashtagData,
    } as any;
  }
  
  

  async updateCashtagCounts(
    date: string,
    createdAt:string,
    cashtags: { cashtags: string[]; tweetType: string },
  ): Promise<void> {

    // Count occurrences of each cashtag
    const cashtagCounts = cashtags.cashtags.reduce(
      (acc, cashtag) => {
        acc[cashtag] = (acc[cashtag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Ensure tweetType is an array
    const tweetTypes = Array.isArray(cashtags.tweetType)
      ? cashtags.tweetType
      : [cashtags.tweetType];

    // Update each cashtag count
    await Promise.all(
      Object.entries(cashtagCounts).map(async ([cashtag, increment]) => {
        await this.prismaService.cashtagCount.upsert({
          where: {
            cashtag_date: {
              // Using the compound unique constraint
              cashtag: cashtag,
              date: date.trim(),
            },
          },
          update: {
            count: {
              increment: increment,
            },
            types: {
              set: tweetTypes,
            },
          },
          create: {
            cashtag: cashtag,
            createdAt: createdAt,
            date: date.trim(),
            count: increment,
            types: tweetTypes,
          },
        });
      }),
    );
  }

  async generateSummaryFromTweets(
    tweets: TweetInput[],
    title:string,
  ): Promise<string> {
    try {
      // Format tweets for OpenAI

    const formattedTweets = tweets
          .filter((tweet: any) => tweet.qualityScore > 5)
          .map(
            (tweet) =>
              `Tweet by @${tweet.username}:\n tweetId: ${tweet.tweetId}\n tweet_type: ${tweet.type} \n cashtags: ${tweet.cashtags.join(', ')} \n url: https://x.com/${tweet.username}/status/${tweet.tweetId} \n ${tweet.text}\n---\n`,
          )
          .join('\n');

      if (formattedTweets.length == 0) {
        return 'Sorry, No relevant tweets with quality score greater than 5 found';
      }

      const response = await this.openAiService.generateResponse(
        formattedTweets,
        `
        I use X (previously Twitter) to stay on top of news related to publicly traded companies.
        Below are a few tweets (including URLs) from [date] for [$cashtags] and [tweet_type]. Can you help summarize the top takeaways and add url of tweets?
        [Dedupe for redundant topics across tweets]
        [Include your perspective on what it means for [$cashtags] and [tweet_type] it should be generic not related to cashtags and tweet_type - bullish or bearish for the stock price, implications on the company's long-term prospects.]
        Tweet URLs:[Insert Tweet URLs here]
        `, 
      );

      if(response.content){
        await this.prismaService.summary.create({
          data: {
            date: DateUtil.getCurrentDate(),  
            createdAt: new Date(),
            updatedAt: new Date(),
            homepage: {
              connectOrCreate: {
                where: { title: title },  
                create: { 
                  title: title, 
                  description: response.content as string,
                },
              },
            },
          },
        });
      }

      return response.content as string;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary from tweets');
    }
  }

  async generateSummaryFromCashtag(
    cashtag: string,
  ): Promise<string> {
    try {
      // Format tweets for OpenAI
        const tweets = await this.getCashtagTweets(cashtag);
        const formattedTweets = tweets
          .filter((tweet: any) => tweet.qualityScore > 5)
          .map(
            (tweet) =>
              `Tweet by @${tweet.username}:\n tweetId: ${tweet.tweetId} \n cashtags: ${tweet.cashtags.join(', ')} \n url: https://x.com/${tweet.username}/status/${tweet.tweetId} \n ${tweet.text}\n---\n`,
          )
          .join('\n');

      if (formattedTweets.length == 0) {
        return 'Sorry, No relevant tweets with quality score greater than 5 found';
      }

      const response = await this.openAiService.generateResponse(
        formattedTweets,
        `
        I use X (previously Twitter) to stay on top of news related to publicly traded companies.
        Below are a few tweets (including URLs) from [date] for [$cashtag]. Can you help summarize the top takeaways and add url of tweets?
        [Dedupe for redundant topics across tweets]
        [Include your perspective on what it means for [$cashtag] - bullish or bearish for the stock price, implications on the company's long-term prospects.]
        Tweet URLs:[Insert all Tweet URLs here]
        `,
      );

      

      //todo
await this.prismaService.summary.create({
  data: {
    date: DateUtil.getCurrentDate(),  
    createdAt: new Date(),
    updatedAt: new Date(),
    analysis: {
      connectOrCreate: {
        where: { title: cashtag },  
        create: { 
          title: cashtag, 
          description: response.content as string,
        },
      },
    },
  },
});

      
      return response.content as string;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary from tweets');
    }
  }

  async getCashtagTweets(cashtag: string): Promise<TweetInput[]> {
    try {
      const tweets1 = await this.prismaService.tweet.findMany()

      const cashtagtweets = tweets1.filter(tweets => Array.isArray(tweets.cashtags) && tweets.cashtags.includes(cashtag))
      // const tweets = await this.prismaService.$runCommandRaw({
      //   aggregate: 'Tweet', 
      //   pipeline: [
      //     {
      //       $match: {
      //         cashtags: cashtag,
      //       },
      //     },
      //   ],
      //   cursor: {},
      // });

      return cashtagtweets as any
    }
    catch (error) {
      console.error('Error getting cashtag tweets:', error);
      throw new Error('Failed to get cashtag tweets');
    }
  }

  async getTweetsSummary(): Promise<any[]> {
    try {
      const summaryWithAnalysis = await this.prismaService.summary.findMany({
        include: {
          analysis: true,  
          homepage:true
        },
      });  
      return summaryWithAnalysis;
    } catch (error) {
      console.error('Error getting analysis pages summaries:', error);
      throw new Error('Failed to get analysis pages summaries');
    }
  }
  

  async getTweetsForCashtag(): Promise<any[]> {
    try {
      const tweets = await this.prismaService.tweet.findMany({
        where:{
          date: DateUtil.getCurrentDate()
        }
      });  
      return tweets;
    } catch (error) {
      console.error('Error getting analysis pages summaries:', error);
      throw new Error('Failed to get analysis pages summaries');
    }
  }
  


  // async getTodaysCashtagTweets(cashtag: string): Promise<TweetInput[]> {
  //   try {
  //     const today = new Date()
  //     const tweets1 = await this.prismaService.tweet.findMany({
  //       where: {
  //         createdAt: today.toDateString()
  //       }
  //     })
  //     const cashtagtweets = tweets1.filter(tweets => Array.isArray(tweets.cashtags) && tweets.cashtags.includes(cashtag))


  //     // const tweets = await this.prismaService.$runCommandRaw({
  //     //   aggregate: 'Tweet', 
  //     //   pipeline: [
  //     //     {
  //     //       $match: {
  //     //         cashtags: cashtag,
  //     //         createdAt:today.toDateString()
  //     //       },
  //     //     },
  //     //   ],
  //     //   cursor: {},
  //     // });

  //     return cashtagtweets as any
  //   }
  //   catch (error) {
  //     console.error("Error getting today's cashtag tweets:", error);
  //     throw new Error("Failed to get today's cashtag tweets");
  //   }
  // }
}
