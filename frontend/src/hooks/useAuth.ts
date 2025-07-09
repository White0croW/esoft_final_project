import { useState } from "react";
import { signIn, signUp } from "../api/auth";

export function useAuth() {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    const login = async (data: { email: string; password: string }) => {
        const res = await signIn(data);
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
    };

    const register = async (data: { name: string; email: string; password: string }) => {
        const res = await signUp(data);
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return { token, login, register, logout };
}
