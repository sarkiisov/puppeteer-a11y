import type { Browser } from 'puppeteer-core'
import { getElementSelector } from '../utils/puppeteer'

declare global {
  var __BROWSER__: Browser

  interface Window {
    getElementSelector: Asynchronous<typeof getElementSelector>
  }
}

export {}
