"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Map initialization function
    const initMap = () => {
      const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        center: { lat: 1.3521, lng: 103.8198 },
        zoom: 11,
      });
    };

    // Dynamically load Google Maps JS API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`; //API Key Required!!
    script.async = true;
    window.initMap = initMap;
    document.body.appendChild(script);

    // Cleanup on unmount
return () => {
  window.initMap = undefined;
};
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-gray-900 text-white py-4 text-center text-lg font-semibold">
        IJOOZ Delivery Route Optimizer
      </header>

      <div id="map" className="w-full h-[60vh]" />

      <div className="bg-gray-100 px-4 py-6">
        <div className="flex justify-between text-sm text-gray-700 font-medium mb-4">
          <span>4 Stops</span>
          <span>Total Trip: 25 mins</span>
        </div>

        <div className="space-y-2">
          {["Location A", "Location B", "Location C", "Location D"].map((loc, i) => (
            <div key={i} className="bg-white text-black rounded shadow-sm px-4 py-2 flex justify-between text-sm">
              <span>{`IJOOZ ${loc}`}</span>
              <span>Address</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-gray-200 text-center text-xs text-gray-600 py-3 mt-auto">
        &copy; 2025 IJOOZ Route Optimization App
      </footer>
    </div>
  );
}
