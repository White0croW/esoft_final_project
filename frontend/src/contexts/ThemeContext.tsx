// src/contexts/ThemeContext.tsx
import { createContext, useState, useContext, ReactNode } from "react";

interface ThemeContextType {
    mode: "light" | "dark";
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Читаем тему из localStorage или ставим по умолчанию
    const [mode, setMode] = useState<"light" | "dark">(
        localStorage.getItem("theme") === "dark" ? "dark" : "light"
    );

    const toggleMode = () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        localStorage.setItem("theme", newMode);
    };

    return (
        <ThemeContext.Provider value={{ mode, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};