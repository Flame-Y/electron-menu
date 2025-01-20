export interface AdapterHandlerOptions {
  baseDir: string
  registry?: string
}

export interface AdapterInfo {
  name: string
  version: string
  description?: string
  author?: string
  main: string
  preload?: string
  [key: string]: any
}
