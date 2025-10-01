import React from 'react';
import './MetricVisualization.scss';

const MetricVisualization = ({ label, value, unit, color, maxValue }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="metric-visualization-card">
      <h3 className="metric-label">{label}</h3>
      <div className="metric-value-container">
        <span className="metric-value" style={{ color: color }}>
          {value}
        </span>
        <span className="metric-unit">{unit}</span>
      </div>
      <div className="metric-progress-bar">
        <div className="metric-progress" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
      </div>
      <p className="metric-description">{label === "Energy Released" ? "TNT EQUIVALENT" : label === "Blast Radius" ? "DAMAGE ZONE" : label === "Population Affected" ? "DIRECT IMPACT ZONE" : "MAXIMUM WAVE HEIGHT"}</p>
    </div>
  );
};

export default MetricVisualization;
