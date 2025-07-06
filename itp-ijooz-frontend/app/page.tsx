"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Map initialization function
    const initMap = () => {
      const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        center: { lat: 1.3521, lng: 103.8198 }, // Singapore
        zoom: 11,
      });

      // Define stop coordinates
      const stops = [
        { name: "IJOOZ Location A", lat: 1.3402, lng: 103.8303 },
        { name: "IJOOZ Location B", lat: 1.3502, lng: 103.8190 },
        { name: "IJOOZ Location C", lat: 1.3605, lng: 103.8100 },
        { name: "IJOOZ Location D", lat: 1.3308, lng: 103.8485 },
      ];

      // Add a marker for each stop
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA96Du2_ijP7FHHrmceHobAo79VMyOxDt4&callback=initMap`;
    script.async = true;
    window.initMap = initMap;
    document.body.appendChild(script);

    // Cleanup on unmount
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

      {/* Google Map */}
      <div id="map" className="w-full h-[300px] sm:h-[60vh]" />

      {/* Stop List */}
      <div className="bg-gray-100 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-700 font-medium mb-3">
          <span>4 Stops</span>
          <span className="mt-1 sm:mt-0">Total Trip: 25 mins</span>
        </div>

        <div className="space-y-3">
          {["Location A", "Location B", "Location C", "Location D"].map((loc, i) => (
            <div
              key={i}
              className="bg-white text-black rounded-md shadow-sm px-4 py-3 flex justify-between items-center text-sm"
            >
              <span>{`IJOOZ ${loc}`}</span>
              <span className="text-xs text-gray-500">Address</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 text-center text-xs text-gray-600 py-3 mt-auto">
        &copy; 2025 IJOOZ Route Optimization App
      </footer>
    </div>
  );
}
