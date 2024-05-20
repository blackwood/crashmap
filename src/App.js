import { useEffect, useState } from "react";
import "./App.css";
import { isValid, format, parseISO } from "date-fns";

// TODO
// Filter by Driver contribution, injury, ped/cycle
// Add new data that includes whether the city has discussed or implemented
// any traffic calming measures for a particular area.
// complementary timeframe on either side of intervention for comparison.
// Split into two maps?

// TileLayer provided by:
// https://leaflet-extras.github.io/leaflet-providers/preview/
// Esri.WorldGrayCanvas
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

import defaultIconPng from "leaflet/dist/images/marker-icon.png";
import MarkerClusterGroup from "react-leaflet-cluster";

const defaultIcon = new Icon({
  iconUrl: defaultIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const getTodayDate = () => new Date().toISOString().substring(0, 10);

const humanifyDate = (date) => {
  return format(parseISO(date), "PPP");
};

function App() {
  const [data, setData] = useState([]);
  const [dateStart, setDateStart] = useState("2019-05-17");
  const [dateEnd, setDateEnd] = useState(getTodayDate());
  console.log({ dateStart, dateEnd });

  useEffect(() => {
    const fetchCrashes = async (isoDateStart, isoDateEnd) => {
      const query = `(may_involve_cyclist = "1" OR may_involve_pedestrian = "1") AND date_time > "${isoDateStart}" AND date_time < "${isoDateEnd}"`;
      const response = await fetch(
        "https://data.cambridgema.gov/resource/gb5w-yva3.json?" +
          new URLSearchParams({
            $where: query,
          })
      );
      const crashes = await response.json();
      setData(crashes);
      console.log(crashes);
      return crashes;
    };

    fetchCrashes(dateStart, dateEnd);
  }, []);

  const getLatLon = (crash) => {
    const {
      location: { latitude, longitude },
    } = crash;
    return [latitude, longitude];
  };

  console.log(typeof data, data.length);
  return (
    <div className="app">
      <MapContainer center={[42.3736, -71.1097]} zoom={14}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
          maxZoom={16}
        />
        <MarkerClusterGroup chunkedLoading>
          {/* TODO: Approximate location and cache for crashes
            with no specific location (use NEAR street) */}
          {data
            .filter((crash) => !!crash.location)
            .map((crash) => (
              <Marker icon={defaultIcon} position={getLatLon(crash)}>
                <Popup>
                  <p>
                    <b>Date</b>: {humanifyDate(crash.date_time)}
                  </p>
                  <p>
                    <b>Object:</b> {crash.object_1}
                  </p>
                  <p>
                    <b>Description</b>: {crash.first_harmful_event}
                  </p>
                  <p>
                    <b>Driver Contribution</b>: {crash.v1_driver_contribution}
                  </p>
                  <p>
                    <b>Injury</b>:{" "}
                    {crash.p1_non_motorist_desc
                      ? crash.p1_injury
                      : crash.p2_non_motorist_desc
                      ? crash.p2_injury
                      : "UNKNOWN"}
                  </p>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
        {/* TODO: Use a generator to animate by date */}
      </MapContainer>
    </div>
  );
}

export default App;
