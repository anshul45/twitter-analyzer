import axios from 'axios';

export interface TwitterResponse {
  tweets: string[];
  report: string | null;
}

export const getTweets = async (cashtag: string,date:string): Promise<any> => {
  // const serverUrl = window.ENV.SERVER_URL;
  // if (!serverUrl) {
  //   throw new Error('SERVER_URL is not defined in the environment variables');
  // }
  try {
    const response = await axios.get(
      `http://localhost:3000/twitter/cashtag?cashtag=${cashtag}&date=${date.trim()}`
    );

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


export const getRawTweets = async (): Promise<TwitterResponse> => {

  try {
    const response = await axios.get(
      `http://localhost:3000/twitter/cashtag`
    );
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
