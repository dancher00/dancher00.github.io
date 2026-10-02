import { useEffect, useState } from "react";

declare global {
  interface Window { wassermanTheme: { set: (theme: "light" | "dark") => void }; }
}

export function useDarkTheme() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === "dark");
  useEffect(() => {
    const update = () => setDark(document.documentElement.dataset.theme === "dark");
    window.addEventListener("wasserman-theme-change", update);
    return () => window.removeEventListener("wasserman-theme-change", update);
  }, []);
  return dark;
}
