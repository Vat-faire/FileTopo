import React from "react";
import ReactDOM from "react-dom/client";
import MapApp from "./map/MapApp";

// The application now boots into the TASK-0016 vertical slice: synthetic
// fixtures, a persistent index, and the hierarchical block map. The 0.1 alpha
// screen (`src/App.tsx`) is kept in the repository as the technical audit it
// is — DEC-0015 A — and is no longer what the product presents.
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MapApp />
  </React.StrictMode>,
);
