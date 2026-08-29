/// <reference types="vite/client" />
/// <reference types="chrome" />

interface ImportMetaEnv {
  readonly VITE_PREVIEW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
