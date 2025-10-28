import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Spin } from 'antd';
import Strings from '../../../utils/localizations/Strings';

type VisualizationMode = 'daily' | 'ma7' | 'cumulative';

interface TimeSeriesData {
  fecha: string;
  equipo: string;
  position_id: number | null;
  total: number;
  abiertas: number;
  resueltas: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  mode: VisualizationMode;
  isLoading?: boolean;
}

/**
 * Helper function to calculate 7-day moving average
 * Returns null for the first k-1 days to avoid skewing the data
 */
function movingAverage(data: number[], k: number = 7): (number | null)[] {
  const n = data.length;
  const out: (number | null)[] = new Array(n).fill(null);
  let sum = 0;
  const queue: number[] = [];

  for (let i = 0; i < n; i++) {
    const v = data[i] ?? 0;
    queue.push(v);
    sum += v;
    if (queue.length > k) {
      sum -= queue.shift()!;
    }
    if (i >= k - 1) {
      out[i] = parseFloat((sum / k).toFixed(2));
    }
  }
  return out;
}

/**
 * Helper function to calculate cumulative sum
 */
function cumulative(data: number[]): number[] {
  let acc = 0;
  return data.map(v => {
    acc += v ?? 0;
    return acc;
  });
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, mode, isLoading }) => {
  // Helper function to format date as DD/MM/YYYY
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr + 'T00:00:00'); // Add time to avoid timezone issues
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Process data into Chart.js format
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Group data by date and position
    const dateSet = new Set<string>();
    const seriesByPosition: Record<string, Record<string, number>> = {};

    data.forEach(row => {
      const fecha = row.fecha;
      const equipo = row.equipo || 'Sin equipo';

      dateSet.add(fecha);

      if (!seriesByPosition[equipo]) {
        seriesByPosition[equipo] = {};
      }
      seriesByPosition[equipo][fecha] = row.total;
    });

    // Sort dates
    const dates = Array.from(dateSet).sort();

    // Generate colors for each position
    const colors = [
      '#0d6efd', '#dc3545', '#28a745', '#ffc107', '#17a2b8',
      '#6610f2', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
    ];

    // Build datasets
    const datasets = Object.keys(seriesByPosition).map((equipo, index) => {
      const positionData = seriesByPosition[equipo];

      // Create base data array (daily counts)
      const dailyData = dates.map(fecha => positionData[fecha] ?? 0);

      // Transform data based on visualization mode
      let transformedData: (number | null)[];
      if (mode === 'ma7') {
        transformedData = movingAverage(dailyData, 7);
      } else if (mode === 'cumulative') {
        transformedData = cumulative(dailyData);
      } else {
        transformedData = dailyData;
      }

      const color = colors[index % colors.length];

      return {
        label: equipo,
        data: transformedData,
        borderColor: color,
        backgroundColor: `${color}22`,
        borderWidth: 2,
        tension: mode === 'ma7' ? 0.3 : mode === 'cumulative' ? 0.15 : 0.2,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        spanGaps: mode === 'ma7', // For MA7, skip null values at the start
      };
    });

    return {
      labels: dates.map(formatDate), // Format dates as DD/MM/YYYY
      datasets,
    };
  }, [data, mode]);

  // Chart options
  const options = useMemo(() => {
    const titleText =
      mode === 'ma7' ? `${Strings.cards} - ${Strings.movingAverage7Days}` :
      mode === 'cumulative' ? `${Strings.cards} - ${Strings.cumulativeCount}` :
      `${Strings.cards} - ${Strings.dailyCount}`;

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: titleText,
        },
        legend: {
          position: 'bottom' as const,
          labels: { boxWidth: 15 },
        },
        tooltip: {
          callbacks: {
            title: (context: any) => {
              // Return the formatted date label (already formatted as DD/MM/YYYY)
              return context[0]?.label || '';
            },
            label: (context: any) => {
              const v = context.parsed.y;
              const value = Number.isFinite(v) ? v : 0;
              return `${context.dataset.label}: ${value}`;
            },
          },
        },
        datalabels: {
          display: false, // Disable datalabels for line charts to avoid clutter
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => Number(value).toLocaleString(),
          },
          title: {
            display: true,
            text: Strings.totalCards,
          },
        },
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
          },
        },
      },
    };
  }, [mode]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!chartData) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6c757d' }}>
        {Strings.noData}
      </div>
    );
  }

  return (
    <div style={{ height: 400, position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TimeSeriesChart;
