import { ElementHandle } from 'puppeteer-core'
import { PageCheck } from '../../types'
import { contrastRatio } from '../../utils/contrast'
import { getElementSelector } from '../../utils/puppeteer'

export default {
  id: '1.4.3',
  name: 'Contrast (Minimum)',
  level: 'AA',
  run: async (page) => {
    await page.exposeFunction('getElementSelector', getElementSelector)

    const textElements = await page.$$eval(
      'p, span, a, li, h1, h2, h3, h4, h5, h6, button',
      /* c8 ignore start */ async (elements) => {
        return Promise.all(
          elements.map(async (element) => {
            let resolvedBackgroundColor = 'rgba(0, 0, 0, 0)'
            let currentElement: HTMLElement | null = element

            while (currentElement) {
              const computedStyle = window.getComputedStyle(currentElement)
              const currentBackgroundColor = computedStyle.backgroundColor

              if (
                currentBackgroundColor !== 'rgba(0, 0, 0, 0)' &&
                currentBackgroundColor !== 'transparent'
              ) {
                resolvedBackgroundColor = currentBackgroundColor
                break
              }

              currentElement = currentElement.parentElement
            }

            resolvedBackgroundColor =
              resolvedBackgroundColor === 'rgba(0, 0, 0, 0)' ||
              resolvedBackgroundColor === 'transparent'
                ? 'rgb(255, 255, 255)'
                : resolvedBackgroundColor

            const elementStyle = window.getComputedStyle(element)

            return {
              text: element.textContent,
              color: elementStyle.color,
              backgroundColor: resolvedBackgroundColor,
              selector: await window.getElementSelector(element as unknown as ElementHandle)
            }
          })
        )
      }
      /* c8 ignore end */
    )

    await page.removeExposedFunction('getElementSelector')

    const contrastViolations: {
      text: string
      color: string
      backgroundColor: string
      selector: string
      contrast: string
    }[] = []

    for (const textElement of textElements) {
      const ratio = contrastRatio(textElement.color, textElement.backgroundColor)

      if (ratio < 4.5) {
        contrastViolations.push({
          ...textElement,
          contrast: ratio.toFixed(2)
        })
      }
    }

    if (contrastViolations.length > 0) {
      return {
        status: 'FAILED',
        details: contrastViolations,
        recommendations:
          'Text elements must have a contrast ratio of at least 4.5:1 against their background'
      }
    }

    return {
      status: 'PASSED',
      details: 'All evaluated text elements meet the minimum contrast ratio requirement of 4.5:1'
    }
  }
} satisfies PageCheck
