/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { Table, Spin, Flex, Button, Drawer } from 'antd';
import { useEffect, useState } from 'react';
import { getCashtags, getSummaryForCashtag,getCashtagTweets } from '~/common/api.request';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const analysis = () => {
  const [cashtags, setCashtags] = useState<any[]>([]);
  const [tableData, setTableData] = useState<{ tableData: any[]; columns: any[] } | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCashtag, setSelectedCashtag] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingcashtag, setIsLoadingcashtag] = useState<boolean>(false);
  const [summaryText, setSummaryText] = useState<string>('');
  const [cashtagTweets, setCashtagTweets] = useState<any[]>();
  const [showTweets,setShowTweets] = useState<boolean>(false);
  const [tweetText,setTweetText]=useState<string>("")

  const getData = async () => {
    try {
      setIsLoadingcashtag(true);
      const data = await getCashtags();
      const tweets = await getCashtagTweets();
      setCashtagTweets(tweets);
      setCashtags([data]);
    } catch (error) {
      console.error('Error fetching cashtags:', error);
    } finally {
      setIsLoadingcashtag(false);
    }
  };

  const handleClick = async (cashtag: string) => {
    setSelectedCashtag(cashtag);
    setOpen(true);
    setLoading(true);
    try {
      const result = await getSummaryForCashtag(cashtag);
      setSummaryText(result);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummaryText('Failed to load summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allData: any[], cashtag: string) => {
    const groupedData = allData.reduce((acc, item) => {
      if (item.cashtag === cashtag) {
        const key = `${item.cashtag}-${item.date}`;
        if (!acc[key]) {
          acc[key] = { ...item, count: item.count || 0 };
        } else {
          acc[key].count += item.count || 0;
        }
      }
      return acc;
    }, {});
  
    const counts = Object.values(groupedData).map((item: any) => item.count);
  
    const avg = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const stdDev = Math.sqrt(
      counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length
    );
  
    return { avg, stdDev };
  };
  

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  const generateTableData = (data: any[], allData: any[]): { tableData: any[]; columns: any[] } => {
    const uniqueDates = Array.from(new Set(data?.map((item) => item.date)))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Map cashtags to their tweets
    const cashtagTweetMap: Record<string, string> = (cashtagTweets || []).reduce(
      (acc, tweet) => {
        (tweet.cashtags || []).forEach((cashtag: string) => {
          acc[cashtag] = acc[cashtag]
            ? `${acc[cashtag]} https://x.com/${tweet.username}/status/${tweet.tweetId}`
            :`https://x.com/${tweet.username}/status/${tweet.tweetId}`;
        });
        return acc;
      },
      {}
    );

    // Group data by cashtag and map counts to dates
    const groupedData: Record<
      string,
      { cashtag: string; dateCounts: Record<string, number>; avg: number; stdDev: number; tweets: string }
    > = data.reduce((acc, item) => {
      const { cashtag, date, count } = item;

      if (!acc[cashtag]) {
        const stats = calculateStats(allData, cashtag);
        acc[cashtag] = {
          cashtag,
          dateCounts: {},
          avg: stats.avg,
          stdDev: stats.stdDev,
          tweets: cashtagTweetMap[cashtag] || 'No tweets',
        };
      }

      acc[cashtag].dateCounts[date] = (acc[cashtag].dateCounts[date] || 0) + (count || 0);

      return acc;
    }, {});

    // Prepare table data
    const tableData = Object.values(groupedData)?.map((entry) => {
      const { cashtag, dateCounts, avg, stdDev, tweets } = entry;

      return {
        cashtag,
        avg: avg.toFixed(2),
        std_dev: stdDev.toFixed(2),
        tweets,
        ...uniqueDates.reduce((acc, date) => {
          acc[date] = dateCounts[date] || 0;
          return acc;
        }, {}),
      };
    });

    const columns = [
      {
        title: 'Cashtag',
        dataIndex: 'cashtag',
        key: 'cashtag',
        fixed: 'left',
        width: 100,
      },
      ...uniqueDates?.map((date) => ({
        title: formatDate(date),
        dataIndex: date,
        key: date,
        width: 100,
        sorter: (a: any, b: any) => a[date] - b[date],
      })),
      {
        title: 'Avg',
        dataIndex: 'avg',
        key: 'avg',
        width: 100,
      },
      {
        title: 'Std Dev',
        dataIndex: 'std_dev',
        key: 'std_dev',
        width: 100,
      },
      {
        title: 'Tweets',
        dataIndex: 'tweets',
        key: 'tweets',
        render: (tweets:any) => (
          <Button disabled={tweets === "No tweets"} type="link" onClick={() => handleShowTweets(tweets)}>{tweets == "No tweets" ? "No tweets":"Show Tweets"}</Button>
      )
      },
      {
        title: 'Summary',
        dataIndex: 'summary',
        key: 'summary',
        render: (_: any, record: any) => (
          <Button onClick={() => handleClick(record.cashtag)} type="link">
            Get Summary
          </Button>
        ),
      },
    ];

    return { tableData, columns };
  };

  console.log(tweetText)

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (cashtags.length > 0) {
      const generatedTableData = generateTableData(cashtags[0].sevenDaysdata, cashtags[0].allData);

      setTableData({
        ...generatedTableData,
        tableData: generatedTableData.tableData.sort(
          (a, b) => b[Object.keys(b)[1]] - a[Object.keys(a)[1]]
        ), // Sort by the first date column
      });
    }
  }, [cashtags, cashtagTweets]);

  const handleShowTweets = (tweets:any) =>{
    setShowTweets(true)
    setTweetText(tweets)
  }

  return (
    <div className="w-full px-5 pt-2">
      {!isLoadingcashtag ? (
        <>
          {tableData && (
            <Table
              dataSource={tableData.tableData?.map((item, index) => ({ key: index, ...item }))}
              columns={tableData.columns}
              pagination={false}
              scroll={{ x: 1000 }}
              bordered
              className="shadow-lg"
            />
          )}
        </>
      ) : (
        <Flex justify="center" align="center" className="h-96">
          <Spin size="large" />
        </Flex>
      )}
      <Drawer
        title={`Summary for ${selectedCashtag || ''}`}
        width={700}
        onClose={() => setOpen(false)}
        open={open}
        styles={{
          body: {
            padding: '24px',
            background: '#f8fafc',
          },
        }}
      >
        <Flex justify="center" className="p-4" align="center">
          {loading ? (
            <Spin size="large" className="mt-64" />
          ) : (
            <div className=" bg-white p-6 rounded-lg shadow">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{summaryText}</ReactMarkdown>
            </div>
          )}
        </Flex>
      </Drawer>
      <Drawer
        title={`Tweets links`}
        width={500}
        onClose={() => setShowTweets(false)}
        open={showTweets}
        styles={{
          body: {
            padding: '10px',
            background: '#f8fafc',
          },
        }}
      >
            <div className=" bg-white h-full p-4 rounded-lg shadow">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    a: ({ href, children }) => (
      <p style={{ marginBottom: '7px', height:"100%" }}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </p>
    ),
  }}>{tweetText}</ReactMarkdown>
            </div>
      </Drawer>
    </div>
  );
};

export default analysis;
