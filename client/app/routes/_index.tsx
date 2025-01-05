import type { MetaFunction } from '@remix-run/node';
import { useState } from 'react';
import { getTweets, TwitterResponse } from '~/common/api.request';
import { Tabs, Spin, message, Input, Button, Flex, Select, SelectProps, InputRef, Divider, Space, Tag } from 'antd';
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
  const [usernames, setUsernames] = useState<string[]>([]);
  const [cashtag, setCashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TwitterResponse | null>(null);
  const [activeTab, setActiveTab] = useState('tweets');

  const handleSubmit = async () => {
    if (!usernames.length || !cashtag) {
      message.error('Please enter both username and cashtag');
      return;
    }

    setLoading(true);
    try {
      const data = await getTweets(usernames, cashtag);
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
            <Selector usernames={usernames} setUsernames={setUsernames}/>
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
                      {result.tweets.map((tweet, index) => (
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



const Selector: React.FC<SelectorProps> = ({usernames,setUsernames}:any) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleAddItem = () => {
    if (inputValue.trim() && !usernames.includes(inputValue.trim())) {
      const newItems = inputValue.split(",")
      .map((item) => item.trim())
      .filter(item => item && !usernames.includes(item));
      setUsernames([...usernames, ...newItems]);
      setInputValue("");
    }
  };

  const handleRemoveItem = (item: string) => {
    setUsernames(usernames.filter((i : string) => i !== item));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginTop: 16 }}>
        {usernames.map((item:string) => (
          <Tag
            bordered={false}
            color="processing"
            key={item}
            closable
            onClose={() => handleRemoveItem(item)}
            style={{ marginBottom: 8 }}
          >
            {item}
          </Tag>
        ))}
      </div>
      <Space.Compact style={{ width: "100%" }}>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Add an item"
          onPressEnter={handleAddItem}
        />
        <Button type="primary" onClick={handleAddItem}>
          Add
        </Button>
      </Space.Compact>
    </div>
  );
};


interface SelectorProps{
  usernames:string[],
  setUsernames:React.Dispatch<React.SetStateAction<string[]>>
}