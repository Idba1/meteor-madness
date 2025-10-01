import React, { Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import locationsData from '../data/locations.json';
import PreliminaryResults from '../components/simulation/PreliminaryResults';
import PopulationImpact from '../components/simulation/PopulationImpact';
import EnvironmentalImpact from '../components/simulation/EnvironmentalImpact';
import SimulationParameters from '../components/simulation/SimulationParameters';
import './Dashboard.scss';
import RealMap from '../components/RealMap/RealMap';
import { useAppContext } from '../context/AppContext';

function Dashboard() {
  const { dispatch } = useAppContext();
  // Local state for location and asteroid selection
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Simulation state
  const [simulationTrigger, setSimulationTrigger] = useState(0);

  // Simulation parameters from SimulationParameters component
  const [simulationParams, setSimulationParams] = useState({
    diameter: 250, // meters
    velocity: 19.3, // km/s
    entryAngle: 45, // degrees
    impactLocation: 'Ocean (Pacific)',
    selectedAsteroid: null
  });

  // Helper function to get display name for selected location
  const getLocationDisplayName = (location) => {
    if (!location) return 'No Location Selected';

    if (typeof location === 'string') {
      return location;
    }

    if (location.display_name) {
      // For search results from Nominatim API, format the display name
      const parts = location.display_name.split(',');
      if (parts.length >= 2) {
        return `${parts[0].trim()}, ${parts[1].trim()}`;
      }
      return parts[0].trim();
    }

    if (location.name) {
      return location.name;
    }

    return 'Unknown Location';
  };

  // Search location using OpenStreetMap Nominatim
  const searchLocation = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setSearchResults([]);
    }
    setIsSearching(false);
  }, []);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchLocation]);

  // Enhanced impact calculation using both asteroid data and simulation parameters
  const impactData = useMemo(() => {
    const location = locationsData[selectedLocation] || selectedLocation;

    // Always calculate if we have location and simulation parameters, regardless of selectedAsteroid
    if (!location) return null;

    // Use location population/density or defaults for ocean impacts
    const population = location.population || (location.type === 'ocean' ? 50000 : 100000); // Default coastal population
    const density = location.density || (location.type === 'ocean' ? 100 : 500); // people per km²

    // Calculate energy based on diameter, velocity, and entry angle
    const diameterKm = simulationParams.diameter / 1000; // Convert meters to km
    const velocityKmS = simulationParams.velocity;
    const angleRadians = (simulationParams.entryAngle * Math.PI) / 180;

    // Enhanced energy calculation considering velocity and angle
    const radius = diameterKm / 2; // radius in km
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // volume in km³
    const mass = volume * 2.6e12; // kg (rocky density ~2600 kg/m³, converted to kg/km³)
    const velocityMs = velocityKmS * 1000; // convert km/s to m/s
    const kineticEnergy = 0.5 * mass * Math.pow(velocityMs, 2); // Joules
    const angleEfficiency = Math.sin(angleRadians) || 0.1; // Minimum efficiency to avoid 0
    const energy = (kineticEnergy * angleEfficiency) / (4.184e15); // Convert to megatons TNT

    // Blast radius calculation based on energy (empirical formula for nuclear explosions)
    const blastRadius = Math.pow(energy / 0.001, 1 / 3) * 0.5; // km, adjusted for asteroid impact
    const affectedArea = Math.PI * Math.pow(blastRadius, 2); // km²
    const affectedPopulation = Math.min(population, affectedArea * density);
    // Casualties calculation based on blast effects (typically 10-30% for major impacts)
    const casualties = affectedPopulation * 0.15;

    // Population impact breakdown
    const directImpact = Math.round(affectedPopulation * 0.25); // 25% direct impact
    const secondary = Math.round(affectedPopulation * 0.47); // 47% secondary effects  
    const longTerm = Math.round(affectedPopulation * 0.28); // 28% long-term effects
    const totalAffected = directImpact + secondary + longTerm;

    // Determine latitude and longitude
    let impactLat = 0;
    let impactLng = 0;

    if (selectedLocation && typeof selectedLocation !== 'string') {
      impactLat = parseFloat(selectedLocation.lat);
      impactLng = parseFloat(selectedLocation.lon);
    } else if (selectedLocation === 'Ocean (Pacific)') {
      impactLat = 0; // Example for Pacific Ocean
      impactLng = 180; // Example for Pacific Ocean
    } else if (locationsData[selectedLocation] && locationsData[selectedLocation].coords) {
      impactLat = locationsData[selectedLocation].coords.lat;
      impactLng = locationsData[selectedLocation].coords.lng;
    }

    return {
      blastRadius: blastRadius.toFixed(1),
      affectedPopulation: Math.round(affectedPopulation).toLocaleString(),
      casualties: Math.round(casualties).toLocaleString(),
      energy: energy.toFixed(0),
      asteroidDiameter: diameterKm.toFixed(2),
      latitude: impactLat,
      longitude: impactLng,
      simulationParams: {
        diameter: simulationParams.diameter,
        velocity: simulationParams.velocity,
        entryAngle: simulationParams.entryAngle
      },
      populationBreakdown: {
        directImpact,
        secondary,
        longTerm,
        totalAffected
      }
    };
  }, [selectedLocation, simulationParams]);

  // Memoized callback function to prevent infinite re-renders
  const handleRunSimulation = useCallback((params) => {
    console.log('Running simulation with parameters:', params);
    setSimulationParams(params);
    setSelectedAsteroid(params.selectedAsteroid?.name);
    setSelectedLocation(params.impactLocation);
    setSimulationTrigger(prev => prev + 1); // Trigger meteor animation
  }, []);

  useEffect(() => {
    if (impactData) {
      dispatch({ type: 'SET_IMPACT_DATA', payload: impactData });
    }
  }, [impactData, dispatch]);

  // Handle location change from dropdown or search
  const handleLocationChange = useCallback((location) => {
    console.log('Dashboard: Setting selected location to:', location);
    setSelectedLocation(location);
    // Update map position without triggering meteor animation
    // This will be handled in RealMap component
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">


          {/* Simulation Parameters */}
          <SimulationParameters
            onRunSimulation={handleRunSimulation}
            onLocationChange={handleLocationChange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchLoading={isSearching}
            searchResults={searchResults}
          />

        </aside>
        <main className="dashboard-main">
          <div className="visualization-panel">
            <div className="panel-header">
              <h3>Selected Impact Zone</h3>
              <span className="impact-zone-label">
                {getLocationDisplayName(selectedLocation)}
              </span>
            </div>
            <div className="earth-container">
              <Suspense fallback={<div className="loading-spinner"></div>}>
                <RealMap
                  selectedLocation={selectedLocation}
                  selectedAsteroid={selectedAsteroid}
                  simulationTrigger={simulationTrigger}
                  simulationParams={simulationParams}
                  zoom={0.5}
                  center={{ lat: 0, lng: 0 }}
                />
              </Suspense>
            </div>
          </div>
          <div className="results-section">
            <div className="results-grid">
              <PreliminaryResults impactData={impactData} />
              <PopulationImpact impactData={impactData} />
              <EnvironmentalImpact
                impactData={impactData}
                simulationParams={simulationParams}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="story-footer">
        <div className="footer-container">
          <div className="footer-logo">
            <div className="logo-icon">
              <span className="logo-text">IE</span>
            </div>
            <span className="logo-title">Impact Explorer 2025</span>
            <p className="footer-description">
              Simulating asteroid impacts on Earth using
              real NASA data for research and
              education.
            </p>
          </div>

          <div className="footer-nav">
            <h4>Navigation</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/story">Story Mode</a></li>
              <li><a href="/dashboard">Simulation Dashboard</a></li>
              <li><a href="/results">Impact Results</a></li>
            </ul>
          </div>

          <div className="footer-sources">
            <h4>Data Sources</h4>
            <ul>
              <li><a href="https://cneos.jpl.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA CNEOS</a></li>
              <li><a href="https://ssd.jpl.nasa.gov/" target="_blank" rel="noopener noreferrer">JPL Small-Body Database</a></li>
              <li><a href="https://neo.ssa.esa.int/" target="_blank" rel="noopener noreferrer">NASA NEO Program</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Impact Explorer 2025. All rights reserved.</p>
          <p>Powered by NASA data. This is a simulation tool for educational purposes.</p>
        </div>
      </footer>

    </div>
  );
}

export default Dashboard;