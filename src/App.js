// TODO
// Filter by Driver contribution, injury, ped/cycle
// Add new data that includes whether the city has discussed or implemented
// any traffic calming measures for a particular area.
// complementary timeframe on either side of intervention for comparison.
// Split into two maps?

// TileLayer provided by:
// https://leaflet-extras.github.io/leaflet-providers/preview/
// Esri.WorldGrayCanvas
import { produce } from "immer";
import hash from "object-hash";
import { useEffect, useState } from "react";
import "./App.css";

import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import defaultIconPng from "leaflet/dist/images/marker-icon.png";
import MarkerClusterGroup from "react-leaflet-cluster";

import { Flex, Form, Layout, Space, Typography } from "antd";
import { blue } from "@ant-design/colors";
import Sider from "antd/es/layout/Sider";
import { Content, Footer, Header } from "antd/es/layout/layout";

import CrashDetail from "./components/CrashDetail/CrashDetail";
import DateFilters from "./components/DateFilters/DateFilters";
import Loader from "./components/Loader";
import SelectFilters from "./components/SelectFilters/SelectFilters";

import { cleanInjuryType, dateToSimpleISO } from "./util";
import Link from "antd/es/typography/Link";

const { Title } = Typography;

const defaultIcon = new Icon({
  iconUrl: defaultIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function App() {
  const [data, setData] = useState([]);
  const [dates, setDates] = useState([
    new Date("2023-01-01 "),
    new Date("2024-01-01 "),
  ]);
  console.log(dateToSimpleISO(dates[0]));
  const [filters, setFilters] = useState({ injuries: [], entities: [] });
  const [isLoading, setIsLoading] = useState(false);

  const setFiltersIn = (filter, values) => {
    const nextFilters = produce(filters, (draft) => {
      draft[filter] = values;
    });
    setFilters(nextFilters);
  };

  const [date_start, date_end] = dates;

  useEffect(() => {
    const fetchCrashes = async (isoDateStart, isoDateEnd) => {
      setIsLoading(true);
      setData([]);

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
      const crashes = await response.json().finally((_) => setIsLoading(false));

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

      // TODO Develop strategy for caching nonLocCrash approx_location data
      // const nonLocCrashes = cleanedCrashes
      //   .filter((crash) => !crash.location)
      //   .map((crash) => ({
      //     location_hash: crash.location_hash,
      //     ...crash.location_detail,
      //   }));

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

  console.log({ isLoading });
  return (
    <div className="app">
      <Flex gap="middle" wrap>
        <Layout className="layout">
          <Header className="header">
            <Space>
              <Title level={2} style={{ margin: "0.5em", color: "#fff" }}>
                Pedestrian & Cyclist Involved Crashes — Cambridge
              </Title>
            </Space>
          </Header>
          <Layout className="layout">
            <Content className="content" style={{ display: "grid" }}>
              <MapContainer
                center={[42.3736, -71.1097]}
                zoom={14}
                style={{ gridArea: "1 / 1" }}
              >
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
              {isLoading && (
                <div style={{ gridArea: "1 / 1", zIndex: 1000 }}>
                  <Loader />
                </div>
              )}
            </Content>
            <Sider
              className="sider"
              width="25%"
              style={{ background: blue[0] }}
            >
              <Form
                labelCol={{
                  span: 8,
                }}
                wrapperCol={{
                  span: 16,
                }}
                style={{
                  maxWidth: 600,
                  padding: 20,
                }}
                initialValues={{
                  remember: true,
                }}
              >
                <DateFilters dates={dates} setDates={setDates} />
                <SelectFilters setFiltersIn={setFiltersIn} />
              </Form>
            </Sider>
          </Layout>
          <Footer className="footer" style={{ color: "#000" }}>
            All data sourced from{" "}
            <Link href="https://data.cambridgema.gov/Public-Safety/Police-Department-Crash-Data-Updated/gb5w-yva3/about_data">
              Open Data Portal
            </Link>{" "}
            Cambridge Police Crash Data.
          </Footer>
        </Layout>
      </Flex>
    </div>
  );
}

export default App;
