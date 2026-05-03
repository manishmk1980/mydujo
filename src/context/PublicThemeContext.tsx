import { createContext, useContext, useEffect, useMemo, useState } from "react";

type PublicTheme = "light" | "dark";

type PublicThemeContextValue = {
  theme: PublicTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: PublicTheme) => void;
};

const PublicThemeContext = createContext<PublicThemeContextValue | null>(null);

const STORAGE_KEY = "mydojo-public-theme";

function getInitialTheme(): PublicTheme {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return "light";
}

export function PublicThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<PublicTheme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);

    document.body.classList.remove("public-light", "public-dark");
    document.body.classList.add(theme === "dark" ? "public-dark" : "public-light");

    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (nextTheme: PublicTheme) => {
    setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  };

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme,
      setTheme,
    }),
    [theme]
  );

  return (
    <PublicThemeContext.Provider value={value}>
      {children}
    </PublicThemeContext.Provider>
  );
}

export function usePublicTheme() {
  const context = useContext(PublicThemeContext);

  if (!context) {
    throw new Error("usePublicTheme must be used inside PublicThemeProvider");
  }

  return context;
}
