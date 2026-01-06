import { PageCheck } from '../types'

export default {
  id: '2.4.2',
  name: 'Page Titled',
  level: 'A',
  run: async (page) => {
    const pageTitle = await page.title()

    if (!pageTitle || pageTitle.trim().length === 0) {
      return {
        status: 'FAILED',
        details: 'The page does not have a title or the title is empty',
        recommendations:
          'Provide a meaningful and descriptive page title using the <title> element in the document head'
      }
    }

    const trimmedTitle = pageTitle.trim()

    const nonDescriptiveTitles = [
      'home',
      'index',
      'main',
      'page',
      'document',
      'untitled',
      'default',
      'application',
      'app',
      'react app',
      'angular app',
      'vue app'
    ]

    const isLikelyNonDescriptive =
      trimmedTitle.length < 3 || nonDescriptiveTitles.includes(trimmedTitle.toLowerCase())

    if (isLikelyNonDescriptive) {
      return {
        status: 'REVIEW_NEEDED',
        details: {
          title: trimmedTitle
        },
        recommendations:
          'Ensure the page title is descriptive and clearly identifies the page purpose or content'
      }
    }

    return {
      status: 'PASSED',
      details: {
        title: trimmedTitle
      }
    }
  }
} satisfies PageCheck
