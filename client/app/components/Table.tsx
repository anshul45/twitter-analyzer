import React from 'react';
import { Table, Tag } from 'antd';
import type { TableProps } from 'antd';

interface DataType {
  key: string;
  username: string;
  text: string;
  createdAt: string;
  cashtags: string[];
  tweetUrl: string;
  type: string;
  qualityScore?: number;
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Tweet',
    dataIndex: 'text',
    key: 'text',
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
  },
  {
    title: 'Cashtags',
    key: 'cashtags',
    dataIndex: 'cashtags',
    render: (_, { cashtags }) => (
      <>
        {cashtags.map((tag) => (
          <Tag color="geekblue" key={tag}>
            {tag.toUpperCase()}
          </Tag>
        ))}
      </>
    ),
  },
  {
    title: 'Tweet Url',
    key: 'tweetUrl',
    dataIndex: 'tweetUrl',
    render: (url) => <a href={url} target="_blank" rel="noopener noreferrer">View Tweet</a>,
  },
  {
    title: 'Quality Score',
    key: 'qualityScore',
    dataIndex: 'qualityScore',
    render: (score) => (
      <span style={{ 
        color: score ? (score > 0.7 ? 'green' : score > 0.4 ? 'orange' : 'red') : 'gray',
        fontWeight: 'bold'
      }}>
        {score ? score : 'N/A'}
      </span>
    ),
  },
  {
    title: 'Tweet Type',
    dataIndex: 'type',
    key: 'type',
    render: (type) => <Tag color={type === 'retweet' ? 'green' : 'blue'}>{type}</Tag>,
  },
];

interface AppProps {
  tweets: {
    username: string;
    text: string;
    createdAt: string;
    cashtags: string[];
    tweetId: string;
    type: string;
    qualityScore?: number;
  }[];
}

const App: React.FC<AppProps> = ({ tweets }) => {
  // Transform tweets into DataType for the table
  const data: DataType[] = tweets.map((tweet) => ({
    key: tweet.tweetId,
    username: tweet.username,
    text: tweet.text,
    createdAt: tweet.createdAt,
    cashtags: tweet.cashtags,
    tweetUrl: `https://x.com/${tweet.username}/status/${tweet.tweetId}`,
    type: tweet.type,
    qualityScore: tweet.qualityScore,
  }));

  console.log('tweets:', tweets);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Table<DataType> 
        style={{ flexGrow: 1 }}
        columns={columns} 
        dataSource={data} 
        scroll={{ y: 'calc(100vh - 254px)' }}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 15,
          showSizeChanger: false
        }}
      />
    </div>
  );
};

export default App;
