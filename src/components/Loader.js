import React from "react";
import { Spin } from "antd";

const contentStyle = {
  padding: 50,
  background: "rgba(0, 0, 0, 0.05)",
  borderRadius: 4,
};

const spinStyle = {
  position: "absolute",
};

const content = <div style={contentStyle} />;
const Loader = () => (
  <Spin style={spinStyle} tip="Loading" size="large">
    {content}
  </Spin>
);
export default Loader;
