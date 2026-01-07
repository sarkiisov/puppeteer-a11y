import { ElementHandle } from 'puppeteer-core'
import { PageCheck } from '../../types'
import { getElementSelector } from '../../utils/puppeteer'

declare global {
  interface Window {
    getElementSelector: Asynchronous<typeof getElementSelector>
  }
}

export default {
  id: '1.1.1',
  name: 'Non-text Content',
  level: 'A',
  run: async (page) => {
    await page.exposeFunction('getElementSelector', getElementSelector)

    const imagesWithoutAlt = await page.evaluate(
      /* c8 ignore start */ async () => {
        const images = Array.from(document.querySelectorAll('img'))
        const filtered = images.filter((img) => !img.alt || img.alt.trim() === '')

        return Promise.all(
          filtered.map(async (element) => ({
            src: element.src,
            selector: await window.getElementSelector(element as unknown as ElementHandle)
          }))
        )
      } /* c8 ignore end */
    )

    await page.removeExposedFunction('getElementSelector')

    if (imagesWithoutAlt.length) {
      return {
        status: 'FAILED',
        details: imagesWithoutAlt,
        recommendations: `Add the alt attribute for ${imagesWithoutAlt.length} image(-s). Alt text should briefly and meaningfully describe the content or purpose of the image`
      }
    }

    return {
      status: 'REVIEW_NEEDED',
      details:
        'Some non-text content may lack meaningful alternative text, including images, icons, buttons, SVGs, and other visual media',
      recommendations:
        'Provide descriptive alt text, labels, or ARIA attributes. Manual review is needed for complex or decorative content'
    }
  }
} satisfies PageCheck
