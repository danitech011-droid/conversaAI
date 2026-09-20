import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/** Visual density/finish of the dashboard surfaces: "premium" (glass, gradients) or "standard" (flat, compact). */
export type UiMode = "premium" | "standard";

const STORAGE_KEY = "conversaai-ui-mode";

type UiModeContextValue = {
  mode: UiMode;
  isPremium: boolean;
  setMode: (mode: UiMode) => void;
  toggleMode: () => void;
};

const UiModeContext = createContext<UiModeContextValue>({
  mode: "premium",
  isPremium: true,
  setMode: () => {},
  toggleMode: () => {},
});

function applyMode(mode: UiMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset["ui"] = mode;
}

export function UiModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<UiMode>("premium");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as UiMode | null;
    const initial: UiMode = stored === "standard" ? "standard" : "premium";
    setModeState(initial);
    applyMode(initial);
  }, []);

  const setMode = useCallback((next: UiMode) => {
    setModeState(next);
    applyMode(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      const next: UiMode = current === "premium" ? "standard" : "premium";
      applyMode(next);
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <UiModeContext.Provider value={{ mode, isPremium: mode === "premium", setMode, toggleMode }}>
      {children}
    </UiModeContext.Provider>
  );
}

export function useUiMode() {
  return useContext(UiModeContext);
}
