import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ActorRun, ApifyClient } from 'apify-client';
import { OpenAIWrapper } from 'src/modules/openai/openai.service';
import { PrismaService } from 'src/prisma/prisma.service';
dotenv.config();

interface InputData {
  username: string;
  max_posts: number;
}

@Injectable()
export class TwitterService {
  private client: ApifyClient;
  private input: InputData;
  private tweets: Record<string | number, unknown>[];
  private allTwitts: unknown[];

  constructor(private readonly openAiService: OpenAIWrapper, private prismaService: PrismaService) {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      throw new Error('Apify API key is required. Set it in environment.');
    }
    this.client = new ApifyClient({ token: apiKey });
    this.input = { username: '', max_posts: 50 };
  }
  async getAnalysis(
    username: string,
    cashtag: string,
  ): Promise<{ tweets: string[]; report: string; rawTweets: unknown[] }> {
    if (username) {
      this.input.username = username;
    }

    try {
      const result = await this.prismaService.users.findMany({ where: { name: username } })
      const tweets = result[0]?.tweets
      const tweetsArray = Object.values(tweets);
      this.allTwitts = tweetsArray.map((tweet) => tweet.text);

      // Filter all tweets at once
      const filterPrompt = `Here are some tweets:\n\n${this.allTwitts.join('\n-----------------')}\n\nPlease return a JSON format containing only the tweets relevant to ${cashtag}. Each tweet should be a string in the list.`;

      const filteredResponse = await this.openAiService.generateResponse(
        filterPrompt,
        `You are a helpful AI that determines if tweets are relevant to a given cashtag. 
        You will receive the list of tweets.
        Go through each tweet and decide if it is relevant to the cashtag and return only the relevant tweets.
         Return JSON of relevant tweets in the following format:
          {
            "tweets": [
              "Tweet 1",
              "Tweet 2",
              "Tweet 3"
            ]
          }
         `,
        {
          outputFormat: 'json',
        },
      );

      const filteredMessages: any = filteredResponse.content;

      const response = await this.openAiService.generateResponse(
        filteredMessages?.tweets?.join('\n'),
        `Please analyze these cashtag-related (${cashtag}) tweets and provide a detailed report covering:

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

      return {
        tweets: filteredMessages.tweets,
        report: response.content as string,
        rawTweets: this.allTwitts
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      throw new Error('Failed to fetch tweets.');
    }
  }

  async savetoDB(username: string): Promise<void> {
    try {
      this.input.username = username
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

      const jsonItems = items.map((item) => {
        return JSON.parse(JSON.stringify(item));
      });

      await this.prismaService.users.upsert({
        where: { name: username },
        update: {
          tweets: jsonItems,
        },
        create: {
          name: username,
          tweets: jsonItems,
        },
      });
    } catch (error) {
      console.error('Error saving tweets:', error);
      throw new Error('Failed to save tweets.');
    }
  }
}
