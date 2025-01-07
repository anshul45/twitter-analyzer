import { MetaFunction } from '@remix-run/node';
import { useState } from 'react';
import { getTweets } from '~/common/api.request';
import { Input, Flex, Select, Space, DatePicker, Button, message, Drawer } from 'antd';
import CustomTable from '~/components/Table';
import ReportDrawer from '~/components/ReportDrawer';
import dayjs from 'dayjs';

export const meta: MetaFunction = () => {
  return [
    { title: 'Twitter Scrapper' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export default function Index() {
  const [cashtag, setCashtag] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    date: null,
    username: 'All',
    cashtag: '',
  });

  const handleSubmit = async (date: string, cashtag: string) => {
    const response = await getTweets(cashtag, date);
    setData(response.tweets[0].tweets);
    setFilteredData(response.tweets[0].tweets); // Initialize filtered data with all tweets
  };

  const handleClick = () => {
    if (!cashtag) {
      message.error("Please enter a cashtag.");
      return;
    }
    handleSubmit('', cashtag);
  };

  const handleReportClick = () => {
    if (!cashtag) {
      message.error("Please enter a cashtag.");
      return;
    }
    setOpen(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    // Set the filter
    setFilters((prev) => ({ ...prev, [key]: value }));

    let filtered = [...data]; // Start with all tweets

    // Apply the selected filter condition
    if (key === 'username') {
      filtered = data.filter((tweet) =>
        value === 'All' || tweet.username === value
      );
    } else if (key === 'date') {
      filtered = data.filter((tweet) =>
        !value || dayjs(tweet.createdAt).isSame(value, 'day')
      );
    } else if (key === 'cashtag') {
      filtered = data.filter((tweet) =>
        !value || tweet.cashtags.some((tag) => tag.toLowerCase().includes(value.toLowerCase()))
      );
    }

    // Update the filtered data
    setFilteredData(filtered); // Set the filtered data
  };

  const uniqueUsernames = [...new Set(data?.map((tweet) => tweet.username))];

  return (
    <>
      <div className="px-5 py-2">
        <Flex gap={100}>
          <div>
            <div className="font-bold text-2xl mb-2">Get Tweets</div>
            <Space size={20}>
              <div>
                <h1 className="font-semibold text-sm">Date</h1>
                <DatePicker
                  onChange={(date) => {
                    if (date) {
                      const formattedDate = dayjs(date).format('ddd MMM DD YYYY');
                      handleSubmit(formattedDate, '');
                    }
                  }}
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
                  {uniqueUsernames.map((username) => (
                    <Select.Option key={username} value={username}>
                      {username}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div>
                <h1 className="font-semibold text-sm">Cashtag</h1>
                <Flex gap={2}>
                  <Input
                    placeholder="Search cashtag"
                    value={cashtag}
                    onChange={(e) => setCashtag(e.target.value)}
                  />
                  <Button onClick={handleClick}>Search</Button>
                </Flex>
              </div>
              <div>
                <h1 className="font-semibold text-sm">Get Report</h1>
                <Flex gap={2}>
                  <Button onClick={handleReportClick}>Get Report</Button>
                </Flex>
              </div>
            </Space>
          </div>
        </Flex>
        <div className="mt-2">
          <CustomTable tweets={filteredData} />
        </div>
      </div>
      <ReportDrawer open={open} cashtag={cashtag} setOpen={setOpen} />
    </>
  );
}
