import { ElementHandle } from 'puppeteer-core'
import { PageCheck } from '../../types'
import { getElementSelector } from '../../utils/puppeteer'

export default {
  id: '1.4.4',
  name: 'Resize Text',
  level: 'AA',
  run: async (page) => {
    await page.evaluate(
      /* c8 ignore start */ () => {
        document.body.style.zoom = '2'
      } /* c8 ignore end */
    )

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
                text: element.textContent,
                selector: await window.getElementSelector(element as unknown as ElementHandle)
              }
            }

            return null
          })
        )

        return results.filter(Boolean)
      }
      /* c8 ignore end */
    )

    await page.removeExposedFunction('getElementSelector')

    await page.evaluate(
      /* c8 ignore start */ () => {
        document.body.style.zoom = '1'
      } /* c8 ignore end */
    )

    if (problematicElements.length > 0) {
      return {
        status: 'FAILED',
        details: problematicElements,
        recommendations:
          'Text elements must be resizable up to 200 percent without being clipped or overlapping other content'
      }
    }

    return {
      status: 'PASSED',
      details:
        'Text can be resized to 200 percent without visible clipping or loss of functionality'
    }
  }
} satisfies PageCheck
