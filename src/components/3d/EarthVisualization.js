import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';

// Import textures
import earth_bump from '../../assets/textures/earth_bump.jpg';
import earth_cloud from '../../assets/textures/earth_cloud.png';
import earth_lights from '../../assets/textures/earth_lights.jpg';
import earth_spec from '../../assets/textures/earth_spec.jpg';
import craterTexture from '../../assets/textures/crater.png';

function Earth({ impactData }) {
  const earthRef = useRef();
  const atmosphereRef = useRef();
  const cloudsRef = useRef();
  const impactMeshRef = useRef();

  // Load textures
  const [bumpMap, cloudMap, lightsMap, specMap, craterMap] = useLoader(
    TextureLoader,
    [earth_bump, earth_cloud, earth_lights, earth_spec, craterTexture]
  );

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.003; // Slow rotation
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.002; // Slightly different speed for clouds
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.001; // Very slow atmospheric rotation
    }

    if (impactData && impactMeshRef.current) {
      // Rotate impact mesh with earth
      impactMeshRef.current.rotation.y = earthRef.current.rotation.y;
    }
  });

  const earthRadius = 2;
  let impactPosition = null;
  let impactScale = [0, 0, 0];

  if (impactData) {
    const latitude = impactData.latitude;
    const longitude = impactData.longitude;
    const blastRadius = parseFloat(impactData.blastRadius) || 0;

    // Convert lat/lon to 3D Cartesian coordinates
    const latRad = latitude * (Math.PI / 180);
    const lonRad = -longitude * (Math.PI / 180); // Negative for Three.js coordinate system

    const x = earthRadius * Math.cos(latRad) * Math.cos(lonRad);
    const y = earthRadius * Math.sin(latRad);
    const z = earthRadius * Math.cos(latRad) * Math.sin(lonRad);
    impactPosition = new THREE.Vector3(x, y, z);

    // Scale impact effect based on blast radius
    const baseImpactSize = 0.1; // A base size for the crater
    const scaleFactor = blastRadius / 100; // Adjust as needed
    const impactSize = baseImpactSize + scaleFactor;
    impactScale = [impactSize, impactSize, 1]; // Z-scale can be adjusted for depth
  }

  return (
    <group>
      {/* Earth surface */}
      <Sphere ref={earthRef} args={[earthRadius, 64, 64]}>
        <meshPhongMaterial
          map={new THREE.TextureLoader().load('/assets/textures/earth_lights.jpg')} // Base color map
          bumpMap={bumpMap}
          bumpScale={0.05} // Adjust bumpiness
          specularMap={specMap}
          specular="#555555"
          shininess={10}
        />
      </Sphere>

      {/* Cloud layer */}
      <Sphere ref={cloudsRef} args={[earthRadius * 1.01, 32, 32]}>
        <meshLambertMaterial
          map={cloudMap}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </Sphere>

      {/* Atmospheric glow */}
      <Sphere ref={atmosphereRef} args={[earthRadius * 1.05, 32, 32]}>
        <meshBasicMaterial
          color="#87ceeb"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </Sphere>

      {/* Impact Crater/Mark */}
      {impactPosition && (
        <mesh ref={impactMeshRef} position={impactPosition} scale={impactScale}>
          <planeGeometry args={[1, 1]} /> {/* A plane for the crater texture */}
          <meshBasicMaterial
            map={craterMap}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

function Asteroid() {
  const asteroidRef = useRef();
  const [time, setTime] = useState(0);

  useFrame((state) => {
    setTime(state.clock.elapsedTime);
    if (asteroidRef.current) {
      // Orbital motion around Earth
      const radius = 6;
      const speed = 0.5;
      asteroidRef.current.position.x = Math.cos(time * speed) * radius;
      asteroidRef.current.position.z = Math.sin(time * speed) * radius;
      asteroidRef.current.position.y = Math.sin(time * speed * 0.5) * 2;

      // Rotation
      asteroidRef.current.rotation.x += 0.01;
      asteroidRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={asteroidRef}>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#ff4400ff" roughness={0.8} metalness={0.2} />
    </mesh>
  );
}

function TrajectoryLine() {
  const points = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const angle = t * Math.PI * 4;
    const radius = 6 - t * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(angle * 0.5) * 2;
    points.push(new THREE.Vector3(x, y, z));
  }

  return (
    <Line
      points={points}
      color="#00d4ff"
      lineWidth={2}
      dashed={true}
      dashSize={0.1}
      gapSize={0.05}
    />
  );
}

function Starfield() {
  const starsRef = useRef();

  const starPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 2000; i++) {
      // Generate random positions in a sphere
      const radius = 100 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        sizeAttenuation={true}
        color="#ffffff"
        transparent
        opacity={0.8}
      />
    </points>
  );
}

function EarthVisualization({ impactData }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [8, 4, 8], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting setup for realistic Earth */}
        <ambientLight intensity={0.15} color="#404080" />
        <directionalLight
          position={[10, 0, 5]}
          intensity={1.2}
          color="#ffffff"
          castShadow
        />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.3}
          color="#4040ff"
        />

        {/* Space background */}
        <mesh>
          <sphereGeometry args={[200, 32, 32]} />
          <meshBasicMaterial
            color="#000005"
            side={THREE.BackSide}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Starfield */}
        <Starfield />

        <Earth impactData={impactData} /> {/* Pass impactData to Earth component */}
        <Asteroid />
        <TrajectoryLine />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.3}
          maxDistance={15}
          minDistance={5}
          maxPolarAngle={Math.PI * 0.8}
          minPolarAngle={Math.PI * 0.2}
        />
      </Canvas>

      {/* Impact point indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(255, 107, 53, 0.15)',
        border: '1px solid rgba(255, 107, 53, 0.4)',
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        color: '#ff6b35',
        fontSize: '0.85rem',
        fontWeight: '600',
        textShadow: '0 0 10px rgba(255, 107, 53, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ff6b35',
            boxShadow: '0 0 10px #ff6b35',
            animation: 'pulse 2s infinite'
          }}></div>
          IMPACT ZONE: {impactData?.latitude ? `Lat ${impactData.latitude.toFixed(2)}, Lng ${impactData.longitude.toFixed(2)}` : 'Pacific Ocean'}
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}

export default EarthVisualization;