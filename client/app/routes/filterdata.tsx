/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Flex, DatePicker, Button, message, Table, Input, Modal } from 'antd';
// eslint-disable-next-line import/no-unresolved
import { generateReport, getReports } from '~/common/api.request';
// eslint-disable-next-line import/no-unresolved
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

interface DailyReport {
  date: string;
  report: string;
}

export default function GenerateReport() {
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [cashtag, setCashtag] = useState<string>('');
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<string>('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await getReports();
        setDailyReports(response);
      } catch (error) {
        message.error('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    if (!date && !cashtag) {
      message.error('Please select a date or enter a cashtag');
      return;
    }

    setGenerating(true);
    try {
      const formattedDate = date?.format('ddd MMM DD YYYY');
      if (formattedDate) await generateReport(formattedDate, cashtag);
      message.success('Report generation started');

      // Refresh reports after generation
      const response = await getReports();
      setDailyReports(response);
      setCashtag("");
    } catch (error) {
      message.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const filteredReports = date
    ? dailyReports
        .filter((report) => dayjs(report.date).isSame(date, 'day'))
        .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
    : dailyReports.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));

  const showModal = (content: string) => {
    setModalContent(content);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setModalContent('');
  };

  const dailyReportColumns: ColumnsType<DailyReport> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Reports',
      dataIndex: 'reports',
      key: 'reports',
      render: (reports) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {reports.map((report: any) => (
            <Button
              key={report.id}
              type="primary"
              onClick={() => showModal(report.content)}
              style={{ marginBottom: '4px' }}
            >
              {report.cashtag}
            </Button>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="px-5 py-2">
      <Flex gap={20} align="center">
        <div>
          <h1 className="font-semibold text-sm">Select Date</h1>
          <DatePicker onChange={(date) => setDate(date)} style={{ width: 200 }} />
        </div>
        <div>
          <h1 className="font-semibold text-sm">Enter Cashtag</h1>
          <Input
            placeholder="Enter cashtag ex:- $APPL"
            value={cashtag}
            onChange={(e) => setCashtag(e.target.value)}
          />
        </div>
        <div>
          <h1 className="font-semibold text-sm">Generate Report</h1>
          <Button
            type="primary"
            onClick={handleGenerateReport}
            loading={generating}
          >
            Generate Report
          </Button>
        </div>
      </Flex>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Filtered Reports</h2>
        <Table
          columns={dailyReportColumns}
          dataSource={filteredReports}
          loading={loading}
          pagination={false}
          bordered
          rowKey="date"
        />
      </div>

      <Modal
        title="Report Details"
        width={1000}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
      >
        <div style={{ whiteSpace: 'pre-wrap' }}>{modalContent}</div>
      </Modal>
    </div>
  )
}
