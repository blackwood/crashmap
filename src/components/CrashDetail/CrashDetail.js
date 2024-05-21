import React from "react";
import "./CrashDetail.css";
import { humanifyDate } from "../../util";

const CrashDetail = ({ crash }) => (
  <div className="CrashDetail">
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
      <b>Injury</b>: {crash.injury_type}
    </p>
  </div>
);

export default CrashDetail;
