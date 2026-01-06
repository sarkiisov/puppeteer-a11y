import { PageCheck } from '../types'

export default {
  id: '2.4.7',
  name: 'Focus Visible',
  level: 'AA',
  run: async (page) => {
    const focusableSelectors = [
      'a[href]',
      'button',
      'input',
      'textarea',
      'select',
      '[tabindex]:not([tabindex="-1"])'
    ]

    const focusableElements = await page.$$(focusableSelectors.join(','))

    const elementsWithoutVisibleFocus: string[] = []

    for (const element of focusableElements) {
      await element.focus()

      const isVisibleFocus = await page.evaluate((el) => {
        const style = window.getComputedStyle(el)
        const outlineWidth = parseFloat(style.outlineWidth || '0')
        const outlineColor = style.outlineColor || ''
        const boxShadow = style.boxShadow || ''
        const borderWidth = parseFloat(style.borderWidth || '0')

        const outlineVisible =
          outlineWidth > 0 && outlineColor !== 'rgba(0, 0, 0, 0)' && outlineColor !== 'transparent'
        const boxShadowVisible = boxShadow !== 'none' && boxShadow !== ''
        const borderVisible = borderWidth > 0

        return outlineVisible || boxShadowVisible || borderVisible
      }, element)

      if (!isVisibleFocus) {
        const selector = await page.evaluate((el) => {
          if (el.id) return `#${el.id}`
          if (el.className)
            return `${el.tagName.toLowerCase()}.${el.className.split(' ').join('.')}`
          return el.tagName.toLowerCase()
        }, element)

        elementsWithoutVisibleFocus.push(selector)
      }
    }

    if (elementsWithoutVisibleFocus.length > 0) {
      return {
        status: 'REVIEW_NEEDED',
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
