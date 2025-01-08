import { MetaFunction } from '@remix-run/node';
import { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-unresolved
import { generateReport, getReports } from '~/common/api.request';
import { Flex, DatePicker, Button, message, Table } from 'antd';
// eslint-disable-next-line import/no-unresolved
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

export const meta: MetaFunction = () => {
  return [
    { title: 'Twitter Scrapper' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

interface DailyReport {
  date: string;
  report: string;
}

export default function GenerateReport() {
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await getReports();
        setDailyReports(response);
      } catch (error) {
        message.error("Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    if (!date) {
      message.error("Please select a date");
      return;
    }

    setGenerating(true);
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      await generateReport(formattedDate);
      message.success("Report generation started");
      
      // Refresh reports after generation
      const response = await getReports();
      setDailyReports(response);
    } catch (error) {
      message.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const dailyReportColumns: ColumnsType<DailyReport> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Report',
      dataIndex: 'report',
      key: 'report',
      render: (text) => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
    }
  ];

  return (
    <div className="px-5 py-2">
      <Flex gap={20} align="center">
        <div>
          <h1 className="font-semibold text-sm">Select Date</h1>
          <DatePicker
            onChange={(date) => setDate(date)}
            style={{ width: 200 }}
          />
        </div>
        <Button 
          type="primary" 
          onClick={handleGenerateReport}
          loading={generating}
        >
          Generate Report
        </Button>
      </Flex>
      
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Daily Report</h2>
        <Table
          columns={dailyReportColumns}
          dataSource={dailyReports}
          loading={loading}
          pagination={false}
          bordered
        />
      </div>

    </div>
  );
}
