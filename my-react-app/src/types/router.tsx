// types/router.ts
import { } from 'react-router-dom'

declare module 'react-router-dom' {
  interface NavigateFunction {
    (to: string, options?: { replace?: boolean; state?: any }): void
  }
}