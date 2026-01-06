import { PageCheckResult, RunPageChecks } from '../types'

/**
 * Runs a set of accessibility or page checks on a Puppeteer page
 */
export const runPageChecks: RunPageChecks = async (page, checks) => {
  return Promise.all(
    checks.map(async (check) => {
      try {
        const result = await check.run(page)

        return {
          id: check.id,
          name: check.name,
          level: check.level,
          result: result
        }
      } catch (error) {
        return {
          id: check.id,
          name: check.name,
          level: check.level,
          result: {
            status: 'ERROR',
            details: String(error)
          }
        } as PageCheckResult
      }
    })
  ).then((results) => {
    const url = page.url()
    const timestamp = new Date()

    return {
      meta: { url, timestamp },
      results
    }
  })
}
