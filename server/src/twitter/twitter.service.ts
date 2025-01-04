import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ActorRun, ApifyClient } from 'apify-client';
import { OpenAIWrapper } from 'src/modules/openai/openai.service';
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

  constructor(private readonly openAiService: OpenAIWrapper) {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      throw new Error('Apify API key is required. Set it in environment.');
    }
    this.client = new ApifyClient({ token: apiKey });
    this.input = { username: '', max_posts: 50 };
  }

  async getTweets(
    username: string,
    cashtag: string,
  ): Promise<{ tweets: string[]; report: string }> {
    if (username) {
      this.input.username = username;
    }

    try {
      const run: ActorRun = await this.client
        .actor('SfyC2ifoAKkAUvjTt')
        .call(this.input);
      const { items } = await this.client
        .dataset(run.defaultDatasetId)
        .listItems();
      if (items) {
        this.tweets = items;
      }

      this.allTwitts = this.tweets.map((tweet) => tweet.text);

      // use openai to filter relevant tweets one by one
      const filteredMessages: string[] = [];

      for (const tweet of this.allTwitts) {
        const filterPrompt = `Is this tweet relevant to ${cashtag}? Reply with "yes" or "no":\n\n${tweet}`;

        const filteredResponse = await this.openAiService.generateResponse(
          filterPrompt,
          'You are a helpful AI that determines if tweets are relevant to a given cashtag. Reply with "yes" or "no" only.',
        );

        if (
          typeof filteredResponse.content === 'string' &&
          filteredResponse.content.toLowerCase().trim() === 'yes'
        ) {
          filteredMessages.push(tweet as string);
        }
      }

      const response = await this.openAiService.generateResponse(
        filteredMessages.join('\n'),
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
        tweets: filteredMessages,
        report: response.content as string,
      };
    } catch (error) {
      console.error('Error fetching tweets:', error);
      throw new Error('Failed to fetch tweets.');
    }
  }
}
