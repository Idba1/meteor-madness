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
  const isRemoved = useRef(false); // 🚨 new guard flag

  const { state } = useAppContext();
  const { impactArea } = state;

  const addMarker = (area) => {
    if (!mapRef.current || !area) return;
    if (markerRef.current) markerRef.current.remove();

    const marker = new Marker({ color: "red" })
      .setLngLat([area.lng, area.lat])
      .addTo(mapRef.current);

    markerRef.current = marker;
    mapRef.current.flyTo({ center: [area.lng, area.lat], zoom: 5, speed: 0.8 });
  };

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

  useEffect(() => {
    if (mapRef.current) return;

    const container = mapContainer.current;
    if (!container) return;

    config.apiKey = "4xlqmw5O239jIs3v38vu";
    const coords = [impactArea?.lng || 90.368603, impactArea?.lat || 23.807133];

    const map = new Map({
      container: container,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${config.apiKey}`,
      center: coords,
      zoom: 4,
      minZoom: 4,
      maxZoom: 4,
      projection: "globe",
      bearing: 0,
      pitch: 0,
      interactive: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      if (isRemoved.current) return; // avoid running after unmount
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 90.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });

      if (impactArea?.lng && impactArea?.lat) {
        addMarker(impactArea);
        showImpact(impactArea);
      }
    });

    return () => {
      if (!mapRef.current || isRemoved.current) return;
      try {
        mapRef.current.remove();
      } catch (err) {
        console.debug("Map already cleaned:", err?.message);
      }
      isRemoved.current = true;
      mapRef.current = null;

      if (explosionRef.current) {
        explosionRef.current.remove();
        explosionRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !impactArea) return;
    addMarker(impactArea);
    showImpact(impactArea);
  }, [impactArea]);

  return (
    <div
      ref={mapContainer}
      className="real-map-container"
      style={{ width: "50vw", height: "80vh", position: "relative" }}
    />
  );
}
