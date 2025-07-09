"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const IJOOZ_HQ = {
  name: "IJOOZ HQ",
  lat: 1.4375,
  lng: 103.8355,
  address: "768736",
  eta: "10:00",
  status: "Start",
};

const initialStops = [
  { name: "IM1l1O04", address: "628555", lat: 1.3218, lng: 103.7071, status: "Pending" },
  { name: "IM1l1O05", address: "639441", lat: 1.3324, lng: 103.6938, status: "Pending" },
  { name: "IM1l1O64", address: "768731", lat: 1.4385, lng: 103.8350, status: "Pending" },
  { name: "IM1l1O57", address: "768738", lat: 1.4390, lng: 103.8340, status: "Pending" },
  { name: "IM1l1O76", address: "819651", lat: 1.3570, lng: 103.9870, status: "Pending" },
];

export default function Home() {
  const [stops, setStops] = useState(initialStops);
  const [etas, setEtas] = useState<string[]>([]);
  const [selectedStop, setSelectedStop] = useState<any>(null);
  const [totalDuration, setTotalDuration] = useState<string>("");

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
        center: IJOOZ_HQ,
        zoom: 12,
      });

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#4285F4",
          strokeOpacity: 0.7,
          strokeWeight: 5,
          icons: [{
            icon: {
              path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
              scale: 2,
              strokeOpacity: 1,
            },
            offset: "100%",
            repeat: "100px",
          }],
        },
      });
      directionsRenderer.setMap(map);

      const allStops = [IJOOZ_HQ, ...stops, IJOOZ_HQ];
      const waypoints = allStops.slice(1, -1).map((stop) => ({
        location: { lat: stop.lat, lng: stop.lng },
        stopover: true,
      }));

      directionsService.route(
        {
          origin: allStops[0],
          destination: allStops[allStops.length - 1],
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer.setDirections(result);
            const routeLegs = result.routes[0].legs;

            const totalSecs = routeLegs.reduce((sum, leg) => sum + leg.duration.value, 0);
            const mins = Math.round(totalSecs / 60);
            setTotalDuration(`${mins} mins`);

            const etaBase = new Date();
            etaBase.setHours(10, 0, 0, 0); // Start time 10:00 AM

            const newEtas: string[] = [];
            let accumulated = 0;
            for (let i = 0; i < stops.length; i++) {
              accumulated += routeLegs[i].duration.value;
              const eta = new Date(etaBase.getTime() + accumulated * 1000);
              newEtas.push(`${eta.getHours().toString().padStart(2, "0")}:${eta.getMinutes().toString().padStart(2, "0")}`);
            }
            setEtas(newEtas);

            // Marker A
            const markerA = new google.maps.Marker({
              position: routeLegs[0].start_location,
              map,
              label: { text: "A", color: "white", fontWeight: "bold" },
            });
            markerA.addListener("click", () => setSelectedStop({ ...IJOOZ_HQ, eta: "10:00" }));

            // Markers B onwards
            for (let i = 0; i < stops.length; i++) {
              const marker = new google.maps.Marker({
                position: routeLegs[i].end_location,
                map,
                label: { text: String.fromCharCode(66 + i), color: "white", fontWeight: "bold" },
              });
              marker.addListener("click", () =>
                setSelectedStop({ ...stops[i], eta: newEtas[i] })
              );
            }
          }
        }
      );
    };

    if (typeof window !== "undefined") {
      loadGoogleMaps();
    }
  }, [stops]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(stops);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setStops(reordered);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-black">
      <header className="bg-gray-900 text-white py-3 text-center text-base sm:text-lg font-semibold">
        IJOOZ Delivery Route Optimizer
      </header>

      <div id="map" className="w-full h-[300px] sm:h-[60vh]" />

      <div className="bg-gray-100 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-700 font-medium mb-3">
          <span>{stops.length + 1} Stops (incl. IJOOZ HQ)</span>
          <span className="mt-1 sm:mt-0">Total Trip: {totalDuration}</span>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="stops">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {[IJOOZ_HQ, ...stops].map((stop, i) => {
                  const isDraggable = i !== 0;
                  const eta = i === 0 ? "10:00" : etas[i - 1] || "--:--";
                  return isDraggable ? (
                    <Draggable key={i} draggableId={i.toString()} index={i - 1}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setSelectedStop({ ...stop, eta })}
                          className="bg-white text-black rounded-md shadow-sm px-4 py-3 flex justify-between items-center text-sm cursor-pointer"
                        >
                          <span>{stop.name}</span>
                          <span className="text-xs text-gray-500">{stop.address}</span>
                        </div>
                      )}
                    </Draggable>
                  ) : (
                    <div
                      key={i}
                      className="bg-white text-black rounded-md shadow-sm px-4 py-3 flex justify-between items-center text-sm"
                      onClick={() => setSelectedStop({ ...stop, eta })}
                    >
                      <span>{stop.name}</span>
                      <span className="text-xs text-gray-500">{stop.address}</span>
                    </div>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
