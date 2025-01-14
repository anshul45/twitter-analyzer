/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';

export interface DailyReport {
  date: string;
  report: string;
}

export interface TwitterResponse {
  tweets: string[];
  report: string | null;
}
const url = "http://localhost:8000" 


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCashtags = async (): Promise<any> => {
  try {
    const response = await axios.get(
      `${url}/twitter/cashtag`
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
      `${url}/twitter/report?date=${date}&cashtag=${cashtag}`,
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
      `${url}/twitter/reports`
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
      `${url}/twitter`
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

export const getSummary = async (filteredData?: any,cashtag?:string,todayCashtag?:string): Promise<string> => {
  try {
    const response = await axios.post(
      `${url}/twitter/summary`,
      { tweets: filteredData,
        cashtag:cashtag,
        todayCashtag:todayCashtag
       }
    );
    return response.data.summary;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching summary:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error fetching summary:', error);
    }
    throw error;
  }
};


