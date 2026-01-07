import { getElementSelector } from './puppeteer'

declare global {
  type Asynchronous<T extends (...args: any[]) => any> = (
    ...args: Parameters<T>
  ) => Promise<Awaited<ReturnType<T>>>

  interface Window {
    getElementSelector: Asynchronous<typeof getElementSelector>
  }
}

export {}
