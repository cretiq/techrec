'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SuggestionProgressChartProps {
  // Data representing suggestion counts by status
  // Example: { pending: 15, accepted: 25, rejected: 5 }
  data: {
    pending: number;
    accepted: number;
    rejected: number;
  };
}

export const SuggestionProgressChart: React.FC<SuggestionProgressChartProps> = ({ data }) => {
  const chartData = {
    labels: ['Pending', 'Accepted', 'Rejected'],
    datasets: [
      {
        label: 'Suggestion Status',
        data: [data.pending, data.accepted, data.rejected],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)', // Yellow (Pending)
          'rgba(75, 192, 192, 0.7)', // Green (Accepted)
          'rgba(255, 99, 132, 0.7)',  // Red (Rejected)
        ],
        borderColor: [
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // Make it a doughnut chart
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
            padding: 20,
            boxWidth: 12,
            font: {
                size: 11
            }
        }
      },
      title: {
        display: false, // Title handled by parent
      },
      tooltip: {
         callbacks: {
           label: function(context: any) {
             let label = context.label || '';
             if (label) {
               label += ': ';
             }
             if (context.parsed !== null) {
               label += context.parsed;
             }
             return label;
           }
         }
      },
    },
  };

  return (
    <div className="h-64 w-full flex items-center justify-center"> {/* Center the doughnut */}
      <Doughnut options={options} data={chartData} />
    </div>
  );
}; 