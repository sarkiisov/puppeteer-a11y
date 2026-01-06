import puppeteer from 'puppeteer-core'
import { env } from './env'

export const launchBrowser = () => {
  return puppeteer.launch({
    executablePath: env.PUPPETEER_EXECUTABLE_PATH,
    headless: env.PUPPETEER_HEADLESS,
    timeout: env.PUPPETEER_TIMEOUT_MS,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
}
