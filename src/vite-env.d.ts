/// <reference types="vite/client" />
declare module 'light-bolt11-decoder' {
  export function decode(string): {
    paymentRequest: string
    sections: Array<{ name: string; letters: string; value?: string | Record<string, unknown>; tag?: string }>
    expiry: number
  }
}
