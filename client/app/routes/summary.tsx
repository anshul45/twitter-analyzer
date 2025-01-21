/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-unresolved */
import { Table, Drawer, Button, Spin, Flex } from 'antd';
import { useEffect, useState } from 'react';
import { getAllSummary } from '~/common/api.request';
import { ColumnType } from 'antd/es/table';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Summary {
  date: string;
  title: string;
  description: string;
  source: string;
  type: 'homepage' | 'analysis';
}

const SummaryTable = () => {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [drawerRecord, setDrawerRecord] = useState<Summary | null>(null);
  const [data, setData] = useState<Summary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getSummaries = async () => {
    setLoading(true);
    try {
      const response = await getAllSummary();
  
      // Sort the response by createdAt in descending order
      const sortedResponse = response.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  
      const flattenedData = sortedResponse.flatMap(item => [
        ...item.homepage.map((summary: any) => ({
          date: item.date,
          title: summary.title,
          description: summary.description,
          source: item.source,
          type: 'homepage',
        })),
        ...item.analysis.map((summary: any) => ({
          date: item.date,
          title: summary.title,
          description: summary.description,
          source: item.source,
          type: 'analysis',
        })),
      ]);
  
      setData(flattenedData);
    } catch (error) {
      console.error('Failed to fetch summaries:', error);
    } finally {
      setLoading(false);
    }
  };
  


  useEffect(() => {
    getSummaries();
  }, []);

  const showDrawer = (record: Summary) => {
    setDrawerRecord(record);
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  const columns: ColumnType<Summary>[] = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 200,
      fixed: 'left' as const,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <span className="capitalize">{type}</span>
      ),
    },
    {
      title: 'Summary',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Summary) => (
        <Button type="link" onClick={() => showDrawer(record)}>
          {title}
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full px-5 pt-2">
      {loading ? (
        <Flex justify='center' align='center' className='h-[calc(100vh-65px)]'>
          <Spin size="large" />
        </Flex>
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
        <div className="bg-white p-6 rounded-lg shadow markdown-body">
          {drawerRecord && (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{drawerRecord.description}</ReactMarkdown>
              {drawerRecord.source && (
                <div className="mt-4">
                  <span className="font-medium">Source: </span>
                  <a 
                    href={drawerRecord.source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {drawerRecord.source}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default SummaryTable;
