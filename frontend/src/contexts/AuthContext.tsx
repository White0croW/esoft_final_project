import api from "@/api/base";
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

interface AuthContextValue {
    user: User | null;
    token: string | null;
    login: (creds: { email: string; password: string }) => Promise<void>;
    register: (data: { name: string; email: string; password: string }) => Promise<void>;
    logout: () => void;
    initialized: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);
    const API = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // 1) Считываем из localStorage
        const t = localStorage.getItem("token");
        const u = localStorage.getItem("user");
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
        setInitialized(true);
    }, []);

    const fetchProfile = async (t: string) => {
        const res = await fetch(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) throw new Error("Не удалось получить профиль");
        const me: User = await res.json();
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
    };

    const login = async (creds: { email: string; password: string }) => {
        try {
            const response = await api.post(`${API}/auth/signin`, creds); // Передаем объект целиком
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user)); // Сохраняем пользователя
            setToken(token);
            setUser(user);
        } catch (error) {
            throw error;
        }
    };


    const register = async ({ name, email, password }: { name: string; email: string; password: string }) => {
        const res = await fetch(`${API}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Ошибка регистрации");
        }
        const { token: t } = await res.json();
        localStorage.setItem("token", t);
        setToken(t);
        await fetchProfile(t);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, token, login, register, logout, initialized }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
};
