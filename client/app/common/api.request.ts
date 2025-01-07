import axios from 'axios';

export interface TwitterResponse {
  tweets: string[];
  report: string;
  rawTweets:string[]
}

export const getTweets = async (cashtag: string): Promise<TwitterResponse> => {
  // const serverUrl = window.ENV.SERVER_URL;
  // if (!serverUrl) {
  //   throw new Error('SERVER_URL is not defined in the environment variables');
  // }

  try {
    const response = await axios.get(
      `http://localhost:8000/twitter/cashtag?cashtag=${cashtag}`
    );

    console.log(response.data)

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching tweets:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error fetching tweets:', error);
    }
    throw error;
  }
};
