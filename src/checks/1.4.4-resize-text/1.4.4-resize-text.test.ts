import { Page } from 'puppeteer-core'
import check from './1.4.4-resize-text'

let page: Page

afterEach(async () => {
  if (page) await page.close()
})

describe('WCAG 1.4.4 – Resize Text', () => {
  it('FAILED when text overflows its container after zoom', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <div style="white-space: nowrap; max-width: 30%; overflow: hidden;">
            <p id="clipped-text">
              This is a long paragraph that will overflow its container when zoomed in.
            </p>
          </div>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('FAILED')
    expect(result.details).toHaveLength(1)
    expect((result.details[0] as { text: string; selector: string }).selector).toBe('#clipped-text')
  })

  it('PASSED when text resizes without clipping', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <div style="max-width: none; overflow: visible;">
            <p id="normal-text">
              This text will resize freely without clipping.
            </p>
          </div>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('PASSED')
  })

  it('detects text clipped due to overflow-x hidden', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <div style="white-space: nowrap; max-width: 0; overflow: hidden;">
            <h1 id="heading-clipped">Some very long inline text that overflows container</h1>
          </div>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('FAILED')
    expect(result.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ selector: '#heading-clipped' })])
    )
  })
})
