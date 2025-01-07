import React from 'react';
import { Table, Tag } from 'antd';
import type { TableProps } from 'antd';

interface DataType {
  key: string;
  username: string;
  text: string;
  createdAt: string;
  cashtags: string[];
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
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
];

interface AppProps {
  tweets: {
    username: string;
    text: string;
    createdAt: string;
    cashtags: string[];
    tweetId: string;
  }[];
}

const App: React.FC<AppProps> = ({ tweets }) => {
  // Transform tweets into DataType for the table
  const data: DataType[] = tweets.map((tweet, index) => ({
    key: tweet.tweetId,
    username: tweet.username,
    text: tweet.text,
    createdAt: tweet.createdAt,
    cashtags: tweet.cashtags,
  }));

  return <Table<DataType> scroll={{ y: 297 }} columns={columns} dataSource={data} />;
};

export default App;
