// src/api/dadata.ts
import api from "./base";

export const fetchAddressSuggestions = (query: string) =>
    api.post("/suggest/address", { query })
        .then(res => res.data.suggestions);