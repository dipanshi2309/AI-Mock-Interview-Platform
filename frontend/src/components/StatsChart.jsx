import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const StatsChart = ({ topicPerformance = {}, scoreHistory = [] }) => {
  const topics = Object.keys(topicPerformance);
  const scores = Object.values(topicPerformance);

  // Bar Chart config for Topic Scores
  const barData = {
    labels: topics.length > 0 ? topics : ['No Data'],
    datasets: [
      {
        label: 'Average Score (%)',
        data: scores.length > 0 ? scores : [0],
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: '#6366f1',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(6, 182, 212, 0.8)',
        hoverBorderColor: '#06b6d4',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#151e33',
        titleFont: { family: 'Outfit', size: 14 },
        bodyFont: { family: 'Inter', size: 13 },
        borderColor: '#1e293b',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter' },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Outfit', weight: '500' },
        },
      },
    },
  };

  // Line Chart config for progress history
  const lineLabels = scoreHistory.map((item, index) => `Int. #${index + 1} (${item.topic})`);
  const lineScores = scoreHistory.map(item => item.score);

  const lineData = {
    labels: lineLabels.length > 0 ? lineLabels : ['No Data'],
    datasets: [
      {
        fill: true,
        label: 'Score Obtained',
        data: lineScores.length > 0 ? lineScores : [0],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#151e33',
        titleFont: { family: 'Outfit', size: 14 },
        bodyFont: { family: 'Inter', size: 13 },
        borderColor: '#1e293b',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter' },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Topic Performance Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-border flex flex-col h-80">
        <h3 className="text-lg text-slate-300 font-medium mb-4 flex items-center justify-between">
          <span>Topic-Wise Strength</span>
          <span className="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">Skill Summary</span>
        </h3>
        <div className="relative flex-grow min-h-0">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Progress History Line Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-border flex flex-col h-80">
        <h3 className="text-lg text-slate-300 font-medium mb-4 flex items-center justify-between">
          <span>Performance Trajectory</span>
          <span className="text-xs font-normal text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">Progress</span>
        </h3>
        <div className="relative flex-grow min-h-0">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
};
