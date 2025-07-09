import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export const signIn = (data: { email: string; password: string }) =>
    api.post("/auth/signin", data);

export const signUp = (data: { name: string; email: string; password: string }) =>
    api.post("/auth/signup", data);
