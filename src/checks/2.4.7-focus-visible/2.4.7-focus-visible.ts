import { ElementHandle } from 'puppeteer-core'
import { PageCheck } from '../../types'
import { getElementSelector } from '../../utils/puppeteer'

export default {
  id: '2.4.7',
  name: 'Focus Visible',
  level: 'AA',
  run: async (page) => {
    await page.exposeFunction('getElementSelector', getElementSelector)

    const elementsWithoutVisibleFocus = await page.$$eval(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
      /* c8 ignore start */ async (elements) => {
        const results = await Promise.all(
          elements.map(async (element) => {
            ;(element as HTMLElement).focus()

            const style = window.getComputedStyle(element)
            const outlineWidth = parseFloat(style.outlineWidth || '0')
            const outlineColor = style.outlineColor || ''
            const boxShadow = style.boxShadow || ''
            const borderWidth = parseFloat(style.borderWidth || '0')

            const outlineVisible =
              outlineWidth > 0 &&
              outlineColor !== 'rgba(0, 0, 0, 0)' &&
              outlineColor !== 'transparent'
            const boxShadowVisible = boxShadow !== 'none' && boxShadow !== ''
            const borderVisible = borderWidth > 0

            const hasVisibleFocus = outlineVisible || boxShadowVisible || borderVisible

            ;(element as HTMLElement).blur()

            if (!hasVisibleFocus) {
              const selector = await window.getElementSelector(element as unknown as ElementHandle)

              return selector
            } else {
              return null
            }
          })
        )

        return results.filter(Boolean)
      }
      /* c8 ignore end */
    )

    await page.removeExposedFunction('getElementSelector')

    if (elementsWithoutVisibleFocus.length > 0) {
      return {
        status: 'FAILED',
        details: elementsWithoutVisibleFocus,
        recommendations:
          'Keyboard focus indicator must be visible for all focusable elements, ensure outline, box-shadow, or border are applied with non-zero values'
      }
    }

    return {
      status: 'PASSED',
      details:
        'All focusable elements have a visible focus indicator with proper outline, box-shadow, or border'
    }
  }
} satisfies PageCheck
