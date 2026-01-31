import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import ErrorBoundary from "./components/ErrorBoundary";
import LoadingProvider from "./context/LoadingProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
