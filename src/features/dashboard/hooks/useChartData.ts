import { useMemo } from 'react';

// This hook provides realistic, random data for the chart.
export const useChartData = () => {
  const chartData = useMemo(() => {
    const data = [];
    let lastValue = 50;
    for (let i = 0; i < 12; i++) {
      lastValue += Math.random() * 20 - 10;
      data.push({
        value: Math.max(20, lastValue), // Ensure value is not too low
        label: new Date(0, i).toLocaleString('default', { month: 'short' }),
      });
    }
    return data;
  }, []);

  return { chartData };
};