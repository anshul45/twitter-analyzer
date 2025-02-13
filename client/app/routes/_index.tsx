/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import { MetaFunction } from '@remix-run/node';
import { useEffect, useMemo, useState } from 'react';
import { getRawTweets, getSummary } from '~/common/api.request';
import { Input, Flex, Select, Space, DatePicker, Button, Modal, Spin, Drawer } from 'antd';
import CustomTable from '~/components/Table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Tweet {
  cashtags: string[];
  text: string;
  createdAt: string;
  date: string;
  username: string;
  tweetId: string;
  qualityScore: number;
  type: string;
  id: string;
  retweet: boolean;
  quote: boolean;
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
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Tweet[]>([]);
  const [filteredData, setFilteredData] = useState<Tweet[]>([]);
  const [openSummaryModal, setOpenSummaryModal] = useState<boolean>(false);
  const [summaryText, setSummaryText] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    date: null,
    username: 'All',
    cashtag: '',
    type: 'All',
  });

  const size = 15; 
  const queryClient = useQueryClient();

  // Fetch initial tweets
  const { data: tweets = [], isLoading: isLoadingTweets, error } = useQuery<Tweet[], Error>({
    queryKey: ['tweets'],
    queryFn: async () => {
      const skip = 0;
      return getRawTweets(skip, 150);
    },
    staleTime: 20 * 60 * 1000, 
  });

  // Load more tweets using mutation
  const loadMoreMutation = useMutation({
    mutationFn: async ({ skip, take }: { skip: number; take: number }) => {
      return getRawTweets(skip, take);
    },
    onSuccess: (newTweets) => {
      queryClient.setQueryData<Tweet[]>(['tweets'], (oldTweets = []) => [
        ...oldTweets,
        ...newTweets,
      ]);

      setData((prevData) => [...prevData, ...newTweets]);
      setFilteredData((prevFilteredData) => [...prevFilteredData, ...newTweets]);
    },
  });

  const handleLoadMore = (page:number) => {
 
    const skip = page * size + 1;

    loadMoreMutation.mutate(
      { skip, take: skip + 150 },
      {
        onSuccess: () => {
          console.log('More data loaded successfully');
        },
      }
    );
  };

  const sortedTweets = useMemo(() => {
    return tweets.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));
  }, [tweets]);

  useEffect(() => {
    setData(sortedTweets);
    setFilteredData(sortedTweets);
  }, [sortedTweets]);

  dayjs.extend(utc);
  const isFilterChanged = useMemo(() => {
    return JSON.stringify(filteredData) !== JSON.stringify(data);
  }, [filteredData, data]);

  const handleFilterChange = (key: keyof Filters, value: string | null) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [key]: value };

      const filtered = sortedTweets.filter((tweet) => {
        const matchesDate =
          !updatedFilters.date ||
          dayjs(tweet.date).utc().startOf('day').isSame(
            dayjs(updatedFilters.date).utc().startOf('day')
          );
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

      const generateTitle = () => {
        const parts: string[] = [];

        if (updatedFilters.username && updatedFilters.username !== 'All') {
          parts.push(`Tweets by @${updatedFilters.username}`);
        }
        if (updatedFilters.cashtag) {
          parts.push(`about ${updatedFilters.cashtag.toUpperCase()}`);
        }
        if (updatedFilters.date) {
          parts.push(`on ${dayjs(updatedFilters.date).format('MMM D')}`);
        }
        if (updatedFilters.type && updatedFilters.type !== 'All') {
          parts.push(`(${updatedFilters.type})`);
        }

        // Combine parts and return a default if no filters are active
        return parts.length > 0 ? parts.join(' ') : 'Viewing All Tweets';
      };

      setTitle(generateTitle());
      setFilteredData(filtered);

      return updatedFilters;
    });
  };

  const handleSummary = async () => {
    setOpenSummaryModal(true);
    setIsLoadingSummary(true);
    try {
      const result = await getSummary(filteredData, title);
      setSummaryText(result);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummaryText('Failed to load summary. Please try again.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const uniqueUsernames = useMemo(() => {
    return [...new Set(sortedTweets.map((tweet) => tweet.username))];
  }, [sortedTweets]);

  const uniqueTypes = useMemo(() => {
    return [...new Set(sortedTweets.map((tweet) => tweet.type))];
  }, [sortedTweets]);

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
                <Button type="primary" disabled={!isFilterChanged} onClick={handleSummary}>
                  Get Summary
                </Button>
              </div>
            </Space>
          </div>
        </Flex>
        <div className="mt-2">
          {isLoadingTweets || !tweets.length ? (
            <Flex justify="center" align="center" className="h-96">
              <Spin size="large" />
            </Flex>
          ) : (
            filteredData.length ? (
              <CustomTable tweets={filteredData} loadMoreTweets={handleLoadMore} />
            ) : null
          )}
        </div>
      </div>

      <Drawer
        width={700}
        onClose={() => setOpenSummaryModal(false)}
        open={openSummaryModal}
        styles={{
          body: {
            padding: '24px',
            background: '#f8fafc',
          },
        }}
      >
        <Flex justify="center" className="p-4" align="center">
          {isLoadingSummary ? (
            <Spin className="mt-64" />
          ) : (
            <div className=" bg-white p-6 rounded-lg shadow">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{summaryText}</ReactMarkdown>
            </div>
          )}
        </Flex>
      </Drawer>
    </>
  );
}
