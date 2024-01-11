import React from 'react';

const DepthVisualizerColors = {
  BIDS: "#113534",
  ASKS: "#3d1e28"
};

const DepthVisualizer = ({depth, orderType }) => {
  return <div data-testid="depth-visualizer" style={{
    backgroundColor: `${orderType === 'BID' ? DepthVisualizerColors.BIDS : DepthVisualizerColors.ASKS}`,
    height: "1.250em",
    width: `${depth}%`,
    position: "relative",
    top: 21,
    left: `${orderType === 'BID' ? `${100 - depth}%` : 0}`,
    right: `${orderType === 'ASK' ? `${100 - depth}%` : 0}`,
    marginTop: -24,
    zIndex: 1,
  }} />;
};

export default DepthVisualizer;