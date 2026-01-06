import { PageCheck } from '../types'

export default {
  id: '1.4.4',
  name: 'Resize Text',
  level: 'AA',
  run: async (page) => {
    await page.evaluate(() => {
      document.body.style.zoom = '2'
    })

    const problematicElements = await page.$$eval(
      'p, span, a, li, h1, h2, h3, h4, h5, h6, button, label',
      (elements) =>
        elements
          .map((element) => {
            const computedStyle = window.getComputedStyle(element)

            const isOverflowHidden =
              computedStyle.overflow === 'hidden' ||
              computedStyle.overflowY === 'hidden' ||
              computedStyle.overflowX === 'hidden'

            const isTextClipped =
              element.scrollHeight > element.clientHeight ||
              element.scrollWidth > element.clientWidth

            if (isOverflowHidden && isTextClipped) {
              return {
                textSample: element.innerText.slice(0, 100),
                selector: element.id
                  ? `#${element.id}`
                  : element.className
                  ? `${element.tagName.toLowerCase()}.${element.className.split(' ').join('.')}`
                  : element.tagName.toLowerCase()
              }
            }

            return null
          })
          .filter(Boolean)
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
