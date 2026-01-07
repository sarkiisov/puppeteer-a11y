import { ElementHandle } from 'puppeteer-core'
import { PageCheck } from '../../types'
import { detectDominantLanguage, getPrimaryLanguage, isSameLanguage } from '../../utils/language'
import { getElementSelector } from '../../utils/puppeteer'

export default {
  id: '3.1.2',
  name: 'Language of Parts',
  level: 'AA',
  run: async (page) => {
    await page.exposeFunction('getElementSelector', getElementSelector)

    const elementsWithLang = await page.$$eval(
      '[lang]:not(html)',
      /* c8 ignore start */ async (elements) => {
        const results = await Promise.all(
          elements.map(async (element) => {
            return {
              lang: element.getAttribute('lang'),
              text: String(element.textContent),
              selector: await window.getElementSelector(element as unknown as ElementHandle)
            }
          })
        )

        return results.filter((item) => item.lang && item.text.length > 0)
      } /* c8 ignore end */
    )

    await page.removeExposedFunction('getElementSelector')

    if (elementsWithLang.length === 0) {
      return {
        status: 'PASSED',
        details: 'No elements with a lang attribute other than <html> were found'
      }
    }

    const issues: Array<{
      declaredLanguage: string
      detectedLanguage: string | null
      text: string
      selector: string
    }> = []

    for (const element of elementsWithLang) {
      const declaredLanguage = getPrimaryLanguage(element.lang!)
      const detectedLanguage = detectDominantLanguage([element.text])

      if (!detectedLanguage) {
        issues.push({
          ...element,
          declaredLanguage,
          detectedLanguage: null
        })
        continue
      }

      if (!isSameLanguage(declaredLanguage, detectedLanguage)) {
        issues.push({
          ...element,
          declaredLanguage,
          detectedLanguage
        })
      }
    }

    if (issues.length > 0) {
      return {
        status: 'REVIEW_NEEDED',
        details: issues,
        recommendations:
          'Ensure that the lang attribute of each element correctly reflects the language of its text content using valid BCP 47 language codes'
      }
    }

    return {
      status: 'PASSED',
      details:
        'All elements with a lang attribute appear to match the detected language of their text content'
    }
  }
} satisfies PageCheck
