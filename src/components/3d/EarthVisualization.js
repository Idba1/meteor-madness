import React, { useEffect, useRef } from "react";
import { Map, MapStyle, Marker, config } from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./Map.scss";
import { useAppContext } from "../../context/AppContext";

export default function EarthVisualization() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const explosionRef = useRef(null);

  const { state } = useAppContext();

  console.log(state);

  const { impactArea, simulationParams } = state;

  // Initialize Map
  useEffect(() => {
    const container = mapContainer.current;
    if (!container) return;

    config.apiKey = "4xlqmw5O239jIs3v38vu";
    const coords = [impactArea?.lng || 90.368603, impactArea?.lat || 23.807133];

    const map = new Map({
      container,
      style: MapStyle.BASIC,
      center: coords,
      zoom: 4,
      minZoom: 4,
      maxZoom: 4,
      projection: "globe",
      interactive: false,
      customControls: false,
      cooperativeGestures: false,
      geolocateControl: false,
      scaleControl: false,
      terrainControl: false,
      navigationControl: false

    });

    mapRef.current = map;
    let animationId = null;

    const showImpact = (area) => {
      if (!mapRef.current || !area) return;

      if (explosionRef.current) explosionRef.current.remove();

      const explosionEl = document.createElement("div");
      explosionEl.className = "impact-explosion";
      explosionEl.style.position = "absolute";
      explosionEl.style.pointerEvents = "none";
      explosionEl.style.zIndex = 20;

      for (let i = 0; i < 8; i++) {
        const debris = document.createElement("div");
        debris.className = "impact-debris";
        debris.style.left = "50%";
        debris.style.top = "50%";
        debris.style.transform = `rotate(${45 * i}deg)`;
        explosionEl.appendChild(debris);
      }

      mapContainer.current.appendChild(explosionEl);
      explosionRef.current = explosionEl;

      const updatePosition = () => {
        if (!mapRef.current || !explosionRef.current) return;
        const pixel = mapRef.current.project([area.lng, area.lat]);
        explosionEl.style.left = `${pixel.x}px`;
        explosionEl.style.top = `${pixel.y}px`;
        animationId = requestAnimationFrame(updatePosition);
      };
      updatePosition();
    };

    const addMarker = (area) => {
      if (!mapRef.current || !area) return;
      if (markerRef.current) markerRef.current.remove();

      const marker = new Marker({ color: "red" })
        .setLngLat([area.lng, area.lat])
        .addTo(mapRef.current);

      markerRef.current = marker;

      mapRef.current.flyTo({ center: [area.lng, area.lat], zoom: 5, speed: 0.8 });
    };

    map.on("load", () => {
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 90.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });

      if (impactArea && impactArea.lng && impactArea.lat) {
        addMarker(impactArea);
        showImpact(impactArea);
      }
    });

    // Cleanup
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (map) {
        try {
          map.off(); // only call if map exists
          map.remove();
        } catch (err) {
          console.warn("Map cleanup error:", err);
        }
      }
      mapRef.current = null;
    };
  }, [impactArea]);


  // Update marker when impactArea changes
  useEffect(() => {
    if (!mapRef.current || !impactArea) return;

    addMarker(impactArea);
    showImpact(impactArea);
  }, [impactArea]);

  // Function to add marker at given coordinates
  const addMarker = (area) => {
    if (!mapRef.current || !area) return;
    if (markerRef.current) markerRef.current.remove();

    const marker = new Marker({ color: "red" })
      .setLngLat([area.lng, area.lat])
      .addTo(mapRef.current);

    markerRef.current = marker;

    mapRef.current.flyTo({ center: [area.lng, area.lat], zoom: 5, speed: 0.8 });
  };

  // Function to show impact/explosion
  const showImpact = (area) => {
    if (!mapRef.current || !area) return;

    if (explosionRef.current) explosionRef.current.remove();

    const explosionEl = document.createElement("div");
    explosionEl.className = "impact-explosion";
    explosionEl.style.position = "absolute";
    explosionEl.style.pointerEvents = "none";
    explosionEl.style.zIndex = 20;

    for (let i = 0; i < 8; i++) {
      const debris = document.createElement("div");
      debris.className = "impact-debris";
      debris.style.left = "50%";
      debris.style.top = "50%";
      debris.style.transform = `rotate(${45 * i}deg)`;
      explosionEl.appendChild(debris);
    }

    mapContainer.current.appendChild(explosionEl);
    explosionRef.current = explosionEl;

    const updatePosition = () => {
      if (!mapRef.current || !explosionRef.current) return;
      const pixel = mapRef.current.project([area.lng, area.lat]);
      explosionEl.style.left = `${pixel.x}px`;
      explosionEl.style.top = `${pixel.y}px`;
      requestAnimationFrame(updatePosition);
    };
    updatePosition();
  };

  return (
    <div
      ref={mapContainer}
      className="real-map-container"
      style={{ width: "50vw", height: "80vh", position: "relative" }}
    >
      {/* Overlay text */}
      {/* Overlay text */}
      {simulationParams?.location && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "white",
            background: "rgba(0,0,0,0.5)",
            padding: "5px 10px",
            borderRadius: "5px",
            zIndex: 30,
            fontWeight: "bold",
          }}
        >
          {simulationParams.location}
        </div>
      )}

    </div>
  );
}
