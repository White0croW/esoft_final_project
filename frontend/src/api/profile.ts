import api from "./base";

export interface Profile {
    name: string;
    email: string;
    phone?: string;
}

// Получить профиль текущего пользователя
export const getProfile = (): Promise<Profile> =>
    api.get<Profile>("/users/profile").then((res) => res.data);

// Обновить профиль (имя, email, телефон)
export const updateProfile = (data: Profile): Promise<Profile> =>
    api.put<Profile>("/users/profile", data).then((res) => res.data);

// Сменить пароль (старый и новый)
export const changePassword = (
    oldPassword: string,
    newPassword: string
): Promise<{ message: string }> =>
    api
        .put<{ message: string }>("/users/password", { oldPassword, newPassword })
        .then((res) => res.data);
