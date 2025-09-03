/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_TARGET: string
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
