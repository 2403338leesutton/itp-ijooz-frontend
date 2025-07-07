"use client";

import { useEffect, useState } from "react";

const stops = [
  { name: "IJOOZ Location A", lat: 1.3402, lng: 103.8303, address: "648310", eta: "10:15", status: "Pending" },
  { name: "IJOOZ Location B", lat: 1.3502, lng: 103.819, address: "648320", eta: "10:20", status: "Pending" },
  { name: "IJOOZ Location C", lat: 1.3605, lng: 103.81, address: "648330", eta: "10:30", status: "Pending" },
  { name: "IJOOZ Location D", lat: 1.3308, lng: 103.8485, address: "648340", eta: "10:40", status: "Pending" },
];

export default function Home() {
  const [selectedStop, setSelectedStop] = useState<any>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window.google !== "undefined") {
        initMap();
      } else {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA-6lWqnsNnXubz9yi4CFXAAwUkd0Oyv4M&callback=initMap`;
        script.async = true;
        document.body.appendChild(script);
        (window as any).initMap = initMap;
      }
    };

    const initMap = () => {
      const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        center: stops[0],
        zoom: 13,
      });

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
      directionsRenderer.setMap(map);

      const waypoints = stops.slice(1, -1).map((stop) => ({
        location: { lat: stop.lat, lng: stop.lng },
        stopover: true,
      }));

      directionsService.route(
        {
          origin: stops[0],
          destination: stops[stops.length - 1],
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer.setDirections(result);
          }
        }
      );

      stops.forEach((stop, index) => {
        const marker = new google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map,
          label: {
            text: String.fromCharCode(65 + index),
            color: "white",
            fontWeight: "bold",
          },
        });

        marker.addListener("click", () => setSelectedStop(stop));
      });
    };

    if (typeof window !== "undefined") {
      loadGoogleMaps();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-black">
      <header className="bg-gray-900 text-white py-3 text-center text-base sm:text-lg font-semibold">
        IJOOZ Delivery Route Optimizer
      </header>

      <div id="map" className="w-full h-[300px] sm:h-[60vh]" />

      <div className="bg-gray-100 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-700 font-medium mb-3">
          <span>{stops.length} Stops</span>
          <span className="mt-1 sm:mt-0">Total Trip: 25 mins</span>
        </div>

        <div className="space-y-3">
          {stops.map((stop, i) => (
            <div
              key={i}
              className="bg-white text-black rounded-md shadow-sm px-4 py-3 flex justify-between items-center text-sm cursor-pointer"
              onClick={() => setSelectedStop(stop)}
            >
              <span>{stop.name}</span>
              <span className="text-xs text-gray-500">{stop.address}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedStop && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-5 shadow-xl z-50">
          <h2 className="text-blue-700 text-lg font-semibold">{selectedStop.name}</h2>
          <p className="text-sm">
            <strong>Address:</strong> {selectedStop.address}
            <br />
            <strong>ETA:</strong> {selectedStop.eta}
            <br />
            <strong>Status:</strong> {selectedStop.status}
          </p>
          <div className="grid grid-cols-4 gap-4 mt-4 mb-4">
            <button className="bg-gray-800 text-white text-xl py-2 rounded-md">📷</button>
            <button className="bg-green-500 text-white text-xl py-2 rounded-md">✔️</button>
            <button className="bg-red-500 text-white text-xl py-2 rounded-md">❌</button>
            <button className="bg-purple-500 text-white text-xl py-2 rounded-md">📦</button>
          </div>
          <button
            onClick={() => setSelectedStop(null)}
            className="w-full text-center text-blue-700 font-medium border-t pt-3"
          >
            Close
          </button>
        </div>
      )}

      <footer className="bg-gray-200 text-center text-xs text-gray-600 py-3 mt-auto">
        &copy; 2025 IJOOZ Route Optimization App
      </footer>
    </div>
  );
}
