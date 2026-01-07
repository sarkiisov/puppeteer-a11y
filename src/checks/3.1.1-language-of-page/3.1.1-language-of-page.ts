import { PageCheck } from '../../types'
import { detectDominantLanguage, getPrimaryLanguage, isSameLanguage } from '../../utils/language'

export default {
  id: '3.1.1',
  name: 'Language of Page',
  level: 'A',
  run: async (page) => {
    const htmlLanguage = await page.$eval(
      'html',
      /* c8 ignore start */ (element) => element.lang /* c8 ignore end */
    )

    if (!htmlLanguage) {
      return {
        status: 'FAILED',
        details: 'Could not find lang attribute on <html>',
        recommendations:
          'Add `lang` attribute to the root `<html>` element using a valid BCP 47 code (e.g., `<html lang="en">` for English or `<html lang="et-EE">` for Estonian)'
      }
    }

    const texts = await page.$$eval(
      'p, h1, h2, h3, h4, h5, h6, li, span, div',
      /* c8 ignore start */ (elements) =>
        elements.map((element) => element.innerText).filter((t) => t.trim().length > 0)
      /* c8 ignore end */
    )

    const primaryHtmlLanguage = getPrimaryLanguage(htmlLanguage)
    const dominantLanguage = detectDominantLanguage(texts)

    if (!dominantLanguage) {
      return {
        status: 'REVIEW_NEEDED',
        details: 'Could not detect dominant language from page text',
        recommendations:
          'Detection failed due to either insufficient text content or unreliable language detection library results. Please manually verify that page content language matches the <html lang> attribute'
      }
    }

    if (!isSameLanguage(primaryHtmlLanguage, dominantLanguage)) {
      return {
        status: 'REVIEW_NEEDED',
        details: {
          htmlLanguage,
          dominantLanguage
        },
        recommendations: `Review and align HTML lang attribute with actual page content language. Choose correct BCP 47 code: <html lang="${dominantLanguage}"> or adjust content to match existing declaration.`
      }
    }

    return {
      status: 'PASSED',
      details: {
        htmlLanguage,
        dominantLanguage
      }
    }
  }
} satisfies PageCheck
