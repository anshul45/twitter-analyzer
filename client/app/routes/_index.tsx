import type { MetaFunction } from '@remix-run/node';
import { useState } from 'react';
import { getTweets, TwitterResponse } from '~/common/api.request';
import { Spin, message, Input, Button, Flex, Select,Space,DatePicker } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import OptionSelector from '~/components/ui/OptionSelector';
import OriginalTweets from '~/components/OriginalTweets';
import FilteredTweets from '~/components/FilteredTweets';
import ResearchReport from '~/components/ResearchReport';

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
  const [options,setOptions] = useState(["Original Tweets","Filtered Tweets","Research Report"])
  const [selectedOption,setSelectedOption] = useState("Original Tweets")

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
    <div className='px-5 py-4'>
      <div className='font-bold text-2xl'>Tweet Analysis</div>
      <Flex className="mt-5" gap={30}>
        <Space size='large' direction='vertical' className=" flex-[0.3] border-[1px] px-5 py-3 rounded-md">
            <h1 className="font-semibold text-xl ">Submit Analysis</h1>
            <div>
            <h5 className='text-sm font-semibold'>Usernames</h5>
            <Input.TextArea rows={3} placeholder='Enter usernames (one per line) ex:- user1,user2,user3 etc.'/>
            </div>
          
            <div>
            <h5 className='text-sm font-semibold'>Cashtag</h5>
            <Input.TextArea rows={3} placeholder='Enter Cashtag ex:- $Uber'/>
            </div>
          <Button
            className="w-full"
            type="primary"
            variant='solid'
            color='default'
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Spin /> : 'Analyze Tweets'}
          </Button>
        </Space>

        <div className="flex-[0.7]">
          {false ? (
            <Flex justify="center" align="center" className="h-full">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </Flex>
          ) :(
           <div className='border-[1px] h-full rounded-md px-5 py-3'>
             <h1 className="font-semibold text-xl mb-5">Filters</h1>
             <Flex gap={50}>
             <div>
            <h5 className='text-sm font-semibold'>Filter By Date</h5>
            <DatePicker  />
            </div>
            <div className='w-full'>
            <h5 className='text-sm font-semibold'>Filter By Username</h5>
            <Select
            placeholder="Select user"
            options={[
      {
        value: 'jack',
        label: 'Jack',
      },
      {
        value: 'lucy',
        label: 'Lucy',
      },
      {
        value: 'tom',
        label: 'Tom',
      },
    ]}/>
            </div>
             </Flex>
           </div>
          ) 
        } 
        </div>
      </Flex>
      <div className='my-5'>
      <OptionSelector options={options} selectedOption={selectedOption} setSelectedOption={setSelectedOption}/>
      </div>
      {
        selectedOption == "Original Tweets" 
        ? <OriginalTweets/> 
        :  selectedOption == "Filtered Tweets" 
        ? <FilteredTweets/>
        :<ResearchReport/>
      }
    </div>
    
  );
}



