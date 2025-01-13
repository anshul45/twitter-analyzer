/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Drawer, Flex, Spin, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { getCashtags,getSummary } from '~/common/api.request';

const analysis = () => {
  const [cashtags, setCashtags] = useState<any[]>([]);
  const [tableData, setTableData] = useState<{ tableData: any[]; columns: any[] } | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCashtag, setSelectedCashtag] = useState<string | null>(null);
  const [loading,setLoading] = useState<boolean>(false)
  const [summaryText, setSummaryText] = useState<string>("")


  const getData = async () => {
    const data = await getCashtags();
    setCashtags(data);
  };

  const handleClick = async(cashtag:string) => {
    setSelectedCashtag(cashtag);
    setOpen(true);
    setLoading(true);
    try {
      const result = await getSummary(undefined, cashtag);
      setSummaryText(result?.summary);
    } catch (error) {
      console.error('Error fetching summary:', error)
      setSummaryText('Failed to load summary. Please try again.')
    } finally {
      setLoading(false)
    }

  }

  function filterTopCashtags(data: any[]): any[] {
    // Group by cashtag and calculate total count
    const groupedData: Record<string, number> = data.reduce((acc, item) => {
      const { cashtag, count } = item;
      acc[cashtag] = (acc[cashtag] || 0) + count;
      return acc;
    }, {});

    // Sort by count in descending order and take the top 5
    const sortedCashtags = Object.entries(groupedData)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([cashtag]) => cashtag);

    // Include only top 5 cashtags
    return data.filter((item) => sortedCashtags.includes(item.cashtag));
  }

  function generateTableData(data: any[]): { tableData: any[]; columns: any[] } {
    const groupedData: Record<string, { cashtag: string; counts: number[]; types: string[] }> = data.reduce((acc, item) => {
      const { cashtag, count, types } = item;

      if (!acc[cashtag]) {
        acc[cashtag] = { cashtag, counts: [], types: [] };
      }

      acc[cashtag].counts.push(count);
      acc[cashtag].types.push(...(types || []));

      return acc;
    }, {});

    const tableData = Object.values(groupedData).map((entry) => {
      const { cashtag, counts, types } = entry;

      const totalCount = counts.reduce((sum, val) => sum + val, 0);
      const average = totalCount / counts.length;

      const variance = counts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / (counts.length - 1 || 1);
      const stdDev = Math.sqrt(variance);

      return {
        cashtag,
        Count: totalCount,
        Avg: average.toFixed(2),
        Std_dev: stdDev.toFixed(2),
        tweetTypes: types.length > 0 ? types : ['N/A'],
      };
    });

    const columns = [
      {
        title: 'Cashtag',
        dataIndex: 'cashtag',
        key: 'cashtag',
        fixed: 'left',
      },
      {
        title: 'Count',
        dataIndex: 'Count',
        key: 'Count',
      },
      {
        title: 'Avg',
        dataIndex: 'Avg',
        key: 'Avg',
      },
      {
        title: 'Std_dev',
        dataIndex: 'Std_dev',
        key: 'Std_dev',
      },
      {
        title: 'Tweet Types',
        dataIndex: 'tweetTypes',
        key: 'tweetTypes',
        render: (tweetTypes: string[]) =>
          tweetTypes?.map((value: string, idx: number) => (
            <Tag bordered={false} color="processing" key={idx}>
              {value}
            </Tag>
          )),
      },
      {
        title: 'Summary',
        dataIndex: 'summary',
        key: 'summary',
        render: (_: any, record: any) => (
          <Button
            onClick={() => {
              handleClick(record.cashtag)
            }}
          >
            Get Summary
          </Button>
        ),
      },
    ];

    return { tableData, columns };
  }

  useEffect(() => {
    if (cashtags.length > 0) {
      const topCashtags = filterTopCashtags(cashtags);
      const tableData = generateTableData(topCashtags);
      setTableData(tableData);
    }
  }, [cashtags]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="w-full px-5 pt-2">
      {tableData && (
        <Table
          dataSource={tableData.tableData.map((item, index) => ({ key: index, ...item }))}
          columns={tableData.columns}
          pagination={false}
        />
      )}
      <Drawer
        title={`Summary for ${selectedCashtag || ''}`}
        width={700}
        onClose={() => setOpen(false)}
        open={open}
      >
       <Flex justify='center' className='p-4' align='center'>
          {loading ? (
            <Spin className='mt-64'/>
          ) : (
            <div className="whitespace-pre-wrap">{summaryText}</div>
          )}
        </Flex>
      </Drawer>
    </div>
  );
};

export default analysis;
