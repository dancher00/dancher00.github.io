import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import LandingPage from "./LandingPage";
const App = lazy(() => import("./App"));
import "./styles.css";
import "./theme.css";

const ResearchAppendix = lazy(() => import("./ResearchAppendix"));
const view = new URLSearchParams(window.location.search).get("view");
const Documentation = lazy(() => import("./Documentation"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {view === "docs" ? <Suspense fallback={<p className="page-shell">Loading documentation…</p>}><Documentation /></Suspense> : view === "appendix" ? <Suspense fallback={<p className="page-shell">Loading research appendix…</p>}><ResearchAppendix /></Suspense> : view === "explore" ? <Suspense fallback={<p className="page-shell">Loading studies…</p>}><App /></Suspense> : <LandingPage />}
  </StrictMode>,
);
