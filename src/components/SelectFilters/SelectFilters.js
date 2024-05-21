import React from "react";
import "./SelectFilters.css";
import { Select, Space } from "antd";
import { expandToOptions } from "../../util";

const SelectFilters = ({ setFiltersIn }) => {
  const COLLISION_WITH_OPTS = expandToOptions([
    "COLLISION WITH PEDESTRIAN",
    "COLLISION WITH PEDALCYCLE",
    "COLLISION WITH MOTOR VEHICLE IN TRAFFIC",
    "COLLISION WITH OTHER MOVABLE OBJECT",
    "COLLISION WITH PARKED MOTOR VEHICLE",
    "UNKNOWN",
    "OTHER",
    "COLLISION WITH LIGHT POLE OR OTHER POST/SUPPORT",
    "COLLISION WITH UNKNOWN FIXED OBJECT",
  ]);

  const INJURY_TYPE_OPTS = expandToOptions([
    "UNKNOWN",
    "SUSPECTED MINOR INJURY",
    "NO APPARENT INJURY",
    "SUSPECTED SERIOUS INJURY",
    "POSSIBLE INJURY",
    "FATAL INJURY",
    "NOT APPLICABLE",
    // old codes?
    "NON FATAL INJURY - INCAPACITATING",
    "NON FATAL INJURY - NON INCAPACITATING",
    "NON FATAL INJURY - POSSIBLE",
    "NO INJURY",
    "SUSPECTED MINOR INJURY",
  ]);

  return (
    <Space
      style={{
        width: "100%",
      }}
      direction="vertical"
    >
      <Select
        mode="multiple"
        allowClear
        style={{
          width: "100%",
        }}
        placeholder="Please select"
        defaultValue={[]}
        onChange={(e) => {
          setFiltersIn("entities", e);
        }}
        options={COLLISION_WITH_OPTS}
      />
      <Select
        mode="multiple"
        allowClear
        style={{
          width: "100%",
        }}
        placeholder="Please select"
        defaultValue={[]}
        onChange={(e) => setFiltersIn("injuries", e)}
        options={INJURY_TYPE_OPTS}
      />
    </Space>
  );
};

export default SelectFilters;
