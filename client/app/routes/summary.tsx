import { Table, Drawer, Button, Flex, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { getAllSummary } from '~/common/api.request';
import { ColumnType } from 'antd/es/table';

// Define types for the data
interface Summary {
  date: string;
  homepagesummaries: { title: string; description: string }[];
  analysispagesummaries: { title: string; description: string }[];
}

const SummaryTable = () => {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [drawerContent, setDrawerContent] = useState<string>('');
  const [data, setData] = useState<Summary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getSummaries = async () => {
    setLoading(true);
    try {
      const response = await getAllSummary(); 
      const groupedData = groupDataByDate(response);
      setData(groupedData);
    } catch (error) {
      console.error('Failed to fetch summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group data by date
  const groupDataByDate = (data: any[]): Summary[] => {
    const groupedData: Summary[] = [];

    data.forEach((item) => {
      const existingDate = groupedData.find((group) => group.date === item.date);

      if (existingDate) {
        existingDate.homepagesummaries = [
          ...existingDate.homepagesummaries,
          ...item.homepagesummaries,
        ];
        existingDate.analysispagesummaries = [
          ...existingDate.analysispagesummaries,
          ...item.analysispagesummaries,
        ];
      } else {
        groupedData.push({
          date: item.date,
          homepagesummaries: item.homepagesummaries,
          analysispagesummaries: item.analysispagesummaries,
        });
      }
    });

    return groupedData;
  };

  useEffect(() => {
    getSummaries();
  }, []);

  // Function to handle opening the drawer
  const showDrawer = (description: string) => {
    setDrawerContent(description);
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  const renderSummaries = (summaries: { title: string; description: string }[]) => (
    <Flex wrap>
      {summaries.map((summary, index) => (
        <Button
          key={index}
          type="link"
          onClick={() => showDrawer(summary.description)}
        >
          {summary.title}
        </Button>
      ))}
    </Flex>
  );

  const columns: ColumnType<Summary>[] = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 200,
      fixed: 'left' as const, // Use 'as const' for fixed values to avoid TypeScript errors
    },
    {
      title: 'Homepage Summary',
      dataIndex: 'homepagesummaries',
      key: 'homepagesummaries',
      render: renderSummaries,
    },
    {
      title: 'Analysis Summary',
      dataIndex: 'analysispagesummaries',
      key: 'analysispagesummaries',
      render: renderSummaries,
    },
  ];

  return (
    <div className="w-full px-5 pt-2">
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table dataSource={data} columns={columns} pagination={false} />
      )}

      <Drawer
        title="Summary Description"
        open={drawerVisible}
        onClose={onClose}
        width={700}
        styles={{
          body: {
            padding: '24px',
            background: '#f8fafc'
          }
        }}
      >
        <div className="whitespace-pre-wrap bg-white p-6 rounded-lg shadow">{drawerContent}</div>
      </Drawer>
    </div>
  );
};

export default SummaryTable;
