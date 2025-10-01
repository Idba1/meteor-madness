import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './ImpactZoneMap.scss';

const ImpactZoneMap = () => {
  const canvasRef = useRef(null);
  const { state } = useAppContext();
  const { impactData } = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!impactData) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#e0e0e0';
      ctx.textAlign = 'center';
      ctx.fillText('No impact data available for visualization.', width / 2, height / 2);
      return;
    }

    const blastRadius = parseFloat(impactData.blastRadius) || 0;
    const affectedPopulation = parseFloat(impactData.affectedPopulation.replace(/,/g, '') || 0);
    const energy = parseFloat(impactData.energy) || 0;

    // Parameters for visualization
    const maxRadiusDisplay = Math.min(blastRadius * 2, width / 2 - 20); // Scale blast radius to fit canvas
    const center = { x: width / 2, y: height / 2 };

    // Base color for low impact
    const baseColor = { r: 0, g: 188, b: 212 }; // A blueish color
    // High impact color
    const highImpactColor = { r: 255, g: 0, b: 0 }; // Red color

    // Calculate impact intensity based on energy and affected population
    // This is a simplified calculation, can be adjusted for more realism
    const maxEnergy = 1000; // Example max energy for scaling color
    const maxPopulation = 500000; // Example max population for scaling density

    const energyFactor = Math.min(energy / maxEnergy, 1);
    const populationFactor = Math.min(affectedPopulation / maxPopulation, 1);

    // Blend colors based on energy factor
    const r = baseColor.r + (highImpactColor.r - baseColor.r) * energyFactor;
    const g = baseColor.g + (highImpactColor.g - baseColor.g) * energyFactor;
    const b = baseColor.b + (highImpactColor.b - baseColor.b) * energyFactor;

    // Draw impact zone with varying dot density and color
    const numberOfDots = 1000 + (2000 * populationFactor); // More dots for higher population impact
    const dotRadius = 1 + (1 - energyFactor) * 1.5; // Smaller dots for higher energy

    for (let i = 0; i < numberOfDots; i++) {
      // Random position within the blast radius circle
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * maxRadiusDisplay;

      const dotX = center.x + distance * Math.cos(angle);
      const dotY = center.y + distance * Math.sin(angle);

      // Calculate color intensity based on distance from center (simulated falloff)
      const distFromCenterNormalized = distance / maxRadiusDisplay;
      const alpha = 0.3 + (1 - distFromCenterNormalized) * 0.7; // Denser/more opaque towards center

      ctx.beginPath();
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
    }

    // Draw outer blast radius circle for reference
    ctx.beginPath();
    ctx.arc(center.x, center.y, maxRadiusDisplay, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '14px Arial';
    ctx.fillStyle = '#e0e0e0';
    ctx.textAlign = 'center';
    ctx.fillText(`Impact Zone: ${blastRadius.toFixed(1)} km Radius`, width / 2, height - 20);

  }, [impactData]);

  return (
    <div className="impact-zone-map-container">
      <h3>Affected Area Visualization</h3>
      <canvas ref={canvasRef} width="500" height="400" className="impact-zone-canvas"></canvas>
    </div>
  );
};

export default ImpactZoneMap;
