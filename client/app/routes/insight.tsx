/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Drawer, Flex, Spin, Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { getCashtags, getSummary } from '~/common/api.request';

const insight = () => {
  const [cashtags, setCashtags] = useState<any[]>([]);
  const [tableData, setTableData] = useState<{ tableData: any[]; columns: any[] } | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCashtag, setSelectedCashtag] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [summaryText, setSummaryText] = useState<string>("");

  const getData = async () => {
    const data = await getCashtags();
    setCashtags(data);
  };



  const handleClick = async (cashtag: string) => {
    setSelectedCashtag(cashtag);
    setOpen(true);
    setLoading(true);
    try {
        const today = dayjs()

        console.log(today.toString())

      const result = await getSummary(undefined, undefined,cashtag);
      setSummaryText(result);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummaryText('Failed to load summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterTodaysData = (data: any[]): any[] => {
    const today = dayjs();
  
    return data.filter((item) => dayjs(item.date).isSame(today, 'day'));
  };

  const filterTopCashtags = (data: any[]): any[] => {
    const groupedData: Record<string, number> = data.reduce((acc, item) => {
      const { cashtag, count } = item;
      acc[cashtag] = (acc[cashtag] || 0) + count;
      return acc;
    }, {});

    const sortedCashtags = Object.entries(groupedData)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([cashtag]) => cashtag);

    return data.filter((item) => sortedCashtags.includes(item.cashtag));
  };

  const generateTableData = (data: any[]): { tableData: any[]; columns: any[] } => {
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
      const { cashtag, counts } = entry;

      const totalCount = counts.reduce((sum, val) => sum + val, 0);

      return {
        cashtag,
        Count: totalCount,
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
        sorter: (a: any, b: any) => a.Count - b.Count,
        defaultSortOrder: 'descend',
      },
      {
        title: 'Summary',
        dataIndex: 'summary',
        key: 'summary',
        render: (_: any, record: any) => (
          <Button
            onClick={() => {
              handleClick(record.cashtag);
            }}
          >
            Get Summary
          </Button>
        ),
      },
    ];

    return { tableData, columns };
  };

  useEffect(() => {
    if (cashtags.length > 0) {
      const todaysData = filterTodaysData(cashtags);
      const topCashtags = filterTopCashtags(todaysData);
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
        <Flex justify="center" className="p-4" align="center">
          {loading ? (
            <Spin className="mt-64" />
          ) : (
            <div className="whitespace-pre-wrap">{summaryText}</div>
          )}
        </Flex>
      </Drawer>
    </div>
  );
};

export default insight;
