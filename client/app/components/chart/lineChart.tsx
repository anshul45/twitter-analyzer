import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Create a mapping for cashtags to Y-axis labels
const cashtagLabels = ["$UBER", "$TSLA", "$AAPL"];
const colorPalette = [
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

const getStrokeColor = (index) => {
  return colorPalette[index % colorPalette.length]; // Cycle through colors
};

const CustomChart = ({ data }) => {
  // Extract unique cashtags from the dataset
  const cashtags = [...new Set(data?.flatMap(item => Object.keys(item).filter(key => key !== 'date')))];

  // Create line components dynamically for each cashtag
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis
          tickFormatter={(value) => cashtags[value]} // Format ticks as cashtags
        />
        <Tooltip />
        <Legend />
        {lines}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomChart;
