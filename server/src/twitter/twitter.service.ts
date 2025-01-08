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
    this.input = { username: '', max_posts: 50 };
  }
  async getReports(): Promise<any> {
    try {
      const reports = await this.prismaService.tweetDate.findMany({
        select: {
          date: true,
          report: true,
        },
        orderBy: {
          date: 'desc',
        },
      });
      return reports;
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
      const days = options.date?.trim()
        ? [options.date]
        : DateUtil.getDatesForLastThreeDays();

      const allUserTweets = await this.prismaService.tweetDate.findMany({
        where: {
          date: {
            in: days,
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

      console.log(options.date);

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
        report = await this.generateReport(tweetsText, cashtag);
      }
      if (options.date) {
        if (report) {
          await this.prismaService.tweetDate.update({
            where: { date: options.date },
            data: { report: report },
          });
        }
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
      Please stick to the tweets only and username provided to you. Don't use any other external information. Just analyse these tweets and provide a report.

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
      const userTweets = user.tweets.map((tweet) => `- ${tweet}`).join('\n');
      return `### ${user.username}\n${userTweets}`;
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
        } => ({
          tweetId: tweet.tweet_id,
          createdAt: DateUtil.dateOutput(tweet.created_at.toString()),
          text: tweet.text,
          username: username,
        }),
      );

      const uniqueDates = [
        ...new Set(extractedTweets.map((tweet) => tweet.createdAt)),
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

            qualityScore is a number between 0 and 10 that indicates how the quality of tweet, whether tweet has some insights or it is more like a spam. 0 indicates spam and 10 indicates high quality tweet.
             Return Json with list of cashtags in the following format:
              {
                "cashtags": [
                  "$APPL",
                ],
                qualityScore: 5
              }
             `,
            {
              outputFormat: 'json',
            },
          );

          const cashtags = tweetsCashtags?.content;

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
}
