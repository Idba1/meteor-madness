# Impact Explorer 2025 - Meteor Madness Frontend

A React.js frontend application for asteroid impact simulation, built with NASA's NEO (Near-Earth Object) data. This educational tool provides interactive visualizations, scientific simulations, and comprehensive impact analysis.

# Project Links

- **30-Second Video (Global Submission)**: https://youtu.be/xuDei3eb9hY
  
- **240-Second Video (Local Submission)**: https://youtu.be/gKMp6jRGYG8

- **Live Project**: https://meteor-madness-alpha.vercel.app/

- **Source Code**: https://github.com/Idba1/meteor-madness

- **Documentation**: https://docs.google.com/document/d/1oNkJomuj0Ya6wAOFs6EtIY8ITTV4zoKO9KAK8h55V80/edit
  
- **Presentation Slide**: https://www.canva.com/design/DAG0tD9C-hg/VqJi9tlBaaGIQgyoiU3gQQ/view


## 🚀 Features


### Core Modules
- **Main Dashboard**: 3D Solar System viewer with real-time NEO threat indicators
- **Simulation Interface**: Interactive asteroid parameter controls and impact location selection
- **Story Mode**: Immersive scroll-based journey from asteroid detection to impact
- **Results Display**: Comprehensive impact analysis with charts, metrics, and visualizations

### Technical Features
- **3D Visualization**: Three.js powered orbital mechanics and Earth simulation
- **Interactive Maps**: Mapbox GL JS integration for impact zone selection
- **Data Visualization**: Chart.js for impact metrics and energy graphs
- **Responsive Design**: SCSS-based responsive layout for all devices
- **Performance Optimized**: Lazy loading, React memoization, and PWA support

## 🛠️ Technology Stack

- **Framework**: React.js (JavaScript, no TypeScript)
- **3D Graphics**: Three.js with @react-three/fiber and @react-three/drei
- **2D Visualization**: D3.js for geological overlays
- **Charts**: Chart.js with react-chartjs-2
- **Maps**: Mapbox GL JS with react-map-gl
- **Physics**: Cannon.js for trajectory calculations
- **Styling**: SCSS with CSS3 animations
- **Animations**: Framer Motion
- **State Management**: React Context API
- **API Client**: Axios

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meteor-madness
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your NASA API key:
   ```
   REACT_APP_NASA_API_KEY=your_nasa_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Configuration

### NASA NEO API
Get your free API key from [NASA API Portal](https://api.nasa.gov/)

### Supported Endpoints
- **Asteroid Feed**: Recent NEO data (last 7 days or custom range)
- **Specific Asteroid Lookup**: Detailed asteroid information by ID
- **Browse NEOs**: Paginated list of all known NEOs
- **Close Approaches**: Today's close approach data
- **Statistics**: NEO database statistics

## 🎮 Usage

### Navigation
- **Home**: Landing page with hero section and feature previews
- **Story Mode**: Interactive journey of an asteroid impact
- **Dashboard**: Simulation controls and real-time visualization
- **Results**: Comprehensive impact analysis and metrics

### Running Simulations
1. Navigate to the Dashboard
2. Adjust asteroid parameters (diameter, velocity, angle)
3. Select impact location on the interactive map
4. Click "Run Simulation" to generate results
5. View detailed analysis in the Results section

### Story Mode
- Scroll through 5 interactive chapters
- Learn about asteroid detection, trajectory, and impact
- Navigate using the dot navigation on the right
- Each section includes educational content and visualizations

## 📱 Responsive Design

The application is fully responsive and supports:
- **Desktop**: Full feature experience with side-by-side layouts
- **Tablet**: Adapted grid layouts with touch-friendly controls
- **Mobile**: Single-column layout with optimized navigation

## 🎨 Design System

### Color Palette
- **Primary Background**: `#0a0a0f`
- **Secondary Background**: `#1a1a2e`
- **Accent Blue**: `#00d4ff`
- **Accent Purple**: `#8b5cf6`
- **Accent Orange**: `#ff6b35`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `rgba(255, 255, 255, 0.8)`

### Components
- **Glass Morphism**: Frosted glass effects with backdrop blur
- **Gradient Buttons**: Smooth color transitions with hover effects
- **Interactive Cards**: Hover animations and state feedback
- **Loading States**: Smooth transitions and skeleton screens

## 🏗️ Project Structure

```
src/
├── components/
│   ├── 3d/                 # Three.js visualizations
│   ├── common/             # Shared components (Navigation)
│   ├── dashboard/          # Threat indicators and controls
│   ├── home/               # Landing page components
│   ├── results/            # Results visualization components
│   └── simulation/         # Simulation interface components
├── context/                # React Context for state management
├── pages/                  # Main page components
├── services/               # API services and utilities
└── styles/                 # Global SCSS styles
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 🚀 Build and Deploy

```bash
# Create production build
npm run build

# Serve production build locally
npm install -g serve
serve -s build
```

## 🌟 Performance Features

- **Lazy Loading**: Components and 3D models loaded on demand
- **Web Workers**: Heavy calculations offloaded from UI thread
- **React Memoization**: Optimized re-renders with memo and useMemo
- **Progressive Web App**: Offline support and mobile installation
- **Code Splitting**: Automatic code splitting with React.lazy

## 🔧 Customization

### Adding New Visualizations
1. Create component in `src/components/`
2. Import Three.js or D3.js as needed
3. Add to appropriate page component
4. Update navigation if necessary

### Extending API Integration
1. Add new endpoints to `src/services/nasaApi.js`
2. Update context state management
3. Create new components for data display
4. Add error handling and loading states

### Styling Customization
1. Update CSS variables in `src/styles/main.scss`
2. Modify component-specific SCSS files
3. Add new utility classes as needed
4. Update responsive breakpoints

## 📚 Educational Content

The application includes educational content about:
- **Asteroid Detection**: How astronomers track NEOs
- **Orbital Mechanics**: Gravitational forces and trajectories
- **Impact Physics**: Energy release and crater formation
- **Planetary Defense**: Mitigation strategies and technologies
- **Scientific Data**: Real NASA mission data and research

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **NASA**: For providing the NEO API and astronomical data
- **JPL Small-Body Database**: For asteroid orbital parameters
- **Three.js Community**: For 3D visualization capabilities
- **React Community**: For the robust component ecosystem

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Powered by NASA data. This is a simulation tool for educational purposes.**
