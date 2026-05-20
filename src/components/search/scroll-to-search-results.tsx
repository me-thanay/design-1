"use client";

import { useEffect } from "react";

export function ScrollToSearchResults() {
  useEffect(() => {
    const el = document.getElementById("search-results");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  return null;
}
