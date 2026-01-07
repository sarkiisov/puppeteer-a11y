import { PageCheckResult, RunPageChecks } from '../types'

/**
 * Runs a set of accessibility or page checks on a Puppeteer page
 */
export const runPageChecks: RunPageChecks = async (page, checks) => {
  const results: PageCheckResult[] = []

  for (const check of checks) {
    try {
      const result = await check.run(page)

      results.push({
        id: check.id,
        name: check.name,
        level: check.level,
        result: result
      })
    } catch (error) {
      results.push({
        id: check.id,
        name: check.name,
        level: check.level,
        result: {
          status: 'ERROR',
          details: String(error)
        }
      } as PageCheckResult)
    }
  }

  const url = page.url()
  const timestamp = new Date()

  return {
    meta: { url, timestamp },
    results
  }
}
