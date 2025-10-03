import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navigation from './components/common/Navigation';
import Home from './pages/Home';
import StoryMode from './pages/StoryMode';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import './styles/main.scss';
import Chatbot from './components/chat/Chat';

function App() {
  useEffect(() => {
    // Always apply dark mode theme to document
    document.documentElement.classList.add('dark-mode');
    document.documentElement.classList.remove('light-mode');
  }, []);

  return (
    <AppProvider>
      <Router future={{
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,

      }}>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/story" element={<StoryMode />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/results" element={<Results />} />
          </Routes>
          <Chatbot />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;