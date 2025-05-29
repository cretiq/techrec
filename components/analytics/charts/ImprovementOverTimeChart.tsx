'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Import Filler for area below line
} from 'chart.js';
import {  Card, CardContent, CardHeader, CardTitle  } from '@/components/ui-daisy/card'; // Optional: Wrap in Card if not done by parent

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ImprovementOverTimeChartProps {
  // Data should be structured for a line chart
  // Example: { labels: ['Jan', 'Feb', 'Mar', ...], scores: [60, 65, 75, ...] }
  data: {
    labels: string[];
    scores: number[];
  };
}

export const ImprovementOverTimeChart: React.FC<ImprovementOverTimeChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Overall Score',
        data: data.scores,
        fill: true, // Fill area below the line
        borderColor: 'rgb(54, 162, 235)', // Blue line
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Light blue fill
        tension: 0.3, // Smoothen the line
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend as there's only one dataset
      },
      title: {
        display: false, // Title is handled by CardHeader in parent
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y}%`;
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide x-axis grid lines
        },
      },
      y: {
        beginAtZero: false, // Start axis near the lowest score
        max: 100, // Assuming score is percentage
        grid: {
          color: 'rgba(200, 200, 200, 0.2)', // Lighter grid lines
        },
        ticks: {
          // Include a % sign in the ticks
          callback: function(value: any) {
            return value + '%';
          }
        }
      },
    },
    hover: {
      mode: 'nearest' as const,
      intersect: true
    }
  };

  return (
    <div className="h-64 w-full"> {/* Ensure container has height */}
      <Line options={options} data={chartData} />
    </div>
  );
}; 