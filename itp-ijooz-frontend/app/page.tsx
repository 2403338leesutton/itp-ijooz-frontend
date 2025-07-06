"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [selectedStop, setSelectedStop] = useState<null | {
    name: string;
    address: string;
    eta: string;
    status: string;
    lat: number;
    lng: number;
  }>(null);

  const stops = [
    {
      name: "IJOOZ Location A",
      lat: 1.3402,
      lng: 103.8303,
      address: "648305",
      eta: "09:50",
      status: "In Progress",
    },
    {
      name: "IJOOZ Location B",
      lat: 1.3502,
      lng: 103.819,
      address: "648310",
      eta: "10:15",
      status: "Pending",
    },
    {
      name: "IJOOZ Location C",
      lat: 1.3605,
      lng: 103.81,
      address: "648320",
      eta: "10:40",
      status: "Pending",
    },
    {
      name: "IJOOZ Location D",
      lat: 1.3308,
      lng: 103.8485,
      address: "648330",
      eta: "11:00",
      status: "Pending",
    },
  ];

  useEffect(() => {
    // Map initialization function
    const initMap = () => {
      const map = new google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
          center: { lat: 1.3521, lng: 103.8198 },
          zoom: 11,
        }
      );

      // Add markers
      stops.forEach((stop) => {
        new google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map,
          title: stop.name,
        });
      });
    };

    // Dynamically load Google Maps JS API
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA-6lWqnsNnXubz9yi4CFXAAwUkd0Oyv4M&callback=initMap";

    script.async = true;
    window.initMap = initMap;
    document.body.appendChild(script);

    return () => {
      window.initMap = undefined;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-black">
      {/* Header */}
      <header className="bg-gray-900 text-white py-3 text-center text-base sm:text-lg font-semibold">
        IJOOZ Delivery Route Optimizer
      </header>

      {/* Map */}
      <div id="map" className="w-full h-[300px] sm:h-[60vh]" />

      {/* Stop List */}
      <div className="bg-gray-100 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-700 font-medium mb-3">
          <span>{stops.length} Stops</span>
          <span className="mt-1 sm:mt-0">Total Trip: 25 mins</span>
        </div>

        <div className="space-y-3">
          {stops.map((stop, i) => (
            <button
              key={i}
              onClick={() => setSelectedStop(stop)}
              className="w-full text-left bg-white text-black rounded-md shadow-sm px-4 py-3 flex justify-between items-center text-sm"
            >
              <span>{stop.name}</span>
              <span className="text-xs text-gray-500">{stop.address}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stop Details Panel */}
      {selectedStop && (
        <div className="bg-white fixed bottom-0 left-0 right-0 p-4 border-t shadow-lg rounded-t-lg z-10">
          <div className="text-sm font-semibold text-blue-800 mb-2">
            {selectedStop.name}
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Address: {selectedStop.address}
          </div>
          <div className="text-xs text-gray-600 mb-2">
            ETA: {selectedStop.eta}
          </div>
          <div className="text-xs text-gray-600 mb-4">
            Status: {selectedStop.status}
          </div>

          <div className="grid grid-cols-4 gap-3 text-white text-sm font-medium">
            <button className="bg-gray-700 rounded py-2">📷</button>
            <button className="bg-green-600 rounded py-2">✔️</button>
            <button className="bg-red-600 rounded py-2">❌</button>
            <button className="bg-purple-500 rounded py-2">📦</button>
          </div>

          <button
            onClick={() => setSelectedStop(null)}
            className="block w-full text-center mt-4 text-sm text-blue-500"
          >
            Close
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-200 text-center text-xs text-gray-600 py-3 mt-auto">
        &copy; 2025 IJOOZ Route Optimization App
      </footer>
    </div>
  );
}
