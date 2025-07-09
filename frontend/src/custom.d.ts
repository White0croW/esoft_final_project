// src/custom.d.ts
declare module "react-dadata" {
    import * as React from "react";

    export interface SuggestionData {
        value: string;
        data: {
            geo_lon: string;
            geo_lat: string;
            [key: string]: any;
        };
    }

    export interface SuggestionsProps {
        token: string;
        onChange: (suggestion: SuggestionData) => void;
        placeholder?: string;
        hint?: string;
        debounce?: number;
        count?: number;
        style?: React.CSSProperties;
        className?: string;
        popupClassName?: string;
    }

    export const Suggestions: React.FC<SuggestionsProps>;
}
declare module "react-dadata/dist/react-dadata.css";
declare module '*.png';