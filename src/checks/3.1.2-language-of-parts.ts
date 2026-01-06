import { PageCheck } from '../types'
import { detectDominantLanguage, getPrimaryLanguage, isSameLanguage } from '../utils/language'

export default {
  id: '3.1.2',
  name: 'Language of Parts',
  level: 'AA',
  run: async (page) => {
    const elementsWithLang = await page.$$eval('[lang]:not(html)', (elements) =>
      elements
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          lang: element.getAttribute('lang'),
          text: element.textContent?.trim() ?? '',
          selector: element.id
            ? `#${element.id}`
            : element.className
            ? `${element.tagName.toLowerCase()}.${element.className.split(' ').join('.')}`
            : element.tagName.toLowerCase()
        }))
        .filter((element) => element.lang && element.text.length > 0)
    )

    if (elementsWithLang.length === 0) {
      return {
        status: 'PASSED',
        details: 'No elements with a lang attribute other than <html> were found'
      }
    }

    const issues: Array<{
      declaredLanguage: string
      detectedLanguage: string | null
      textSample: string
      selector: string
    }> = []

    for (const element of elementsWithLang) {
      const declaredLanguage = getPrimaryLanguage(element.lang!)
      const detectedLanguage = detectDominantLanguage([element.text])

      if (!detectedLanguage) {
        issues.push({
          declaredLanguage,
          detectedLanguage: null,
          textSample: `${element.text.slice(0, 100)}${element.text.length > 100 ? '...' : ''}`,
          selector: element.selector
        })
        continue
      }

      if (!isSameLanguage(declaredLanguage, detectedLanguage)) {
        issues.push({
          declaredLanguage,
          detectedLanguage,
          textSample: `${element.text.slice(0, 100)}${element.text.length > 100 ? '...' : ''}`,
          selector: element.selector
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
