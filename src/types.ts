import { Page } from 'puppeteer-core'

export type PageCheckFunctionStatus = 'PASSED' | 'FAILED' | 'REVIEW_NEEDED' | 'ERROR'

export type PageCheckFunction = (page: Page) => Promise<{
  status: PageCheckFunctionStatus
  details?: any
  recommendations?: string
}>

export type PageCheckLevel = 'A' | 'AA' | 'AAA'

export interface PageCheckBase {
  id: string
  name: string
  level: PageCheckLevel
}

export interface PageCheck extends PageCheckBase {
  run: PageCheckFunction
}

export interface PageCheckResult extends PageCheckBase {
  result: Awaited<ReturnType<PageCheckFunction>>
}

export interface RunPageChecksResult {
  meta: {
    url: string
    timestamp: Date
  }
  results: PageCheckResult[]
}

export type RunPageChecks = (page: Page, checks: PageCheck[]) => Promise<RunPageChecksResult>
