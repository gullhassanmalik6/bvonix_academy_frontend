import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';
import { siteSettingsService } from '../../services/siteSettingsService';

// Wave y-positions: alternating peak (30) and trough (70) for smooth wave
const getWaveY = (index, total) => {
  if (total <= 1) return 50;
  return index % 2 === 0 ? 30 : 70;
};

const CustomDot = ({ cx, cy, payload }) =>
  payload?.showDot !== false && cx != null && cy != null ? (
    <circle cx={cx} cy={cy} r={4} fill="#333" stroke="none" />
  ) : null;

const MilestonesSection = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    siteSettingsService
      .getSiteSettings()
      .then((data) => {
        const list = data?.milestones_items || siteSettingsService.MILESTONES_DEFAULTS.milestones_items;
        setItems(Array.isArray(list) && list.length > 0 ? list : siteSettingsService.MILESTONES_DEFAULTS.milestones_items);
      })
      .catch(() => setItems(siteSettingsService.MILESTONES_DEFAULTS.milestones_items));
  }, []);

  if (!items.length) {
    return (
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </section>
    );
  }

  // Build chart data: extend wave past first/last dots (screenshot style)
  const rawPoints = items.map((item, i) => ({
    x: items.length <= 1 ? 50 : (i / (items.length - 1)) * 100,
    y: getWaveY(i, items.length),
    value: item.value,
    label: item.label,
    showDot: true,
  }));
  const firstX = rawPoints[0]?.x ?? 0;
  const lastX = rawPoints[rawPoints.length - 1]?.x ?? 100;
  const chartData = [
    { x: Math.max(-12, firstX - 15), y: 50, showDot: false },
    ...rawPoints,
    { x: Math.min(112, lastX + 15), y: 50, showDot: false },
  ];

  return (
    <section className="py-16 lg:py-20 bg-white overflow-x-hidden">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Recharts smooth wavy line - extends full width */}
          <div className="w-full h-24 -mx-2" style={{ overflow: 'visible' }}>
            <ResponsiveContainer width="100%" height={96}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <XAxis type="number" dataKey="x" hide domain={[-15, 115]} />
                <YAxis type="number" hide domain={[0, 100]} />
                <Line
                  type="natural"
                  dataKey="y"
                  stroke="#D1D1D1"
                  strokeWidth={2.5}
                  dot={<CustomDot />}
                  activeDot={false}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats with value + label below each dot */}
          <div className="relative z-10 flex flex-wrap justify-between gap-6 sm:gap-8 pt-8 sm:pt-10">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center min-w-0 flex-1"
                style={{ flexBasis: `${100 / Math.min(items.length, 5)}%` }}
              >
                <p className="text-primary-500 font-bold text-2xl sm:text-3xl lg:text-4xl whitespace-nowrap">
                  {item.value || ''}
                </p>
                <p className="text-[#1F1F1F] text-sm sm:text-base mt-1 font-medium">
                  {item.label || ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MilestonesSection;
