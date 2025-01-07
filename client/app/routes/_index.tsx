import type { MetaFunction } from '@remix-run/node';
import {useState } from 'react';
import { getTweets, TwitterResponse } from '~/common/api.request';
import { Spin, message, Input, Button, Flex, Select, Space} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import OptionSelector from '~/components/ui/OptionSelector';
import OriginalTweets from '~/components/OriginalTweets';
import FilteredTweets from '~/components/FilteredTweets';
import ResearchReport from '~/components/ResearchReport';
import Empty from '~/components/Empty';

export const meta: MetaFunction = () => {
  return [
    { title: 'Twitter Scrapper' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export default function Index() {
  const [username, setUsername] = useState<string>("");
  const [cashtag, setCashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(["Original Tweets", "Filtered Tweets", "Research Report"])
  const [selectedOption, setSelectedOption] = useState("Original Tweets")
  const [result, setResult] = useState<TwitterResponse>();

  const handleSubmit = async () => {
    if (!cashtag.trim()) {
      message.error('Please enter both usernames and a cashtag.');
      return;
    }
    setLoading(true);
    try {
      const data = await getTweets(cashtag);
      if(data){
        setResult(data);
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      message.error('Failed to fetch tweets');
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className='px-5 py-4'>
      <div className='font-bold text-2xl'>Tweet Analysis</div>
      <Flex gap={20} className='mt-10'>
      <Space size='large' direction='vertical' className=" flex-[0.2] border-[1px] px-5 py-3 rounded-md bg-gray-50">
        <h1 className="font-semibold text-xl ">Get Analysis</h1>
        {/* <div>
          <h5 className='text-sm font-semibold'>Select User</h5>
          <Select
            allowClear
            placeholder="Select User"
            style={{ width: 180 }}
            onChange={handleChange}
            options={[
              { value: "pakpakchicken", label: "pakpakchicken" },
              { value: "fundstrat", label: "fundstrat" },
              { value: "BourbonCap", label: "BourbonCap" },
              { value: "ripster47", label: "ripster47" },
              { value: "Micro2Macr0", label: "Micro2Macr0" },
              { value: "LogicalThesis", label: "LogicalThesis" },
              { value: "RichardMoglen", label: "RichardMoglen" },
              { value: "Couch_Investor", label: "Couch_Investor" },
              { value: "StockMarketNerd", label: "StockMarketNerd" },
              { value: "MCins_", label: "MCins_" },
              { value: "unusual_whales", label: "unusual_whales" }
            ]}
            />
        </div> */}

        <div>
          <h5 className='text-sm font-semibold'>Cashtag</h5>
          <Input placeholder='Enter Cashtag ex:- $Uber' value={cashtag} onChange={e => setCashtag(e.target.value)} />
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
      {loading ?
    <Flex justify='center' align='center' className='w-full h-[calc(100vh-104px)] bg-gray-50 rounded-md'>
       <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    </Flex> :  
    
        result ? (

          <div className='w-full flex-[0.8] bg-gray-50 px-5 py-3 rounded-md border-[1px]'>
      <div className='mb-5'>
        <OptionSelector options={options} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      </div>
      <div className=' h-[calc(100vh-188px)] overflow-y-auto' style={{scrollbarWidth:"thin"}}>
      {
        selectedOption == "Original Tweets"
        ? <OriginalTweets result={result?.rawTweets} />
        : selectedOption == "Filtered Tweets"
        ? <FilteredTweets result={result?.tweets} />
        : <ResearchReport result={result?.report}/>
      }
      </div>
    </div>
      )
      
      :
      <Empty/>

      }
          </Flex>
      </div>

  );
}



