import { PageCheck } from '../types'

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

    const problematicElements = await page.$$eval(
      'p, span, a, li, h1, h2, h3, h4, h5, h6, button, label',
      (elements) =>
        elements
          .map((element) => {
            const computedStyle = window.getComputedStyle(element)

            const isOverflowHidden =
              computedStyle.overflow === 'hidden' || computedStyle.overflowY === 'hidden'

            const isTextClipped =
              element.scrollHeight > element.clientHeight ||
              element.scrollWidth > element.clientWidth

            if (isOverflowHidden && isTextClipped) {
              return {
                tag: element.tagName.toLowerCase(),
                textSample: `${element.innerText.slice(0, 100)}${
                  element.innerText.length > 100 ? '...' : ''
                }`,
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
