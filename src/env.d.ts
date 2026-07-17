/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface MonacoEnvironment {
  getWorker(workerId: string, label: string): Worker
}

declare global {
  var MonacoEnvironment: MonacoEnvironment | undefined
}

export {}
