import axios from 'axios';

export interface DailyReport {
  date: string;
  report: string;
}

export interface TwitterResponse {
  tweets: string[];
  report: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTweets = async (cashtag: string, date: string): Promise<any> => {
  try {
    const response = await axios.get(
      `http://localhost:8000/twitter/cashtag?cashtag=${cashtag}&date=${date.trim()}`
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

export const generateReport = async (date: string,cashtag:string): Promise<void> => {
  try {
    await axios.post(
      `http://localhost:8000/twitter/report?date=${date}&cashtag=${cashtag}`,
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error generating report:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error generating report:', error);
    }
    throw error;
  }
};

export const getReports = async (): Promise<DailyReport[]> => {
  try {
    const response = await axios.get(
      `http://localhost:8000/twitter/reports`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching reports:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error fetching reports:', error);
    }
    throw error;
  }
};

export const getRawTweets = async (): Promise<TwitterResponse> => {
  try {
    const response = await axios.get(
      `http://localhost:8000/twitter/cashtag`
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
