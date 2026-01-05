import { PageCheck } from '../types'
import { contrastRatio } from '../utils/contrast'

export default {
  name: '1.4.3 Contrast',
  run: async (page) => {
    const elements = await page.$$eval('p, span, a, li, h1, h2, h3, h4, h5, h6, button', (els) =>
      els.map((el) => {
        let backgroundColor = 'rgba(0, 0, 0, 0)'
        let currentElement: HTMLElement = el

        while (currentElement) {
          const style = window.getComputedStyle(currentElement)
          const nextBackgroundColor = style.backgroundColor

          if (nextBackgroundColor !== 'rgba(0, 0, 0, 0)' && nextBackgroundColor !== 'transparent') {
            backgroundColor = nextBackgroundColor
            break
          }

          currentElement = currentElement.parentElement as HTMLElement
        }

        const style = getComputedStyle(el)
        return {
          text: el.innerText,
          color: style.color,
          backgroundColor,
          selector: el.id
            ? `#${el.id}`
            : el.className
            ? `${el.tagName.toLowerCase()}.${el.className.split(' ').join('.')}`
            : el.tagName.toLowerCase()
        }
      })
    )

    const failedElements: any[] = []

    for (const element of elements) {
      const ratio = contrastRatio(element.color, element.backgroundColor)
      if (ratio < 4.5) {
        failedElements.push({ ...element, contrast: ratio.toFixed(2) })
      }
    }

    if (failedElements.length) {
      return {
        status: 'FAILED',
        details: failedElements,
        recommendations: 'Text elements must have a contrast ratio of at least 4.5:1'
      }
    }

    return { status: 'PASSED' }
  }
} satisfies PageCheck
