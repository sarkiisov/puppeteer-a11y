import { PageCheck } from '../types'

export default {
  name: '1.1.1 Non-text Content',
  run: async (page) => {
    const imgsWithoutAlt = await page.$$eval('img', (imgs) =>
      imgs
        .filter((img) => !img.alt || img.alt.trim() === '')
        .map((element) =>
          element.id
            ? `#${element.id}`
            : element.className
            ? `${element.tagName.toLowerCase()}.${element.className.split(' ').join('.')}`
            : element.tagName.toLowerCase()
        )
    )

    if (imgsWithoutAlt.length) {
      return {
        status: 'FAILED',
        details: imgsWithoutAlt,
        recommendations: `Add the \`alt\` attribute for ${imgsWithoutAlt.length} image(-s). Alt text should briefly and meaningfully describe the content or purpose of the image`
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
