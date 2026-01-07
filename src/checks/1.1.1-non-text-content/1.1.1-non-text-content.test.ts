import type { Page } from 'puppeteer-core'
import check from './1.1.1-non-text-content'

let page: Page

afterEach(async () => {
  if (page) await page.close()
})

describe('WCAG 1.1.1 – Non-text Content', () => {
  it('FAILED when images have no alt', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <img src="cat.jpg">
          <img src="dog.jpg" alt="">
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('FAILED')
    expect(result.details).toHaveLength(2)

    expect(result.details[0]).toHaveProperty('src', 'cat.jpg')
    expect(result.details[0]).toHaveProperty('selector')
    expect(result.details[1]).toHaveProperty('src', 'dog.jpg')
    expect(result.details[1]).toHaveProperty('selector')
  })

  it('REVIEW_NEEDED when all images have alt', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <img src="cat.jpg" alt="A black cat">
          <img src="dog.jpg" alt="A brown dog">
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('REVIEW_NEEDED')
  })
})
