import { Page } from 'puppeteer-core'
import { PageCheck, PageCheckStatus } from '../types'

export const runPageChecks = async (page: Page, checks: PageCheck[]) => {
  return Promise.all(
    checks.map(async (check) => {
      try {
        const result = await check.run(page)

        return {
          name: check.name,
          result: result
        }
      } catch (error) {
        return {
          name: check.name,
          result: {
            status: 'ERROR' as PageCheckStatus,
            details: String(error)
          }
        }
      }
    })
  ).then((results) => {
    const summary: Record<PageCheckStatus, number> = {
      PASSED: 0,
      FAILED: 0,
      ERROR: 0,
      REVIEW_NEEDED: 0
    }

    results.map(({ result }) => {
      summary[result.status] = (summary[result.status] || 0) + 1
    })

    return {
      meta: {
        url: page.url(),
        timestamp: new Date()
      },
      summary,
      results
    }
  })
}
