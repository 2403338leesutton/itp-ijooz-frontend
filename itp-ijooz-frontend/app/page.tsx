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
  { name: "IM1l1O04", address: "628555", lat: 1.3218, lng: 103.7071 },
  { name: "IM1l1O05", address: "639441", lat: 1.3324, lng: 103.6938 },
  { name: "IM1l1O06", address: "639441", lat: 1.3324, lng: 103.6938 },
  { name: "IM1l1O64", address: "768731", lat: 1.4385, lng: 103.835 },
  { name: "IM1l1O57", address: "768738", lat: 1.439, lng: 103.834 },
  { name: "IM1l1O76", address: "819651", lat: 1.357, lng: 103.987 },
];

export default function Home() {
  const [stops, setStops] = useState(initialStops);
  const [selectedStop, setSelectedStop] = useState<any>(null);
  const [totalDuration, setTotalDuration] = useState("");
  const [etaStops, setEtaStops] = useState<any[]>([]);
  const [showTripSummary, setShowTripSummary] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [finalEta, setFinalEta] = useState("");

  const getEtaTime = (baseTime: Date, secondsToAdd: number) => {
    const eta = new Date(baseTime.getTime() + secondsToAdd * 1000);
    return `${eta.getHours().toString().padStart(2, "0")}:${eta
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371.0;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window.google !== "undefined") {
        initMap();
      } else {
        const script = document.createElement("script");
        script.src =
          "https://maps.googleapis.com/maps/api/js?key=AIzaSyA-6lWqnsNnXubz9yi4CFXAAwUkd0Oyv4M&callback=initMap";
        script.async = true;
        document.body.appendChild(script);
        (window as any).initMap = initMap;
      }
    };

    const initMap = () => {
      const map = new google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
          center: IJOOZ_HQ,
          zoom: 12,
        }
      );

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#4285F4",
          strokeOpacity: 0.7,
          strokeWeight: 5,
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
            const baseTime = new Date("2025-01-01T10:00:00");
            let cumulativeSeconds = 0;

            const updatedStops = stops.map((stop, i) => {
              cumulativeSeconds += routeLegs[i].duration.value;
              return {
                ...stop,
                eta: getEtaTime(baseTime, cumulativeSeconds),
                status: "Pending",
              };
            });

            // Final leg: return to HQ
            cumulativeSeconds += routeLegs[routeLegs.length - 1].duration.value;
            setFinalEta(getEtaTime(baseTime, cumulativeSeconds));

            setEtaStops(updatedStops);
            setTotalDuration(`${Math.round(cumulativeSeconds / 60)} mins`);

            let distance = 0;
            for (let i = 0; i < allStops.length - 1; i++) {
              distance += haversine(
                allStops[i].lat,
                allStops[i].lng,
                allStops[i + 1].lat,
                allStops[i + 1].lng
              );
            }
            setTotalDistance(Math.round(distance * 10) / 10);

            new google.maps.Marker({
              position: routeLegs[0].start_location,
              map,
              label: { text: "A", color: "white", fontWeight: "bold" },
            }).addListener("click", () => setSelectedStop(IJOOZ_HQ));

            updatedStops.forEach((stop, i) => {
              new google.maps.Marker({
                position: routeLegs[i].end_location,
                map,
                label: {
                  text: String.fromCharCode(66 + i),
                  color: "white",
                  fontWeight: "bold",
                },
              }).addListener("click", () => setSelectedStop(stop));
            });

            // Final marker for return to HQ
            const lastLeg = routeLegs[routeLegs.length - 1];
            new google.maps.Marker({
              position: lastLeg.end_location,
              map,
              label: {
                text: String.fromCharCode(66 + updatedStops.length),
                color: "white",
                fontWeight: "bold",
              },
            }).addListener("click", () =>
              setSelectedStop({ ...IJOOZ_HQ, eta: finalEta, status: "Return" })
            );
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
          <span>{stops.length + 2} Stops (incl. return to HQ)</span>
          <span className="mt-1 sm:mt-0">Total Trip: {totalDuration}</span>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="stops">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {[IJOOZ_HQ, ...etaStops].map((stop, i) => {
                  const isDraggable = i !== 0;
                  return isDraggable ? (
                    <Draggable key={i} draggableId={i.toString()} index={i - 1}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setSelectedStop(stop)}
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
                      onClick={() => setSelectedStop(stop)}
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

        <button
          onClick={() => setShowTripSummary(true)}
          className="mt-5 w-full bg-blue-600 text-white py-2 rounded-md"
        >
          View Trip Summary
        </button>
      </div>

      {showTripSummary && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-center mb-4">Route Summary</h2>
            <p className="text-sm text-center mb-2">
              Total Stops: {stops.length + 2}
              <br />
              Total Duration: {totalDuration}
              <br />
              Total Distance: {totalDistance} km
            </p>
            <ol className="space-y-2 text-sm mt-4">
              <li>
                <strong>{IJOOZ_HQ.name}</strong> – {IJOOZ_HQ.address} – ETA: 10:00
              </li>
              {etaStops.map((stop, i) => (
                <li key={i}>
                  <strong>{stop.name}</strong> – {stop.address} – ETA: {stop.eta}
                </li>
              ))}
              <li>
                <strong>{IJOOZ_HQ.name}</strong> – {IJOOZ_HQ.address} – ETA: {finalEta}
              </li>
            </ol>
            <button
              onClick={() => setShowTripSummary(false)}
              className="w-full mt-5 py-2 bg-blue-600 text-white rounded-md"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}

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
