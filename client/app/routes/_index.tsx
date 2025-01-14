/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import { MetaFunction } from '@remix-run/node';
import { useEffect, useState } from 'react';
import { getRawTweets, getSummary } from '~/common/api.request';
import { Input, Flex, Select, Space, DatePicker, Button, Modal,Spin } from 'antd';
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
  type: string;
  id: string;
}

interface Filters {
  date: string | null;
  username: string;
  cashtag: string;
  type: string;
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
  const [openSummaryModal, setOpenSummaryModal] = useState<boolean>(false)
  const [summaryText, setSummaryText] = useState<string>("")
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false)
  const [username, setUsername] = useState<string>("")
  const [cashtag, setCashtag] = useState<string>("")
  const [filters, setFilters] = useState({
    date: null,
    username: 'All', 
    cashtag: '',
    type: 'All',
  });
  
  const [isFilterChanged, setIsFilterChanged] = useState(false);

  const tweets =  useLoaderData<{ tweets: { tweets: Tweet[] }[] }>();

  const allTweets = tweets?.tweets?.flatMap((entry) =>
    entry.tweets.map((tweet) => ({
      cashtags: tweet.cashtags,
      text: tweet.text,
      createdAt: tweet.createdAt,
      username: tweet.username,
      tweetId: tweet.tweetId,
      qualityScore: tweet.qualityScore,
      type: tweet.type,
      id:tweet.id
    }))
  );

  console.log(tweets?.tweets.slice(0,10))

  const deduplicatedTweets = allTweets.filter(tweets => tweets.tweetId === "1878940088949788984")

  console.log(deduplicatedTweets)

  const sortedTweets = allTweets.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

  useEffect(() => {
    setData(sortedTweets);
    setFilteredData(sortedTweets);
  }, []);
  
 useEffect(() => {
    setIsFilterChanged(JSON.stringify(filteredData) !== JSON.stringify(data));
  }, [filteredData, data]);

  const handleFilterChange = (key: keyof Filters, value: string | null) => {
    // Update the filter state
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [key]: value };
  
      const filtered = sortedTweets.filter((tweet) => {
        const matchesDate =
          !updatedFilters.date || dayjs(tweet.createdAt).isSame(updatedFilters.date, 'day');
        const matchesUsername =
          updatedFilters.username === 'All' || tweet.username === updatedFilters.username;
        const matchesCashtag =
          !updatedFilters.cashtag ||
          tweet.cashtags.some((tag) =>
            tag.toLowerCase().includes(updatedFilters.cashtag.toLowerCase())
          );
        const matchesType =
          updatedFilters.type === 'All' || tweet.type === updatedFilters.type;
  
        return matchesDate && matchesUsername && matchesCashtag && matchesType;
      });
  
   
      setFilteredData(filtered);
  
      return updatedFilters; 
    });
  };


  

  const handleSummary = async () => {
    setOpenSummaryModal(true)
    setIsLoadingSummary(true)
    try {
      const result = await getSummary(filteredData);
      setSummaryText(result);
    } catch (error) {
      console.error('Error fetching summary:', error)
      setSummaryText('Failed to load summary. Please try again.')
    } finally {
      setIsLoadingSummary(false)
    }
  }

  

  // Get unique usernames for the username filter dropdown
  const uniqueUsernames:string[] = [...new Set(sortedTweets?.map((tweet :any) => tweet.username))];
  const uniqueTypes:string[] = [...new Set(sortedTweets?.map((tweet :any) => tweet.type))];

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
                  <Input
                    placeholder="Search cashtag"
                    onChange={(e) => handleFilterChange('cashtag', e.target.value)}
                  />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Type</h1>
                <Select
                  defaultValue="All"
                  onChange={(value) => handleFilterChange('type', value)}
                  style={{ width: 200 }}
                >
                  <Select.Option value="All">All</Select.Option>
                  {uniqueTypes?.map((type) => (
                    <Select.Option key={type} value={type}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div>
                <h1 className="font-semibold text-sm">Summarize</h1>
                 <Button type='primary' disabled={!isFilterChanged} onClick={handleSummary}>Get Summary</Button>
              </div>
            </Space>
          </div>
        </Flex>
        <div className="mt-2">
          <CustomTable tweets={filteredData} />
        </div>
      </div>
      <Modal 
        width={800} 
        open={openSummaryModal} 
        onCancel={() => setOpenSummaryModal(false)} 
        footer={<Button onClick={() => setOpenSummaryModal(false)}>Close</Button>}
      >
        <Flex justify='center' className='h-[60vh] p-4' align='center'>
          {isLoadingSummary ? (
            <Spin />
          ) : (
            <div className="whitespace-pre-wrap">{summaryText}</div>
          )}
        </Flex>
      </Modal>
    </>
  );
}

export async function loader() {
  const res = await getRawTweets();
  return res;
}
