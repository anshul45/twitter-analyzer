/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Drawer, Flex, Spin, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { getCashtags, getSummary } from '~/common/api.request';

const analysis = () => {
  const [cashtags, setCashtags] = useState<any[]>([]);
  const [tableData, setTableData] = useState<{ tableData: any[]; columns: any[] } | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCashtag, setSelectedCashtag] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [summaryText, setSummaryText] = useState<string>('');

  const getData = async () => {
    try {
      const data = await getCashtags();
      setCashtags([...data]); // Ensure state immutability
    } catch (error) {
      console.error('Error fetching cashtags:', error);
    }
  };


  const handleClick = async (cashtag: string) => {
    setSelectedCashtag(cashtag);
    setOpen(true);
    setLoading(true);
    try {
      const result = await getSummary(undefined, cashtag);
      setSummaryText(result);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummaryText('Failed to load summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterTopCashtags = (data: any[]): { topCashtags: string[]; filteredData: any[] } => {
    const groupedData: Record<string, number> = data.reduce((acc, item) => {
      const { cashtag, count } = item;
      acc[cashtag] = (acc[cashtag] || 0) + count;
      return acc;
    }, {});

    const sortedCashtags = Object.entries(groupedData)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([cashtag]) => cashtag);

    const filteredData = data.filter((item) => sortedCashtags.includes(item.cashtag));

    return { topCashtags: sortedCashtags, filteredData };
  };

  const generateTableData = (data: any[]): { tableData: any[]; columns: any[] } => {
    const groupedData: Record<string, { cashtag: string; counts: number[]; types: Set<string> }> = data.reduce(
      (acc, item) => {
        const { cashtag, count, types } = item;

        if (!acc[cashtag]) {
          acc[cashtag] = { cashtag, counts: [], types: new Set<string>() };
        }

        acc[cashtag].counts.push(count || 0);
        (types || []).forEach((type: string) => acc[cashtag].types.add(type));

        return acc;
      },
      {}
    );

    const tableData = Object.values(groupedData).map((entry) => {
      const { cashtag, counts, types } = entry;

      const totalCount = counts.reduce((sum, val) => sum + val, 0);
      const average = counts.length ? totalCount / counts.length : 0;

      const variance =
        counts.length > 1
          ? counts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / (counts.length - 1)
          : 0;
      const stdDev = Math.sqrt(variance);

      return {
        cashtag,
        Count: totalCount,
        Average: average.toFixed(2),
        StdDev: stdDev.toFixed(2),
        tweetTypes: Array.from(types),
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
        title: 'Average',
        dataIndex: 'Average',
        key: 'Average',
      },
      {
        title: 'StdDev',
        dataIndex: 'StdDev',
        key: 'StdDev',
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
          <Button onClick={() => handleClick(record.cashtag)}>Get Summary</Button>
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
      const { filteredData } = filterTopCashtags(cashtags);
      const generatedTableData = generateTableData(filteredData);

      //descending order
      const sortedTableData = {
        ...generatedTableData,
        tableData: generatedTableData.tableData.sort((a, b) => b.Count - a.Count),
      };
  
      setTableData(sortedTableData);
    }
  }, [cashtags]); // Regenerate table data only when cashtags change

  return (
    <div className="w-full px-5 pt-2">
      {tableData ? (
        <Table
          dataSource={tableData.tableData.map((item, index) => ({ key: index, ...item }))}
          columns={tableData.columns}
          pagination={false}
          scroll={{ x: 1000 }}
          bordered
          className="shadow-lg"
        />
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
            background: '#f8fafc'
          }
        }}
      >
        <Flex justify="center" className="p-4" align="center">
          {loading ? (
            <Spin size="large" className="mt-64" />
          ) : (
            <div className="whitespace-pre-wrap bg-white p-6 rounded-lg shadow">
              {summaryText}
            </div>
          )}
        </Flex>
      </Drawer>
    </div>
  );
};

export default analysis;
