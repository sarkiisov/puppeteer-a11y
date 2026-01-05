import { Page } from 'puppeteer-core'

export type PageCheckStatus = 'PASSED' | 'FAILED' | 'REVIEW_NEEDED' | 'ERROR'

export interface PageCheckResult {
  status: PageCheckStatus
  details?: any
  recommendations?: string
}

export type PageCheck = {
  name: string
  run: (page: Page) => Promise<PageCheckResult>
}
