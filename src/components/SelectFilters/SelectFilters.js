import React from "react";
import "./SelectFilters.css";
import { Form, Select, Space } from "antd";
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
    <>
      <Space
        style={{
          width: "100%",
        }}
        direction="vertical"
      >
        <Form.Item label="Collision With (Initial)">
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
        </Form.Item>
        <Form.Item label="Injury Type">
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
        </Form.Item>
      </Space>
    </>
  );
};

export default SelectFilters;
