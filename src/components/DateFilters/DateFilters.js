import React from "react";
import "./DateFilters.scss";
import DFDatePicker from "../DatePicker/DatePicker";
import { Form } from "antd";

const { RangePicker } = DFDatePicker;

const DateFilters = ({ dates, setDates }) => {
  console.log(dates);
  return (
    <Form.Item className="DateFilters" label="Date Range">
      <RangePicker
        defaultValue={dates}
        onChange={(e) => setDates(e)}
        minDate={new Date("2015-01-01")}
      />
    </Form.Item>
  );
};

export default DateFilters;
