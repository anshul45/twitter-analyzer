import { MetaFunction } from '@remix-run/node';
import { useEffect, useState } from 'react';
import { getRawTweets } from '~/common/api.request';
import { Input, Flex, Select, Space, DatePicker } from 'antd';
import CustomTable from '~/components/Table';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';

interface Tweet {
  cashtags: string[];
  text: string;
  createdAt: string;
  username: string;
  tweetId: string;
  qualityScore: number;
}

interface Filters {
  date: string | null;
  username: string;
  cashtag: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Twitter Scrapper' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export default function Index() {
  const [data, setData] = useState<Tweet[]>([]);
  const [filteredData, setFilteredData] = useState<Tweet[]>([]);
  const [filters, setFilters] = useState({
    date: null,
    username: 'All',
    cashtag: '',
  });
  

  const tweets =  useLoaderData<{ tweets: { tweets: Tweet[] }[] }>();

  const allTweets = tweets?.tweets?.flatMap((entry) =>
    entry.tweets.map((tweet) => ({
      cashtags: tweet.cashtags,
      text: tweet.text,
      createdAt: tweet.createdAt,
      username: tweet.username,
      tweetId: tweet.tweetId,
      qualityScore: tweet.qualityScore
    }))
  );

  useEffect(() => {
    setData(allTweets);
    setFilteredData(allTweets);
  }, []);
  


  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string | null) => {
    // Set the filter
    setFilters((prev) => ({ ...prev, [key]: value }));
  
    let filtered = [...allTweets]; // Start with all tweets
  
    // Apply the selected filter condition
    if (key === 'username') {
      console.log(value)
      filtered = allTweets.filter((tweet) =>
        value === 'All' || tweet.username === value
      );
    } else if (key === 'date') {
      filtered = allTweets.filter((tweet) =>
        !value || dayjs(tweet.createdAt).isSame(value, 'day')
      );
    } else if (key === 'cashtag') {
      filtered = allTweets.filter((tweet) =>
        !value || tweet.cashtags.some((tag) => tag.toLowerCase().includes(value.toLowerCase()))
      );
    }
  
    // Update the filtered data
    setFilteredData(filtered);
  };
  

  // Get unique usernames for the username filter dropdown
  const uniqueUsernames:string[] = [...new Set(allTweets?.map((tweet :any) => tweet.username))];

  return (
    <>
      <div className="px-5 py-2">
        <Flex gap={100}>
          <div>
            <Space size={20}>
              <div>
                <h1 className="font-semibold text-sm">Date</h1>
                <DatePicker
                  onChange={(date) => handleFilterChange('date', date ? date.toISOString() : null)}
                />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Username</h1>
                <Select
                  defaultValue="All"
                  onChange={(value) => handleFilterChange('username', value)}
                  style={{ width: 200 }}
                >
                  <Select.Option value="All">All</Select.Option>
                  {uniqueUsernames?.map((username) => (
                    <Select.Option key={username} value={username}>
                      {username}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div>
                <h1 className="font-semibold text-sm">Cashtag</h1>
                <Flex gap={2}>
                  <Input
                    placeholder="Search cashtag"
                    onChange={(e) => handleFilterChange('cashtag', e.target.value)}
                  />
                </Flex>
              </div>
            </Space>
          </div>
        </Flex>
        <div className="mt-2">
          <CustomTable tweets={filteredData} />
        </div>
      </div>
    </>
  );
}

export async function loader() {
  const res = await getRawTweets();
  return res;
}
