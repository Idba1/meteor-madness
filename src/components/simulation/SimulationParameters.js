import React, { useState, useMemo, useEffect } from 'react';
import locationsData from '../../data/locations.json';
import asteroidsData from '../../data/asteroids.json';
import './SimulationParameters.scss';

function SimulationParameters({handleReset, onRunSimulation, onLocationChange, searchQuery, setSearchQuery, searchResults, searchLoading }) {
  // Simulation parameters state
  const [diameter, setDiameter] = useState(250); // meters
  const [velocity, setVelocity] = useState(19.3); // km/s
  const [entryAngle, setEntryAngle] = useState(45); // degrees
  const [impactLocation, setImpactLocation] = useState('Ocean (Pacific)');

  // Auto-select asteroid based on diameter
  const selectedAsteroid = useMemo(() => {
    // Convert meters to km for comparison
    const diameterKm = diameter / 1000;
    
    // Find asteroid with closest diameter match
    const closest = asteroidsData.reduce((prev, current) => {
      const prevDiff = Math.abs(prev.diameter_km - diameterKm);
      const currentDiff = Math.abs(current.diameter_km - diameterKm);
      return currentDiff < prevDiff ? current : prev;
    });
    
    return closest;
  }, [diameter]);

  // Don't auto-update parent component - only update when Run Simulation is clicked
  // This prevents the meteor from falling before clicking "Run Simulation"

  // Set default location on component mount
  useEffect(() => {
    if (onLocationChange && impactLocation) {
      onLocationChange(impactLocation);
    }
  }, [onLocationChange, impactLocation]);

  const handleRunSimulation = () => {
    const parameters = {
      diameter,
      velocity,
      entryAngle,
      impactLocation,
      selectedAsteroid
    };
    onRunSimulation?.(parameters);
  };

  return (
    <div className="simulation-parameters">
      <div className="parameters-header">
        <div className="header-icon">⚙️</div>
        <h3>Simulation Parameters</h3>
      </div>

      {/* Asteroid Diameter Slider */}
      <div className="parameter-group">
        <div className="parameter-label">
          <span>Asteroid Diameter</span>
          <span className="parameter-value">{diameter} m</span>
        </div>
        <div className="slider-container">
          <button 
            className="slider-btn"
            onClick={() => setDiameter(Math.max(10, diameter - 10))}
          >
            −
          </button>
          <input
            type="range"
            min="10"
            max="2000"
            step="10"
            value={diameter}
            onChange={(e) => setDiameter(parseInt(e.target.value))}
            className="parameter-slider"
          />
          <button 
            className="slider-btn"
            onClick={() => setDiameter(Math.min(2000, diameter + 10))}
          >
            +
          </button>
        </div>
      </div>

      {/* Velocity Slider */}
      <div className="parameter-group">
        <div className="parameter-label">
          <span>Velocity</span>
          <span className="parameter-value">{velocity} km/s</span>
        </div>
        <div className="slider-container">
          <button 
            className="slider-btn"
            onClick={() => setVelocity(Math.max(5, velocity - 0.1))}
          >
            −
          </button>
          <input
            type="range"
            min="5"
            max="50"
            step="0.1"
            value={velocity}
            onChange={(e) => setVelocity(parseFloat(e.target.value))}
            className="parameter-slider"
          />
          <button 
            className="slider-btn"
            onClick={() => setVelocity(Math.min(50, velocity + 0.1))}
          >
            +
          </button>
        </div>
      </div>

      {/* Entry Angle Slider */}
      <div className="parameter-group">
        <div className="parameter-label">
          <span>Entry Angle</span>
          <span className="parameter-value">{entryAngle}°</span>
        </div>
        <div className="slider-container">
          <button 
            className="slider-btn"
            onClick={() => setEntryAngle(Math.max(0, entryAngle - 5))}
          >
            −
          </button>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={entryAngle}
            onChange={(e) => setEntryAngle(parseInt(e.target.value))}
            className="parameter-slider"
          />
          <button 
            className="slider-btn"
            onClick={() => setEntryAngle(Math.min(360, entryAngle + 5))}
          >
            +
          </button>
        </div>
      </div>

      {/* Impact Location Dropdown */}
      <div className="parameter-group">
        <div className="parameter-label">
          <span>Impact Location</span>
        </div>
        <select
          value={impactLocation}
          onChange={(e) => {
            setImpactLocation(e.target.value);
            onLocationChange?.(e.target.value); // Notify parent about location change for map movement only
          }}
          className="location-select"
        >
          {Object.keys(locationsData).map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {/* Custom Location Search */}
      <div className="parameter-group">
        <div className="parameter-label">
          <span>Search Custom Location</span>
        </div>
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a city or address..."
            className="location-search-input"
          />
          {searchLoading && <div className="search-loading">Searching...</div>}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => {
                    // Don't update local impactLocation state - let parent handle it
                    // const locationName = result.display_name.split(',')[0];
                    // setImpactLocation(locationName);
                    
                    // Convert search result to proper format for map
                    const formattedLocation = {
                      ...result,
                      centroid: {
                        lat: parseFloat(result.lat),
                        lon: parseFloat(result.lon)
                      }
                    };
                    
                    console.log('Selected search location:', formattedLocation);
                    onLocationChange?.(formattedLocation); // Pass formatted location object
                    setSearchQuery(''); // Clear search query after selection
                  }}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Asteroid Info */}
      {selectedAsteroid && (
        <div className="asteroid-info">
          <div className="asteroid-name">
            Auto-selected: {selectedAsteroid.name}
          </div>
          <div className="asteroid-details">
            <span>Diameter: {selectedAsteroid.diameter_km} km</span>
            <span>Risk: {selectedAsteroid.hazard_level}</span>
          </div>
        </div>
      )}

      {/* Run Simulation Button */}
      <div className="simulation-actions">
        <button 
          className="run-simulation-btn"
          onClick={handleRunSimulation}
        >
          <span className="btn-icon">▶</span>
          Run Simulation
        </button>
        <button className="reset-btn" onClick={handleReset}>
          <span className="btn-icon">↻</span>
        </button>
      </div>
    </div>
  );
}

export default SimulationParameters;