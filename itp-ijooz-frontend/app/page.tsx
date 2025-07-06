"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const initMap = () => {
      const stops = [
        { name: "IJOOZ Location A", lat: 1.3402, lng: 103.8303 },
        { name: "IJOOZ Location B", lat: 1.3502, lng: 103.8190 },
        { name: "IJOOZ Location C", lat: 1.3605, lng: 103.8100 },
        { name: "IJOOZ Location D", lat: 1.3308, lng: 103.8485 },
      ];

      // @ts-ignore
      const map = new google.maps.Map(document.getElementById("map"), {
        center: stops[0],
        zoom: 13,
      });

      // @ts-ignore
      const directionsService = new google.maps.DirectionsService();
      // @ts-ignore
      const directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: false });
      directionsRenderer.setMap(map);

      // Set up waypoints (exclude first and last)
      const waypoints = stops.slice(1, -1).map((stop) => ({
        location: { lat: stop.lat, lng: stop.lng },
        stopover: true,
      }));

      directionsService.route(
        {
          origin: stops[0],
          destination: stops[stops.length - 1],
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer.setDirections(result);
          } else {
            console.error("Directions request failed due to:", status);
          }
        }
      );
    };

    // Load Google Maps JS API
    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyA-6lWqnsNnXubz9yi4CFXAAwUkd0Oyv4M&callback=initMap";
    script.async = true;
    script.defer = true;

    // @ts-ignore
    window.initMap = initMap;
    document.body.appendChild(script);

    return () => {
      // @ts-ignore
      window.initMap = undefined;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-black">
      <header className="bg-gray-900 text-white py-3 text-center text-base sm:text-lg font-semibold">
        IJOOZ Delivery Route Optimizer
      </header>

      <div id="map" className="w-full h-[300px] sm:h-[60vh]" />

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

      <footer className="bg-gray-200 text-center text-xs text-gray-600 py-3 mt-auto">
        &copy; 2025 IJOOZ Route Optimization App
      </footer>
    </div>
  );
}
