import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import jwtDecode, { JwtPayload as DefaultJwtPayload } from "jwt-decode";

interface JwtPayload extends DefaultJwtPayload {
    userId: number;
    role: string;
}

interface AuthContextValue {
    user: { userId: number; role: string } | null;
    token: string | null;
    isLoading: boolean;
    login: (creds: { email: string; password: string }) => Promise<void>;
    register: (creds: { name: string; email: string; password: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthContextValue["user"]>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const t = localStorage.getItem("token");
        if (t) {
            try {
                const { userId, role, exp } = jwtDecode(t) as JwtPayload;
                if (!exp || Date.now() >= exp * 1000) throw new Error("Token expired");
                setToken(t);
                setUser({ userId, role });
            } catch {
                localStorage.removeItem("token");
            }
        }
        setLoading(false);
    }, []);

    async function login({ email, password }: { email: string; password: string }) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (res.status === 401) throw new Error("Неверные учетные данные");
        if (!res.ok) throw new Error(`Login failed: ${res.status}`);
        const { token: t } = await res.json();
        localStorage.setItem("token", t);
        setToken(t);
        const { userId, role } = jwtDecode(t) as JwtPayload;
        setUser({ userId, role });
    }

    async function register({
        name,
        email,
        password,
    }: {
        name: string;
        email: string;
        password: string;
    }) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        if (res.status === 401) throw new Error("Регистрация запрещена");
        if (!res.ok) throw new Error(`Registration failed: ${res.status}`);
        const { token: t } = await res.json();
        localStorage.setItem("token", t);
        setToken(t);
        const { userId, role } = jwtDecode(t) as JwtPayload;
        setUser({ userId, role });
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used внутри AuthProvider");
    return ctx;
}
