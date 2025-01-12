import { Flex, Select } from 'antd';
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const { Option } = Select;

type DataItem = {
  date: string;
  [key: string]: string | number;
};

type CustomChartProps = {
  data: DataItem[];
};

const colorPalette: string[] = [
  '#ff7300', '#ff4e00', '#ff1a00', '#ff9500', '#ff5900', '#ff0000',
  '#3b82f6', '#9333ea', '#10b981', '#f59e0b', '#6ee7b7', '#22d3ee',
  '#8b5cf6', '#f43f5e', '#e11d48', '#fbbf24', '#14b8a6', '#9333ea',
  '#e879f9', '#ec4899', '#f97316', '#fef08a', '#d946ef', '#8b5cf6',
  '#22c55e', '#3b82f6', '#fb923c', '#ec4899', '#8b5cf6', '#eab308',
  '#ef4444', '#e60012', '#3b82f6', '#ef7a07', '#a855f7', '#6ee7b7',
  '#1e40af', '#e11d48', '#00bfae', '#fca5a5', '#fb923c', '#14b8a6',
  '#dc2626', '#d946ef', '#6d28d9', '#34d399', '#6366f1', '#f472b6',
  '#4ade80', '#60a5fa', '#34d399', '#fbbf24', '#6366f1',
];

const getStrokeColor = (index: number): string => {
  return colorPalette[index % colorPalette.length];
};

const CustomChart: React.FC<CustomChartProps> = ({ data }) => {
  const cashtags: string[] = [
    ...new Set(data?.flatMap((item) => Object.keys(item).filter((key) => key !== 'date')))
  ];

  const [selectedCashtags, setSelectedCashtags] = useState<string[]>(cashtags);

  const handleSelectChange = (value: string[]) => {
    setSelectedCashtags(value);
  };

  const filteredLines = selectedCashtags.map((cashtag, index) => (
    <Line
      key={cashtag}
      type="monotone"
      dataKey={cashtag}
      stroke={getStrokeColor(index)}
      activeDot={{ r: 8 }}
    />
  ));

  return (
    <>
      <Flex justify="space-between" align="center" className="mb-5">
        <div className="font-semibold text-2xl">Cashtag Analytics (Last 10 Days)</div>
        <Select
          mode="multiple"
          placeholder="Select Cashtags"
          value={selectedCashtags}
          onChange={handleSelectChange}
          style={{maxWidth:"850px",minWidth:"200px"}}
        >
          {cashtags.map((cashtag) => (
            <Option key={cashtag} value={cashtag}>
              {cashtag}
            </Option>
          ))}
        </Select>
      </Flex>
      <ResponsiveContainer width="100%" height={430}>
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            angle={-90} 
            textAnchor="end"
            height={65}
          />
          <YAxis
  domain={[0, 15]}
  tickFormatter={(value: string | number) => `${value}`}
/>
          <Tooltip />
          {filteredLines}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default CustomChart;
