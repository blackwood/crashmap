import React from "react";
import "./DateFilters.scss";
import DFDatePicker from "../DatePicker/DatePicker";

const { RangePicker } = DFDatePicker;

const DateFilters = ({ dates, setDates }) => (
  <div className="DateFilters">
    <RangePicker
      defaultValue={dates.map((d) => new Date(d))}
      onChange={(e) => setDates(e)}
      minDate={new Date("2015-01-01")}
    />
  </div>
);

export default DateFilters;
