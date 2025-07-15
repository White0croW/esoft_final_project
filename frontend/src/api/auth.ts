import api from "./base";

interface SignInData {
    email: string;
    password: string;
}
interface SignUpData extends SignInData {
    name: string;
}

export interface SignInResponse {
    data: any;
    data: any;
    token: string;
}

export const signIn = (data: SignInData) =>
    api.post<SignInResponse>("/auth/signin", data).then((res) => res.data);

export const signUp = (data: SignUpData) =>
    api.post<SignInResponse>("/auth/signup", data).then((res) => res.data);

// Получить профиль (если нужно)
export const fetchProfile = () =>
    api.get("/auth/me").then((res) => res.data);
