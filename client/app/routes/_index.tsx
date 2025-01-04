import type { MetaFunction } from '@remix-run/node';
import { useState } from 'react';
import { getTweets, TwitterResponse } from '~/common/api.request';
import { Tabs, Spin, message, Input, Button, Flex } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import Header from '~/components/Header';

export const meta: MetaFunction = () => {
  return [
    { title: 'Twitter Scrapper' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export default function Index() {
  const [username, setUsername] = useState('');
  const [cashtag, setCashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TwitterResponse | null>(null);
  const [activeTab, setActiveTab] = useState('tweets');

  const handleSubmit = async () => {
    if (!username || !cashtag) {
      message.error('Please enter both username and cashtag');
      return;
    }

    setLoading(true);
    try {
      const data = await getTweets(username, cashtag);
      setResult(data);
      setActiveTab('tweets');
    } catch (error) {
      message.error('Failed to fetch tweets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Flex className="px-10 h-[calc(100vh-48px)]">
        <div className="mt-10 mb-5 flex-[0.3]">
          <div>
            <h1 className="mb-3 font-semibold">Enter Twitter Username</h1>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mt-10">
            <h1 className="mb-3 font-semibold">Enter Cashtag</h1>
            <Input
              value={cashtag}
              onChange={(e) => setCashtag(e.target.value)}
            />
          </div>
          <Button
            className="w-full mt-10"
            type="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Spin /> : 'Analyze Tweets'}
          </Button>
        </div>

        <div className="flex-[0.7] p-10">
          {loading ? (
            <Flex justify="center" align="center" className="h-full">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </Flex>
          ) : result ? (
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'tweets',
                  label: 'Tweets',
                  children: (
                    <div className="overflow-y-auto max-h-[70vh]">
                      {result?.tweets?.map((tweet, index) => (
                        <div key={index} className="my-2 p-2 bg-gray-50 rounded">
                          {tweet}
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  key: 'report',
                  label: 'Analysis Report',
                  children: (
                    <div className="prose max-w-full overflow-y-auto max-h-[70vh]">
                      <ReactMarkdown>{result.report}</ReactMarkdown>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <Flex justify="center" align="center" className="h-full">
              <h1 className="font-semibold text-lg">No Data...</h1>
            </Flex>
          )}
        </div>
      </Flex>
    </>
  );
}
