import React, { useEffect, useState } from 'react';
import api from '../api/axios';

// FEATURE 2: Spending Heatmap Calendar (GitHub-contributions style)
export default function HeatmapCalendar({ month, year, refreshKey }) {
  const [days, setDays] = useState([]);
  const [maxSpend, setMaxSpend] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/expenses/heatmap/data', { params: { month, year } });
      setDays(data.days);
      setMaxSpend(Math.max(...data.days.map((d) => d.total), 1));
    };
    load();
  }, [month, year, refreshKey]);

  const getIntensity = (total) => {
    if (total === 0) return 0;
    const ratio = total / maxSpend;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  };

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const blanks = Array.from({ length: firstDayOfWeek });

  return (
    <div className="card">
      <h3>Spending Heatmap</h3>
      <div className="heatmap-grid">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="heatmap-cell blank" />
        ))}
        {days.map((d) => (
          <div
            key={d.day}
            className={`heatmap-cell intensity-${getIntensity(d.total)}`}
            title={`Day ${d.day}: $${d.total.toFixed(2)}`}
          >
            {d.day}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-cell intensity-0" />
        <div className="heatmap-cell intensity-1" />
        <div className="heatmap-cell intensity-2" />
        <div className="heatmap-cell intensity-3" />
        <div className="heatmap-cell intensity-4" />
        <span>More</span>
      </div>
    </div>
  );
}
