
/// <reference types="vite/client" />

interface Window {
  __TAURI__?: {
    invoke: (cmd: string, args?: unknown) => Promise<unknown>;
    [key: string]: any;
  };
}
