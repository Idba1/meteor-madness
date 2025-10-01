import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

const AppContext = createContext();

const initialState = {
  asteroidData: [],
  selectedAsteroid: null,
  simulationParams: {
    diameter: 250,
    velocity: 19.3,
    angle: 45,
    location: 'Ocean (Pacific)',
    coordinates: { lat: 0, lng: 180 }
  },
  simulationResults: null,
  threatLevel: 'Medium',
  isLoading: false,
  error: null,
  userPreferences: {
    units: 'metric',
    notifications: true
  },
  impactData: null // Added impactData to initial state
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_ASTEROID_DATA':
      return { ...state, asteroidData: action.payload, isLoading: false };
    case 'SELECT_ASTEROID':
      return { ...state, selectedAsteroid: action.payload };
    case 'UPDATE_SIMULATION_PARAMS':
      return {
        ...state,
        simulationParams: { ...state.simulationParams, ...action.payload }
      };
    case 'SET_SIMULATION_RESULTS':
      return { ...state, simulationResults: action.payload };
    case 'SET_THREAT_LEVEL':
      return { ...state, threatLevel: action.payload };
    case 'SET_IMPACT_DATA': // New case for impact data
      return { ...state, impactData: action.payload };
    case 'UPDATE_USER_PREFERENCES':
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('meteorMadnessPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: preferences });
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }
  }, []);

  // Save user preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('meteorMadnessPreferences', JSON.stringify(state.userPreferences));
  }, [state.userPreferences]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}