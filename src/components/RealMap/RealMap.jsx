import React, { useEffect, useRef } from "react";
import { Map, MapStyle, config } from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./RealMap.scss";
import locations from '../../data/locations.json';

export default function RealMap({ selectedLocation, selectedAsteroid, simulationTrigger, simulationParams }) {
    const size = 200;
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const currentLocationRef = useRef(selectedLocation);

    useEffect(() => {
        // Wait for DOM to be ready and check container
        const initializeMap = () => {
            const container = mapContainer.current;
            if (!container) {
                console.error("Map container not found");
                return;
            }

            // Ensure container has dimensions
            if (container.offsetWidth === 0 || container.offsetHeight === 0) {
                console.warn("Map container has no dimensions, retrying...");
                setTimeout(initializeMap, 100);
                return;
            }

            const coords = [90.368603, 23.807133];
            config.apiKey = '4xlqmw5O239jIs3v38vu';

            let map;
            try {
                map = new Map({
                    container: container,
                    style: MapStyle.BASIC,
                    center: coords,
                    zoom: 1.8,
                    minZoom: 0.5,
                    maxZoom: 18,
                    projection: "globe",
                    bearing: 0,
                    pitch: 0
                });

                // Store map reference
                mapRef.current = map;
                const pulsingDot = {
                    width: size,
                    height: size,
                    data: new Uint8Array(size * size * 4),
                    onAdd: function () {
                        const canvas = document.createElement('canvas');
                        canvas.width = this.width;
                        canvas.height = this.height;
                        this.context = canvas.getContext('2d');
                    },

                    // called once before every frame where the icon will be used
                    render: function () {
                        const duration = 1000;
                        const t = (performance.now() % duration) / duration;

                        const radius = (size / 2) * 0.3;
                        const outerRadius = (size / 2) * 0.7 * t + radius;
                        const context = this.context;

                        // draw outer circle
                        context.clearRect(0, 0, this.width, this.height);
                        context.beginPath();
                        context.arc(
                            this.width / 2,
                            this.height / 2,
                            outerRadius,
                            0,
                            Math.PI * 2
                        );
                        context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
                        context.fill();

                        // draw inner circle
                        context.beginPath();
                        context.arc(
                            this.width / 2,
                            this.height / 2,
                            radius,
                            0,
                            Math.PI * 2
                        );
                        context.fillStyle = 'rgba(255, 100, 100, 1)';
                        context.strokeStyle = 'white';
                        context.lineWidth = 2 + 4 * (1 - t);
                        context.fill();
                        context.stroke();
                        this.data = context.getImageData(
                            0,
                            0,
                            this.width,
                            this.height
                        ).data;
                        map.triggerRepaint();
                        return true;
                    }
                };
                map.on("load", () => {

                    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

                    map.addSource('points', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: [
                                {
                                    type: 'Feature',
                                    geometry: { type: 'Point', coordinates: coords }
                                }
                            ]
                        }
                    });

                    map.addLayer({
                        id: 'points',
                        type: 'symbol',
                        source: 'points',
                        layout: { 'icon-image': 'pulsing-dot' }
                    });

                    // Add atmospheric globe effect
                    map.addLayer({
                        id: "sky",
                        type: "sky",
                        paint: {
                            "sky-type": "atmosphere",
                            "sky-atmosphere-sun": [0.0, 90.0],
                            "sky-atmosphere-sun-intensity": 15,
                        },
                    });



                });

            } catch (error) {
                console.error('Error initializing map:', error);
                return;
            }

            return () => {
                if (map) {
                    map.remove();
                }
            };
        };

        // Initialize with a small delay to ensure DOM is ready
        const timeoutId = setTimeout(initializeMap, 100);

        return () => {
            clearTimeout(timeoutId);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Helper function to get coordinates from selectedLocation
    const getTargetCoordinates = (selectedLocation) => {
        console.log('Getting coordinates for location:', selectedLocation);

        if (typeof selectedLocation === 'object' && selectedLocation.centroid) {
            const coords = [selectedLocation.centroid.lon, selectedLocation.centroid.lat];
            console.log('Using search result coordinates:', coords, 'from centroid:', selectedLocation.centroid);
            return coords;
        } else if (typeof selectedLocation === 'string' && locations[selectedLocation]) {
            const location = locations[selectedLocation];
            if (location.centroid) {
                const coords = [location.centroid.lon, location.centroid.lat];
                console.log('Using dropdown location coordinates:', coords);
                return coords;
            }
        }

        const defaultCoords = [90.368603, 23.807133]; // Default Bangladesh
        console.log('Using default coordinates:', defaultCoords);
        return defaultCoords;
    };

    // Handle location changes separately (without meteor animation)
    useEffect(() => {
        if (!mapRef.current || !selectedLocation) return;

        // Update current location ref for simulation use
        currentLocationRef.current = selectedLocation;

        // Get target coordinates using shared function
        const targetCoords = getTargetCoordinates(selectedLocation);

        // Move map to new location (no meteor animation)
        mapRef.current.flyTo({
            center: targetCoords,
            zoom: 6,
            duration: 1500,
            essential: true
        });

        // Update marker position if it exists
        if (mapRef.current.getSource('points')) {
            mapRef.current.getSource('points').setData({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: targetCoords
                    }
                }]
            });
        }
    }, [selectedLocation]);

    // Handle simulation trigger (when Run Simulation is clicked)
    useEffect(() => {
        if (!mapRef.current || !selectedAsteroid || !simulationTrigger) return;

        // Get current location from ref (updated by location useEffect)
        const currentLocation = currentLocationRef.current;
        if (!currentLocation) return;

        // Get target coordinates for meteor animation using shared function
        const targetCoords = getTargetCoordinates(currentLocation);
        console.log('Simulation: currentLocation from ref =', currentLocation);
        console.log('Simulation: targetCoords =', targetCoords);
        console.log('Simulation: map center =', mapRef.current.getCenter());

        // Don't move map again - it's already positioned by the location useEffect
        // Just start meteor animation directly

        // Store references to DOM elements for position updates
        let explosionEl = null;
        let meteorEl = null;

        // Create elaborate meteor impact effect using DOM elements
        const createMeteorEffect = () => {
            if (!mapRef.current) return; // Add null check here
            // Clean up any existing meteor/explosion elements
            const existingMeteors = mapContainer.current.querySelectorAll('.meteor-container, .impact-explosion');
            existingMeteors.forEach(meteor => meteor.remove());

            // Get target position in screen coordinates
            const targetPixel = mapRef.current.project(targetCoords);
            console.log('Meteor: targetCoords for projection =', targetCoords);
            console.log('Meteor: targetPixel screen coordinates =', targetPixel);

            // Create meteor container
            const meteorContainer = document.createElement('div');
            meteorContainer.className = 'meteor-container';
            mapContainer.current.appendChild(meteorContainer);

            // Create meteor element
            meteorEl = document.createElement('div');
            meteorEl.className = 'meteor meteor-falling';

            // Scale meteor size based on diameter (simulation parameters)
            const diameter = simulationParams?.diameter || 250;
            const meteorSize = Math.max(8, Math.min(40, diameter / 25)); // Scale 8-40px based on diameter
            meteorEl.style.width = `${meteorSize}px`;
            meteorEl.style.height = `${meteorSize}px`;

            // Position meteor at starting point based on entry angle (0° = from East, clockwise)
            const entryAngle = simulationParams?.entryAngle || 45;
            const angleRadians = (entryAngle * Math.PI) / 180;
            const distance = 500;
            // Calculate starting position - meteor comes FROM the opposite direction
            const startX = targetPixel.x - (distance * Math.cos(angleRadians));
            const startY = targetPixel.y - (distance * Math.sin(angleRadians));
            meteorEl.style.left = `${startX}px`;
            meteorEl.style.top = `${startY}px`;

            meteorContainer.appendChild(meteorEl);

            // Animate meteor falling to target
            let startTime = null;
            // Scale animation duration based on velocity (higher velocity = faster animation)
            const velocity = simulationParams?.velocity || 19.3;
            const baseDuration = 2000;
            const duration = Math.max(1000, baseDuration - (velocity - 19.3) * 50); // Faster for higher velocity

            const animateMeteor = (timestamp) => {
                if (!mapRef.current) return; // Add null check here
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);

                // Calculate current position with dynamic trajectory based on entry angle
                const targetPixelNow = mapRef.current.project(targetCoords);
                const baseX = startX + ((targetPixelNow.x - startX) * progress);
                const baseY = startY + ((targetPixelNow.y - startY) * progress);

                // Add trajectory curve effect based on entry angle
                const curveFactor = Math.sin(progress * Math.PI) * 40; // Reduced curve for more realistic path
                const entryAngleRad = (entryAngle * Math.PI) / 180;
                const currentX = baseX + (curveFactor * Math.sin(entryAngleRad));
                const currentY = baseY - (curveFactor * Math.cos(entryAngleRad));

                meteorEl.style.left = `${currentX}px`;
                meteorEl.style.top = `${currentY}px`;

                // Rotate meteor based on entry angle trajectory
                const trajectoryAngle = Math.atan2(targetPixelNow.y - startY, targetPixelNow.x - startX) * (180 / Math.PI);
                meteorEl.style.transform = `rotate(${trajectoryAngle + 45}deg)`;

                if (progress < 1) {
                    requestAnimationFrame(animateMeteor);
                } else {
                    // Impact effect
                    meteorEl.className = 'meteor meteor-impact';
                    // Create persistent explosion effect
                    explosionEl = document.createElement('div');
                    explosionEl.className = 'impact-explosion';
                    explosionEl.style.left = `${targetPixelNow.x}px`;
                    explosionEl.style.top = `${targetPixelNow.y}px`;
                    explosionEl.style.position = 'absolute';
                    explosionEl.style.pointerEvents = 'none';
                    explosionEl.style.zIndex = '20';
                    // Add debris
                    for (let i = 0; i < 8; i++) {
                        const debris = document.createElement('div');
                        debris.className = 'impact-debris';
                        debris.style.left = '50%';
                        debris.style.top = '50%';
                        debris.style.transform = `rotate(${45 * i}deg)`;
                        explosionEl.appendChild(debris);
                    }
                    mapContainer.current.appendChild(explosionEl);
                }
            };

            requestAnimationFrame(animateMeteor);

            // Listen for map move/rotate and update explosion position
            const updateExplosionPosition = () => {
                if (explosionEl && mapRef.current) { // Add null check for mapRef.current here
                    const pixel = mapRef.current.project(targetCoords);
                    explosionEl.style.left = `${pixel.x}px`;
                    explosionEl.style.top = `${pixel.y}px`;
                }
            };
            if (mapRef.current) { // Add conditional call
                mapRef.current.on('move', updateExplosionPosition);
                mapRef.current.on('rotate', updateExplosionPosition);
            }

            // Clean up listeners when location/asteroid changes
            return () => {
                if (mapRef.current) { // Add conditional call
                    mapRef.current.off('move', updateExplosionPosition);
                    mapRef.current.off('rotate', updateExplosionPosition);
                }
            };
        };

        // Start meteor animation immediately (map is already positioned)
        let cleanup;
        setTimeout(() => {
            cleanup = createMeteorEffect();
        }, 500); // Small delay for smooth transition

        // Cleanup listeners on unmount/change
        return () => {
            if (cleanup) cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAsteroid, simulationTrigger, simulationParams]); // Removed selectedLocation to prevent meteor on location change

    return (
        <div
            ref={mapContainer}
            className="real-map-container"
            style={{
                width: "50vw",
                height: "80vh",
                alignItems: "flex-start"
            }}
        />
    );
}
