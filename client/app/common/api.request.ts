/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';

export interface DailyReport {
  date: string;
  report: string;
}

const url = "https://ec2-54-174-172-135.compute-1.amazonaws.com"
// const url = "http://localhost:8000"


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

export const getRawTweets = async () => {
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

export const getSummary = async (filteredData: any,title:string): Promise<string> => {
  try {
    const response = await axios.post(
      `${url}/twitter/summary`,
      { tweets: filteredData,
        title
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

export const getSummaryForCashtag = async (cashtag?:string): Promise<string> => {
  try {
    const response = await axios.post(
      `${url}/twitter/summary/cashtag`,
      { 
        cashtag:cashtag,
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

export const getAllSummary = async (): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${url}/twitter/summary`
    );
    return response.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching summary:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error fetching summary:', error);
    }
    throw error;
  }
};

export const getCashtagTweets = async (): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${url}/twitter/cashtag/tweets`
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
    
    export const getUsers = async (): Promise<any[]> => {
    try {
      const response = await axios.get(
        `${url}/twitter/users`
      );
  
  
      return response.data;
  
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching Users:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error fetching Users:', error);
      }
      throw error;
    }
  }

  export const addUser = async (username:string): Promise<void> => {
    try {
      const response = await axios.post(
        `${url}/twitter/user`,{username:username}
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching Users:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error fetching Users:', error);
      }
      throw error;
    }
  }
  export const removeUser = async (id: string): Promise<void> => {
    try {
      await axios.delete(`${url}/twitter/user`, {
        data: { id },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error deleting user:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error deleting user:', error);
      }
      throw error;
    }
  };
