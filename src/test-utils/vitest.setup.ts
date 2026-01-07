import { beforeAll, afterAll } from 'vitest'
import puppeteer, { Browser } from 'puppeteer-core'
import { launchBrowser } from '../browser'

let browser: Browser

beforeAll(async () => {
  browser = await launchBrowser()
  ;(globalThis as any).__BROWSER__ = browser
})

afterAll(async () => {
  await browser.close()
})
