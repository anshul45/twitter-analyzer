import { useEffect, useState } from 'react';
import { Table } from 'antd';
import { getCashtags } from '~/common/api.request';
import CustomChart from '~/components/chart/lineChart';

const analysis = () => {
  const [cashtags, setCashtags] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<{ tableData: any[]; columns: any[] } | null>(null);

  const getData = async () => {
    const data = await getCashtags();
    setCashtags(data);
  };

  function transformAndSortData(data: any[]): any[] {
    const groupedData: Record<string, Record<string, number>> = data.reduce(
      (acc, item) => {
        const { date, cashtag, count } = item;
        if (!acc[date]) {
          acc[date] = {};
        }
        acc[date][cashtag] = count; // Store cashtag as key and count as value
        return acc;
      },
      {}
    );

    const result = Object.entries(groupedData).map(([date, cashtags]) => ({
      date,
      ...cashtags, // Spread the cashtags object into the result
    }));

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }

  function generateTableData(data: any[]): { tableData: any[]; columns: any[] } {
    const groupedData: Record<string, Record<string, number>> = data.reduce(
      (acc, item) => {
        const { date, cashtag, count } = item;
        if (!acc[cashtag]) {
          acc[cashtag] = { cashtag }; // Initialize with cashtag as a property
        }
        acc[cashtag][date] = count; // Store the count for the specific date
        return acc;
      },
      {}
    );

    const tableData = Object.values(groupedData);

    // Generate columns dynamically based on all unique dates in the data
    const allDates = [...new Set(data.map((item) => item.date))].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const columns = [
      {
        title: 'Cashtag',
        dataIndex: 'cashtag',
        key: 'cashtag',
        fixed: 'left',
      },
      ...allDates.map((date) => ({
        title: date,
        dataIndex: date,
        key: date,
      })),
    ];

    return { tableData, columns };
  }

  useEffect(() => {
    if (cashtags.length > 0) {
      const chartData = transformAndSortData(cashtags);
      const tableData = generateTableData(cashtags);
      setChartData(chartData);
      setTableData(tableData);
    }
  }, [cashtags]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className='w-full h-[80vh] p-5'>
      <div className='my-10 h-full'>
        <CustomChart data={chartData} />
      </div>
      {tableData && (
        <Table
          dataSource={tableData.tableData.map((item, index) => ({ key: index, ...item }))}
          columns={tableData.columns}
          pagination={false}
          scroll={{ x: true }}
        />
      )}
    </div>
  );
};

export default analysis;
