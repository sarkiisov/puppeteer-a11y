import { Page } from 'puppeteer-core'
import check from './1.4.12-text-spacing'

let page: Page

afterEach(async () => {
  if (page) await page.close()
})

describe('WCAG 1.4.12 – Text Spacing', () => {
  it('REVIEW_NEEDED when paragraph is clipped due to applied spacing', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <div style="height: 40px; width: 200px; overflow: hidden;">
            <p id="clipped-paragraph">
              This is a paragraph that will overflow its container after WCAG text spacing is applied. The line height and letter spacing increase the scrollHeight.
            </p>
          </div>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('REVIEW_NEEDED')
    expect(result.details.length).toBe(1)
    expect((result.details[0] as { text: string; selector: string }).selector).toBe(
      'p#clipped-paragraph'
    )
  })

  it('PASSED when container has enough space for spacing', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <div style="width: 500px; height: auto; overflow: visible;">
            <p id="normal-text">
              This paragraph has enough space. Increasing line-height, letter-spacing, and word-spacing will not clip the content.
            </p>
          </div>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('PASSED')
  })
})
