import { useEffect, useState } from "react";
import "./App.css";
import hash from "object-hash";
import { produce } from "immer";

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
import { cleanInjuryType, dateToSimpleISO, getTodayDate } from "./util";
import CrashDetail from "./components/CrashDetail/CrashDetail";
import DateFilters from "./components/DateFilters/DateFilters";
import SelectFilters from "./components/SelectFilters/SelectFilters";

const defaultIcon = new Icon({
  iconUrl: defaultIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function App() {
  const [data, setData] = useState([]);
  const [dates, setDates] = useState([new Date("2015-01-01"), new Date()]);
  const [filters, setFilters] = useState({ injuries: [], entities: [] });

  const setFiltersIn = (filter, values) => {
    const nextFilters = produce(filters, (draft) => {
      draft[filter] = values;
    });
    setFilters(nextFilters);
  };

  const [date_start, date_end] = dates;

  useEffect(() => {
    const fetchCrashes = async (isoDateStart, isoDateEnd) => {
      const query = `(may_involve_cyclist = "1" OR may_involve_pedestrian = "1") AND date_time > "${dateToSimpleISO(
        date_start
      )}" AND date_time < "${dateToSimpleISO(date_end)}"`;
      const response = await fetch(
        "https://data.cambridgema.gov/resource/gb5w-yva3.json?" +
          new URLSearchParams({
            $where: query,
            $limit: 500000,
          })
      );
      const crashes = await response.json();

      const cleanedCrashes = crashes.map((crash) => {
        const { date_time, location } = crash;

        let location_detail = {
          street_name: crash.street_name.trim(),
          street_direction: crash.street_direction.trim(),
          landmark: crash.landmark.trim(),
          intersection_name_1: crash.intersection_name_1.trim(),
          near_street: crash.near_street.trim(),
        };

        // NOTE: These rows don't come back from the API with IDs.
        // We can create an effective pseudo ID by hashing object.
        return {
          id: hash(crash),
          ...(location && { location_hash: hash({ ...location }) }),
          ...(location || {
            location_detail,
            location_hash: hash({ ...location_detail }),
          }),
          injury_type: cleanInjuryType(crash),
          collision_with: crash.first_harmful_event.trim(),
          ...crash,
        };
      });

      const nonLocCrashes = cleanedCrashes
        .filter((crash) => !crash.location)
        .map((crash) => ({
          location_hash: crash.location_hash,
          ...crash.location_detail,
        }));

      // console.log(
      // .map((crash) => ({
      //   ...crash,
      //   attempt:
      //     `${crash.street_name} ${crash.street_direction} ${crash.landmark} ${crash.intersection_name_1} NEAR ${crash.near_street}`.replace(
      //       / +(?= )/g,
      //       ""
      //     ),
      // })
      // );

      setData(cleanedCrashes);

      return crashes;
    };

    fetchCrashes(date_start, date_end);
  }, [date_start, date_end]);

  const getLatLon = (crash) => {
    const {
      location: { latitude, longitude },
    } = crash;
    return [latitude, longitude];
  };

  const filterables = {
    HAS_LOCATION: (crash) => !!crash.location,
    COLLISION_WITH: (crash) => {
      return (
        filters.entities.length === 0 ||
        filters.entities.some((entity) => entity === crash.collision_with)
      );
    },
    INJURY_TYPE: (crash) => {
      console.log({ len: filters.injuries.length, injury: crash.injury_type });
      return (
        filters.injuries.length === 0 ||
        filters.injuries.some((injury) => injury === crash.injury_type)
      );
    },
  };

  const filteredData = data.filter(
    (crash) =>
      filterables.HAS_LOCATION(crash) &&
      filterables.COLLISION_WITH(crash) &&
      filterables.INJURY_TYPE(crash)
  );

  console.log({
    injury_types: new Set(data.map((crash) => crash.injury_type)),
  });

  return (
    <div className="app">
      <DateFilters dates={dates} setDates={setDates} />
      <SelectFilters setFiltersIn={setFiltersIn} />
      <MapContainer center={[42.3736, -71.1097]} zoom={14}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
          maxZoom={16}
        />
        <MarkerClusterGroup chunkedLoading>
          {/* TODO: Approximate location and cache for crashes
            with no specific location (use NEAR street) */}
          {filteredData.map((crash) => (
            <Marker
              key={crash.id} // Having the ID lets us reconcile between updates and improve perf
              icon={defaultIcon}
              position={getLatLon(crash)}
            >
              <Popup>
                <CrashDetail crash={crash} />
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
