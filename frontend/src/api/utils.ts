export function getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
}
