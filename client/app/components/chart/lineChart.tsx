import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
  '#4ade80', '#60a5fa', '#34d399', '#fbbf24', '#6366f1'
];

const getStrokeColor = (index: number): string => {
  return colorPalette[index % colorPalette.length]; 
};

const CustomChart: React.FC<CustomChartProps> = ({ data }) => {
  const cashtags: string[] = [
    ...new Set(data?.flatMap(item => Object.keys(item).filter(key => key !== 'date')))
  ];


  const cashtagColors: Record<string, string> = cashtags.reduce((acc, cashtag, index) => {
    acc[cashtag] = getStrokeColor(index);
    return acc;
  }, {} as Record<string, string>);


  const lines = cashtags.map((cashtag, index) => (
    <Line
      key={cashtag}
      type="monotone"
      dataKey={cashtag}
      stroke={getStrokeColor(index)}
      activeDot={{ r: 8 }}
    />
  ));

  return (
    <ResponsiveContainer width="100%" height="100%">
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
        <XAxis dataKey="date" />
        <YAxis
          tickFormatter={(value: string | number) => cashtags[value as number]} 
          tick={({ payload, x, y, textAnchor }) => {
            const cashtag = cashtags[payload.value as number];
            const color = cashtagColors[cashtag] || '#000'; 
            return (
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                fill={color}
                fontSize={12}
              >
                {cashtag}
              </text>
            );
          }}
        />
        <Tooltip />
        {lines}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomChart;
