import { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark"; // Only dark mode supported now

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>("dark"); // Fixed to dark

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    localStorage.setItem("vairal-theme", "dark");
  }, []);

  const toggleTheme = () => {
    // No-op - we are enforcing premium dark mode
    console.log("Light mode is disabled.");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
