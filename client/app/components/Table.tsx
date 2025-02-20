import React from 'react';
import { Flex, Popover, Table, Tag, message } from 'antd';
import type { TableProps } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface DataType {
  key: string;
  username: string;
  text: string;
  date: string;
  cashtags: string[];
  tweetUrl: string;
  type: string;
  qualityScore?: number;
  retweet: boolean;
  quote: boolean;
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    render: (text) => <a>{text}</a>,
    width: 100,
  },
  {
    title: 'Created At',
    dataIndex: 'date',
    key: 'createdAt',
    width: 110,
    render: (date) => <div>{date.slice(0, 10)}</div>
  },
  {
    title: 'Tweet',
    dataIndex: 'text',
    key: 'text',
    render: (tweet) =>
      <Popover content={<div style={{ background: '#f8fafc', borderRadius: "10px", padding: '10px' }}>{tweet}</div>} trigger="click" overlayStyle={{ width: 700, backgroundColor: "white", }}>
        <div className={"cursor-pointer"}>
          {tweet.slice(0, 250)}{tweet.length > 250 ? " ..." : null}
        </div>
      </Popover>,
    width: 430,
  },
  {
    title: 'Cashtags',
    key: 'cashtags',
    dataIndex: 'cashtags',
    render: (_, { cashtags }) => (
      <>
        {cashtags.map((tag) => (
          <Tag className='my-0.5' color="geekblue" key={tag}>
            {tag.toUpperCase()}
          </Tag>
        ))}
      </>
    ),
    width: 160,
  },
  {
    title: 'Tweet Url',
    key: 'tweetUrl',
    dataIndex: 'tweetUrl',
    render: (url) => <a href={url} className='text-blue-500' target="_blank" rel="noopener noreferrer">View Tweet</a>,
    width: 104,
  },
  {
    title: 'Quality Score',
    key: 'qualityScore',
    dataIndex: 'qualityScore',
    render: (score) => (
      <Flex justify='center'>
        <span style={{
          color: score ? (score > 7 ? 'green' : score > 4 ? 'orange' : 'red') : 'gray',
          fontWeight: 'bold',
        }}>
          {score ? score : 'N/A'}
        </span>
      </Flex>
    ),
    width: 122,
  },
  {
    title: 'Tweet Type',
    dataIndex: 'type',
    key: 'type',
    render: (type) => <Tag color={type === 'retweet' ? 'green' : 'blue'}>{type}</Tag>,
    width: 120,
  },
];

interface AppProps {
  tweets: {
    username: string;
    text: string;
    date: string;
    cashtags: string[];
    tweetId: string;
    type: string;
    qualityScore?: number;
    id: string
    retweet: boolean,
    quote: boolean
  }[];
  loadMoreTweets: any
}

const App: React.FC<AppProps> = ({ tweets, loadMoreTweets }) => {

  const [messageApi, contextHolder] = message.useMessage();
  const key = 'load-more';

  // Transform tweets into DataType for the table
  const data: DataType[] = tweets.map((tweet) => ({
    key: tweet.id,
    username: tweet.username,
    text: tweet.text,
    date: tweet.date,
    cashtags: tweet.cashtags,
    tweetUrl: `https://x.com/${tweet.username}/status/${tweet.tweetId}`,
    type: tweet.type,
    qualityScore: tweet.qualityScore,
    quote: tweet.quote,
    retweet: tweet.retweet
  }));

  const queryClient = useQueryClient();

  const { data: lastPage = 200, refetch, isLoading } = useQuery<number, Error>({
    queryKey: ['lastPage'],
    queryFn: () => Promise.resolve(200),
    initialData: 200,
    staleTime: 20 * 60 * 1000,
  });

  const handleTableChange = (pagination: any) => {
    const currentPage = pagination.current;

    if (currentPage === lastPage) {
      messageApi.open({
        key,
        type: 'loading',
        content: 'Loading more tweets please wait...',
        duration:1
      });

      loadMoreTweets(currentPage)
      queryClient.setQueryData(['lastPage'], lastPage + 200);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
      {contextHolder}
      <Table<DataType>
        columns={columns}
        dataSource={data}
        scroll={{ x: 'max-content', y: 'calc(100vh - 254px)' }}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 15,
          showSizeChanger: false
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default App;
