"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Whether the fixed site chrome, meaning the navbar, may show itself.
 *
 * The navbar lives in the root layout and the preloader lives on the homepage,
 * so neither can see the other's state. This is the thread between them: the
 * homepage holds the chrome back while the WEDDING lockup plays and releases it
 * once the page underneath is revealed.
 *
 * It defaults to true, so every route that has no preloader shows the navbar
 * straight away without having to opt in.
 */
type ChromeContext = {
  chromeReady: boolean;
  setChromeReady: (ready: boolean) => void;
};

const Context = createContext<ChromeContext>({
  chromeReady: true,
  setChromeReady: () => {},
});

export function ChromeProvider({ children }: { children: React.ReactNode }) {
  const [chromeReady, setReady] = useState(true);

  // Stable identity, so a consumer's effects are not restarted on every render.
  const setChromeReady = useCallback((ready: boolean) => setReady(ready), []);
  const value = useMemo(
    () => ({ chromeReady, setChromeReady }),
    [chromeReady, setChromeReady],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useChrome() {
  return useContext(Context);
}
