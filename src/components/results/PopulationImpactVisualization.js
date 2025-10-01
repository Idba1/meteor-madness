import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './PopulationImpactVisualization.scss';

const PopulationImpactVisualization = () => {
  const canvasRef = useRef(null);
  const { state } = useAppContext();
  const { impactData } = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!impactData || !impactData.populationBreakdown) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#e0e0e0';
      ctx.textAlign = 'center';
      ctx.fillText('No population impact data.', centerX, centerY);
      return;
    }

    const { directImpact, secondary, longTerm, totalAffected } = impactData.populationBreakdown;

    if (totalAffected === 0) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#e0e0e0';
      ctx.textAlign = 'center';
      ctx.fillText('No population affected.', centerX, centerY);
      return;
    }

    // Calculate angles for a pie chart-like visualization
    const directAngle = (directImpact / totalAffected) * Math.PI * 2;
    const secondaryAngle = (secondary / totalAffected) * Math.PI * 2;
    const longTermAngle = (longTerm / totalAffected) * Math.PI * 2;

    let startAngle = 0;

    // Adjust radius for more legend space
    const adjustedRadius = radius * 0.8; // Reduced radius

    // Direct Impact (Red)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, adjustedRadius, startAngle, startAngle + directAngle);
    ctx.closePath();
    ctx.fillStyle = '#dc2626'; // Red
    ctx.fill();
    startAngle += directAngle;

    // Secondary Effects (Orange)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, adjustedRadius, startAngle, startAngle + secondaryAngle);
    ctx.closePath();
    ctx.fillStyle = '#fb923c'; // Orange
    ctx.fill();
    startAngle += secondaryAngle;

    // Long Term Effects (Yellow)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, adjustedRadius, startAngle, startAngle + longTermAngle);
    ctx.closePath();
    ctx.fillStyle = '#facc15'; // Yellow
    ctx.fill();

    // Draw legend
    const legendX = centerX + adjustedRadius + 30; // Adjust legendX based on adjustedRadius
    let legendY = centerY - 60; // Start legend higher
    const legendSquareSize = 15;
    const legendTextOffset = legendSquareSize + 10;

    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e0e0';
    ctx.textAlign = 'left';

    // Direct Impact Legend
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(legendX, legendY, legendSquareSize, legendSquareSize);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText(`Direct Impact: ${directImpact.toLocaleString()}`, legendX + legendTextOffset, legendY + legendSquareSize / 2 + 4);
    legendY += 25;

    // Secondary Effects Legend
    ctx.fillStyle = '#fb923c';
    ctx.fillRect(legendX, legendY, legendSquareSize, legendSquareSize);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText(`Secondary: ${secondary.toLocaleString()}`, legendX + legendTextOffset, legendY + legendSquareSize / 2 + 4);
    legendY += 25;

    // Long Term Effects Legend
    ctx.fillStyle = '#facc15';
    ctx.fillRect(legendX, legendY, legendSquareSize, legendSquareSize);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText(`Long Term: ${longTerm.toLocaleString()}`, legendX + legendTextOffset, legendY + legendSquareSize / 2 + 4);
    legendY += 25;

    ctx.fillStyle = '#e0e0e0';
    ctx.fillText(`Total Affected: ${totalAffected.toLocaleString()}`, legendX + legendTextOffset, legendY + legendSquareSize / 2 + 4);

  }, [impactData]);

  return (
    <div className="population-impact-visualization-container">
      <h3>Population Impact Breakdown</h3>
      <canvas ref={canvasRef} width="500" height="400" className="population-impact-canvas"></canvas>
    </div>
  );
};

export default PopulationImpactVisualization;
