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
  async getReports(): Promise<any> {
    try {
      const tweetDatesWithReports = await this.prismaService.tweetDate.findMany(
        {
          include: {
            reports: true, // Include associated reports
          },
        },
      );
      // Transform the result into the desired format: date: reports
      const groupedReports = tweetDatesWithReports.map((tweetDate) => ({
        date: tweetDate.date,
        reports: tweetDate.reports,
      }));
      return groupedReports;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw new Error('Failed to fetch reports.');
    }
  }

  async getAnalysis(
    cashtag: string,
    options = {
      date: null,
      username: null,
    },
  ): Promise<any> {
    //{ tweets: string[]; report: string; rawTweets: unknown[] }
    try {
      let allUserTweets;

      if (!options.date) {
        allUserTweets = await this.prismaService.tweetDate.findMany({
          include: {
            tweets: {
              include: {
                user: true,
              },
            },
          },
        });
      } else {
        allUserTweets = await this.prismaService.tweetDate.findMany({
          where: {
            date: {
              in: options.date?.trim(),
            },
          },
          include: {
            tweets: {
              include: {
                user: true,
              },
            },
          },
        });
      }


      let filteredTweets;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      cashtag
        ? (filteredTweets = allUserTweets
            .map((user: { tweets: any[] }) => {
              const matchingTweets = user.tweets.filter((tweet) => {
                return (
                  Array.isArray(tweet.cashtags) &&
                  tweet.cashtags.includes(cashtag.toUpperCase())
                );
              });

              return {
                ...user,
                tweets: matchingTweets,
              };
            })
            .filter((user) => user.tweets.length > 0))
        : (filteredTweets = null);

      // const oneDayTweets = await this.prismaService.tweetDate.findMany({
      //   where: {
      //     date: DateUtil.getCurrentDate(),
      //     cashtags: {
      //       in: {
      //         cashtag: cashtag,
      //       },
      //     },
      //   },
      //   include: {
      //     tweets: {
      //       include: {
      //         user: true,
      //       },
      //     },
      //   },
      // });

      let tweetsText = null;
      cashtag && (tweetsText = FormatTweets.groupedTweets(filteredTweets));
      if (cashtag) {
        // filter tweets by username
        if (options.username) {
          tweetsText = tweetsText.filter(
            (user) => user.username === options.username,
          );
        }
      }

      // // Filter all tweets at once

      // const filterPrompt = `Here are some tweets:\n\n${this.allTweets.join('\n-----------------')}\n\nPlease return a JSON format containing only the tweets relevant to ${cashtag}. Each tweet should be a string in the list.`;

      // const filteredResponse = await this.openAiService.generateResponse(
      //   filterPrompt,
      //   `You are a helpful AI that determines if tweets are relevant to a given cashtag.
      //   You will receive the list of tweets.
      //   Go through each tweet and decide if it is relevant to the cashtag and return only the relevant tweets.
      //    Return JSON of relevant tweets in the following format:
      //     {
      //       "tweets": [
      //         "Tweet 1",
      //         "Tweet 2",
      //         "Tweet 3"
      //       ]
      //     }
      //    `,
      //   {
      //     outputFormat: 'json',
      //   },
      // );

      // const filteredMessages: any = filteredResponse.content

      // save report in db
      let report = null;
      if (cashtag) {
        report = null;
      }
      if (options.date) {
        // if (report) {
        //   await this.prismaService.tweetDate.update({
        //     where: { date: options.date },
        //     data: { report: report },
        //   });
        // }
      }

      return {
        tweets: cashtag ? tweetsText : allUserTweets,
        report: report,
      };
    } catch (error) {
      console.error('Error fetching tweets:', error);
      throw new Error('Failed to fetch tweets.');
    }
  }

  async generateReport(tweetsText: any, cashtag: string): Promise<string> {
    const response = await this.openAiService.generateResponse(
      await this.formatUserTweetsToMarkdown(tweetsText),
      `Please analyze these cashtag-related (${cashtag}) tweets by given username and provide a detailed report covering below topics.
      Please stick to the tweets only and username provided to you. Don't use any other external information. 
      Just analyse these tweets and provide a report. It is very important to stick to the tweets only and cite the tweets using tweet urls.

    1. Market Sentiment & Trading Activity
    - Overall market sentiment (bullish/bearish signals)
    - Trading patterns and strategies mentioned
    - Common price targets or predictions
    - Risk assessments and warnings

    2. Symbol Analysis
    - Most frequently discussed cashtags
    - Correlations between different symbols
    - How sentiment varies across different assets
    - Emerging or trending symbols

    3. Information Sources & Credibility
    - Types of analysis being shared (technical, fundamental, news-based)
    - Quality of supporting evidence provided
    - Common information sources cited
    - Presence of potential misinformation or pump-and-dump patterns

    4. Community Dynamics
    - Key influencers and their impact
    - Common discussion patterns
    - How news events affect conversation
    - Popular trading theories or strategies

    Technical Context
    - Trading indicators frequently referenced
    - Chart patterns being discussed
    - Time frames most commonly analyzed
    - Risk management approaches mentioned`,
    );

    return response.content as string;
  }

  async formatUserTweetsToMarkdown(tweets: any[]): Promise<string> {
    // tweets = [{username: 'pakpakchicken', tweets: ['tweet1', 'tweet2']}, {username: 'fundstrat', tweets: ['tweet1', 'tweet2']}]
    const formattedTweets = tweets.map((user) => {
      const userTweets = user.tweets
        .map(
          (tweet) =>
            `- ${tweet.text} \n - tweet url: https://x.com/${user.username}/status/${tweet.tweetId}`,
        )
        .join('\n');
      return `### ${user.username}\n -${userTweets}`;
    });

    const markdown = formattedTweets.join('\n\n');
    return markdown;
  }

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
          text: string;
          username: string;
          retweetedTweet: any;
          conversationId: string;
        } => ({
          tweetId: tweet.tweet_id,
          createdAt: DateUtil.dateOutput(tweet.created_at.toString()),
          text: tweet.retweeted_tweet
            ? tweet.retweeted_tweet?.text + '\n' + tweet.text
            : tweet.text,
          username: username,
          retweetedTweet: tweet.retweeted_tweet?.text,
          conversationId: tweet.conversation_id,
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
        ...new Set(combinedTweets.map((tweet) => tweet.createdAt)),
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
          (tweet) => tweet.createdAt === date,
        );

        let tweetDate = await this.prismaService.tweetDate.findUnique({
          where: { date },
        });

        if (!tweetDate) {
          tweetDate = await this.prismaService.tweetDate.create({
            data: { date },
          });
        }

        for (const tweet of tweetsForDate) {
          // classify tweet cashtag
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
          await this.updateCashtagCounts(date, cashtags);

          await this.prismaService.tweet.upsert({
            where: { tweetId: tweet.tweetId },
            update: {},
            create: {
              tweetId: tweet.tweetId,
              text: tweet.text,
              createdAt: tweet.createdAt,
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

      console.log(`Tweets successfully saved for username: ${username}`);
    } catch (error) {
      console.error('Error saving tweets:', error);
      throw new Error('Failed to save tweets.');
    }
  }

  async saveReport(date: string, cashtag: string) {
    try {
      const allUserTweets = await this.prismaService.tweetDate.findMany({
        where: {
          date: date,
        },
        include: {
          tweets: {
            include: {
              user: true,
            },
          },
        },
      });

      const filteredTweets = allUserTweets
        .map((user: { tweets: any[] }) => {
          const matchingTweets = user.tweets.filter((tweet) => {
            return (
              Array.isArray(tweet.cashtags) &&
              tweet.cashtags.includes(cashtag.toUpperCase())
            );
          });

          return {
            ...user,
            tweets: matchingTweets,
          };
        })
        .filter((user) => user.tweets.length > 0);

      const tweetsText = FormatTweets.groupedTweets(filteredTweets);

      const report = await this.generateReport(tweetsText, cashtag);

      const tweetDate = await this.prismaService.tweetDate.findUnique({
        where: { date },
      });

      await this.prismaService.report.create({
        data: {
          content: report,
          cashtag: cashtag,
          tweetDate: {
            connect: { id: tweetDate.id }, // Connect to the existing TweetDate
          },
        },
      });

      return {
        date: date,
        report: report,
      };
    } catch (error) {
      console.error('Error saving tweets:', error);
      throw new Error('Failed to save tweets.');
    }
  }

  async getCashtagCountsByDate(): Promise<void> {  
    const data = await this.prismaService.cashtagCount.findMany({
      select: {
        cashtag: true,
        date: true,
        types: true,
        count: true,
      },
    });
    
    const aggregatedResult = data.reduce((acc, curr) => {
      const key = `${curr.cashtag}_${curr.date}_${curr.types}`;
      if (!acc[key]) {
        acc[key] = { 
          cashtag: curr.cashtag, 
          date: curr.date, 
          types: curr.types, 
          count: 0 
        };
      }
      acc[key].count += curr.count;
      return acc;
    }, {});
    
    return Object.values(aggregatedResult) as any;
  }

  async updateCashtagCounts(
    date: string,
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
              date: date,
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
            date: date,
            count: increment,
            types: tweetTypes,
          },
        });
      }),
    );
  }

  async generateSummaryFromTweets(
    tweets?: TweetInput[],
    cashtag?: string,
    todayCashtag?: string,
  ): Promise<string> {
    try {
      // Format tweets for OpenAI
      let formattedTweets;
      if (tweets) {
        formattedTweets = tweets
          .filter((tweet: any) => tweet.qualityScore > 5)
          .map(
            (tweet) =>
              `Tweet by @${tweet.username}:\n tweetId: ${tweet.tweetId} \n cashtags: ${tweet.cashtags.join(', ')} \n ${tweet.text}\n---\n`,
          )
          .join('\n');
      } else if (cashtag) {
        const tweets = await this.getCashtagTweets(cashtag);
        formattedTweets = tweets
          .filter((tweet: any) => tweet.qualityScore > 5)
          .map(
            (tweet) =>
              `Tweet by @${tweet.username}:\n tweetId: ${tweet.tweetId} \n cashtags: ${tweet.cashtags.join(', ')} \n ${tweet.text}\n---\n`,
          )
          .join('\n');
      } else {
        const tweets = await this.getTodaysCashtagTweets(todayCashtag);
        formattedTweets = tweets
          .filter((tweet: any) => tweet.qualityScore > 5)
          .map(
            (tweet) =>
              `Tweet by @${tweet.username}:\n tweetId: ${tweet.tweetId} \n cashtags: ${tweet.cashtags.join(', ')} \n ${tweet.text}\n---\n`,
          )
          .join('\n');
      }

      if (formattedTweets.length == 0) {
        return 'No relevant tweets found';
      }

      const response = await this.openAiService.generateResponse(
        formattedTweets,
        `I use X (previously Twitter) to stay on top of news related to publicly traded companies. 
         Below are a few tweets from [date] for [$cashtag]. Can you help summarize the top takeaways? 
        [Dedupe for redundant topics across tweets]
        [Include your perspective on what it means for [$cashtag] - bullish or bearish for the stock price, implications on the company's long-term prospects.] 
        `,
      );

      return response.content as string;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary from tweets');
    }
  }
  
  async getCashtagTweets(cashtag:string):Promise<TweetInput[]>{
    try{
      const tweets1  = await this.prismaService.tweet.findMany()
      
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

  async getTodaysCashtagTweets(cashtag:string):Promise<TweetInput[]>{
    try{
      const today = new Date()
      const tweets1 = await this.prismaService.tweet.findMany({
        where:{
          createdAt:today.toDateString()
        }
      })
      const cashtagtweets = tweets1.filter(tweets => Array.isArray(tweets.cashtags) && tweets.cashtags.includes(cashtag))


      // const tweets = await this.prismaService.$runCommandRaw({
      //   aggregate: 'Tweet', 
      //   pipeline: [
      //     {
      //       $match: {
      //         cashtags: cashtag,
      //         createdAt:today.toDateString()
      //       },
      //     },
      //   ],
      //   cursor: {},
      // });

      return cashtagtweets as any
    }
    catch (error) {
      console.error("Error getting today's cashtag tweets:", error);
      throw new Error("Failed to get today's cashtag tweets");
    }
  }
}
