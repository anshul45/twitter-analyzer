/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { Table, Spin, Flex, Button, Drawer } from 'antd';
import { useEffect, useState } from 'react';
import { getCashtags, getSummaryForCashtag } from '~/common/api.request';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const analysis = () => {
  const [cashtags, setCashtags] = useState<any[]>([]);
  const [tableData, setTableData] = useState<{ tableData: any[]; columns: any[] } | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCashtag, setSelectedCashtag] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingcashtag,setIsLoadingcashtag]= useState<boolean>(false);
  const [summaryText, setSummaryText] = useState<string>('');

  
  const getData = async () => {
    try {
      setIsLoadingcashtag(true)
      const data = await getCashtags();
      setCashtags([data]);
    } catch (error) {
      console.error('Error fetching cashtags:', error);
    }
  finally{
    setIsLoadingcashtag(false)
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
    const cashtagData = allData.filter((item) => item.cashtag === cashtag);
    
    // Get all unique dates from the complete dataset
    const allDates = Array.from(new Set(allData.map(item => item.date)));
    
    // Create a map of date to count for this cashtag
    const dateCountMap = new Map();
    cashtagData.forEach(item => {
      dateCountMap.set(item.date, item.count || 0);
    });
    
    // Fill in 0 for missing dates
    const counts = allDates.map(date => dateCountMap.get(date) || 0);

    // if (cashtag === '$TSLA') {
    //   console.log(allDates);
    //   console.log(counts);
    // }
    
    const sum = counts.reduce((total, count) => total + count, 0);
    const avg = sum / allDates.length;
    
    const stdDev = Math.sqrt(
      counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / allDates.length
    );

    return { avg, stdDev };
  };


  const formatDate = (dateStr:string) => {
    const date = new Date(dateStr);
    const day = date.getDate();  
    const month = date.toLocaleString('default', { month: 'short' }); 
  
    return `${day} ${month}`;
  };


  const generateTableData = (data: any[], allData: any[]): { tableData: any[]; columns: any[] } => {
    const uniqueDates = Array.from(new Set(data?.map((item) => item.date)))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Group data by cashtag and map counts to dates
    const groupedData: Record<string, { cashtag: string; dateCounts: Record<string, number>; avg: number; stdDev: number }> = data.reduce(
      (acc, item) => {
        const { cashtag, date, count } = item;

        if (!acc[cashtag]) {
          const stats = calculateStats(allData, cashtag);
          acc[cashtag] = { cashtag, dateCounts: {}, avg: stats.avg, stdDev: stats.stdDev };
        }

        acc[cashtag].dateCounts[date] = (acc[cashtag].dateCounts[date] || 0) + (count || 0);

        return acc;
      },
      {}
    );

    // Prepare table data
    const tableData = Object.values(groupedData)?.map((entry) => {
      const { cashtag, dateCounts, avg, stdDev } = entry;

      return {
        cashtag,
        avg: avg.toFixed(2),
        std_dev: stdDev.toFixed(2),
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
      },
      ...uniqueDates?.map((date) => ({
        title: formatDate(date),
        dataIndex: date,
        key: date,
        width:100,
        sorter: (a: any, b: any) => a[date] - b[date],
      })),
      {
        title: 'Avg',
        dataIndex: 'avg',
        key: 'avg',
      },
      {
        title: 'Std Dev',
        dataIndex: 'std_dev',
        key: 'std_dev',
      },
      {
        title: 'Summary',
        dataIndex: 'summary',
        key: 'summary',
        render: (_: any, record: any) => (
          <Button onClick={() => handleClick(record.cashtag)} type='link'>Get Summary</Button>
        ),
      },
    ];

    return { tableData, columns };
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (cashtags.length > 0) {
      const generatedTableData = generateTableData(cashtags[0].sevenDaysdata, cashtags[0].allData);

      setTableData({
        ...generatedTableData,
        tableData: generatedTableData.tableData.sort((a, b) => b[Object.keys(b)[1]] - a[Object.keys(a)[1]]), // Sort by the first date column
      });
    }
  }, [cashtags])

  return (
    <div className="w-full px-5 pt-2">
      {!isLoadingcashtag ? (
        <>
        {tableData &&
        <Table
        dataSource={tableData.tableData?.map((item, index) => ({ key: index, ...item }))}
        columns={tableData.columns}
        pagination={false}
        scroll={{ x: 1000 }}
        bordered
        className="shadow-lg"
        />
      }
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
    </div>
  );
};

export default analysis;
