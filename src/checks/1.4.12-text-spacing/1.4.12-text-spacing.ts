import { ElementHandle } from 'puppeteer-core'
import { PageCheck } from '../../types'
import { getElementSelector } from '../../utils/puppeteer'

export default {
  id: '1.4.12',
  name: 'Text Spacing',
  level: 'AA',
  run: async (page) => {
    await page.addStyleTag({
      content: `
        * {
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }

        p, h1, h2, h3, h4, h5, h6, li {
          margin-bottom: 2em !important;
        }
      `
    })

    await page.exposeFunction('getElementSelector', getElementSelector)

    const problematicElements = await page.$$eval(
      'p, span, a, li, h1, h2, h3, h4, h5, h6, button, label',
      /* c8 ignore start */ async (elements) => {
        const results = await Promise.all(
          elements.map(async (element) => {
            let isOverflown = false

            const elementRect = element.getBoundingClientRect()

            let currentParent = element.parentElement
            while (currentParent) {
              const parentStyle = window.getComputedStyle(currentParent)
              const parentRect = currentParent.getBoundingClientRect()

              if (parentStyle.overflow !== 'visible') {
                const exceedsParent =
                  elementRect.top < parentRect.top ||
                  elementRect.bottom > parentRect.bottom ||
                  elementRect.left < parentRect.left ||
                  elementRect.right > parentRect.right

                if (exceedsParent) {
                  isOverflown = true
                  break
                }
              }

              currentParent = currentParent.parentElement
            }

            if (!isOverflown) {
              const exceedsViewport =
                elementRect.top < 0 ||
                elementRect.bottom > window.innerHeight ||
                elementRect.left < 0 ||
                elementRect.right > window.innerWidth

              if (exceedsViewport) {
                isOverflown = true
              }
            }

            const isClipped =
              element.scrollHeight > element.clientHeight ||
              element.scrollWidth > element.clientWidth

            if (isOverflown || isClipped) {
              return {
                text: String(element.textContent),
                selector: await window.getElementSelector(element as unknown as ElementHandle)
              }
            }
          })
        )

        return results.filter(Boolean)
      }
      /* c8 ignore end */
    )

    await page.removeExposedFunction('getElementSelector')

    if (problematicElements.length > 0) {
      return {
        status: 'REVIEW_NEEDED',
        details: problematicElements,
        recommendations:
          'Ensure that increasing line height, paragraph spacing, letter spacing, and word spacing does not cause text to be clipped, overlapped, or hidden. Avoid fixed heights and overflow:hidden on text containers'
      }
    }

    return {
      status: 'PASSED',
      details:
        'Applying WCAG-required text spacings did not cause visible content clipping or layout issues'
    }
  }
} satisfies PageCheck
