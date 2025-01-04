import axios from 'axios';

export interface TwitterResponse {
  tweets: string[];
  report: string;
}

export const getTweets = async (username: string, cashtag: string): Promise<TwitterResponse> => {
  try {
    const response = await axios.get(
      `https://twitter-analyzer.onrender.com/twitter?username=${username}&cashtag=${cashtag}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error;
  }
};
