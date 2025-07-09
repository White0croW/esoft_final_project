/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // добавляйте здесь другие переменные VITE_*
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
