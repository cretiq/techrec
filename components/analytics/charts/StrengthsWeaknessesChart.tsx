'use client';

import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface StrengthsWeaknessesChartProps {
  // Data should represent scores across different categories/dimensions
  // Example: { labels: ['ATS', 'Keywords', 'Impact', 'Clarity', 'Conciseness'], scores: [80, 75, 90, 60, 85] }
  data: {
    labels: string[];
    scores: number[];
  };
}

export const StrengthsWeaknessesChart: React.FC<StrengthsWeaknessesChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'CV Section Score',
        data: data.scores,
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Light blue fill
        borderColor: 'rgb(54, 162, 235)', // Blue line
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Typically hide legend for single dataset radar charts
      },
      title: {
        display: false, // Title handled by parent CardHeader
      },
      tooltip: {
         callbacks: {
           label: function(context: any) {
             let label = context.dataset.label || '';
             if (label) {
               label += ': ';
             }
             if (context.parsed.r !== null) {
               label += `${context.parsed.r}%`; // Assuming score is percentage
             }
             return label;
           }
         }
      },
    },
    scales: {
      r: { // Radial scale options
        beginAtZero: true,
        max: 100, // Assuming scores are out of 100
        angleLines: {
          color: 'rgba(200, 200, 200, 0.3)', // Lighter angle lines
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.3)', // Lighter grid lines
        },
        pointLabels: {
          font: {
            size: 11, // Smaller font for labels
          },
          color: '#666' // Muted color for labels
        },
        ticks: {
          display: false, // Hide the numeric ticks on the radial axis
          stepSize: 20
        }
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      }
    }
  };

  return (
    <div className="h-64 w-full"> {/* Ensure container has height */}
      <Radar options={options} data={chartData} />
    </div>
  );
}; 