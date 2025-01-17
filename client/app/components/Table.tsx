import React from 'react';
import { Button, Flex, Popover, Table, Tag } from 'antd';
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
    width: 100,
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 140,
  },
  {
    title: 'Tweet',
    dataIndex: 'text',
    key: 'text',
    render:(tweet) =>
    <Popover content={<div style={{ background: '#f8fafc', borderRadius:"10px", padding: '10px'}}>{tweet}</div>}  trigger="click" overlayStyle={{ width: 700, backgroundColor:"white", }}>
     <div className='cursor-pointer text-blue-500 hover:text-blue-300'>
    {tweet.slice(0,90)}{tweet.length>100 ? "...":null}
     </div>
  </Popover>,
    width: 380,
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
    width: 150,
  },
  {
    title: 'Tweet Url',
    key: 'tweetUrl',
    dataIndex: 'tweetUrl',
    render: (url) => <a href={url} target="_blank" rel="noopener noreferrer">View Tweet</a>,
    width: 110,
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
    width: 130,
  },
  {
    title: 'Tweet Type',
    dataIndex: 'type',
    key: 'type',
    render: (type) => <Tag color={type === 'retweet' ? 'green' : 'blue'}>{type}</Tag>,
    width: 130,
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
    id:string
  }[];
}

const App: React.FC<AppProps> = ({ tweets }) => {
  // Transform tweets into DataType for the table
  const data: DataType[] = tweets.map((tweet) => ({
    key: tweet.id,
    username: tweet.username,
    text: tweet.text,
    createdAt: tweet.createdAt,
    cashtags: tweet.cashtags,
    tweetUrl: `https://x.com/${tweet.username}/status/${tweet.tweetId}`,
    type: tweet.type,
    qualityScore: tweet.qualityScore,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width:'100%', height: '100%', overflow: 'hidden' }}>
      <Table<DataType> 
        columns={columns} 
        dataSource={data} 
        scroll={{ x: 'max-content', y: 'calc(100vh - 254px)' }}
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
