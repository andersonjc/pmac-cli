/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKLOG_PATH?: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
