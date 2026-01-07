import { Page } from 'puppeteer-core'
import check from './1.4.3-contrast-minimum'

let page: Page

afterEach(async () => {
  if (page) await page.close()
})

describe('WCAG 1.4.3 – Contrast (Minimum)', () => {
  it('FAILED when text contrast is below 4.5:1', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body style="background: #ffffff">
          <p id="low-contrast" style="color: #cccccc">
            Low contrast text
          </p>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('FAILED')
    expect(result.details.length).toBeGreaterThan(0)

    expect(result.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          selector: 'p#low-contrast'
        })
      ])
    )
  })

  it('PASSED when contrast is sufficient', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body style="background: #ffffff">
          <p id="enough-contrast" style="color: #000000">
            High contrast text
          </p>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('PASSED')
  })

  it('resolves background color from nearest non-transparent parent', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body style="background: #ffffff">
          <div style="background: #ffffff">
            <div style="background: rgb(240, 240, 240)">
              <span id="nested-text" style="color: rgb(200, 200, 200)">
                Nested low contrast text
              </span>
            </div>
          </div>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('FAILED')
    expect(result.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          selector: 'span#nested-text',
          backgroundColor: 'rgb(240, 240, 240)'
        })
      ])
    )
  })

  it('resolves background color from higher-level parent when nearest is transparent', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body style="background: rgb(255, 255, 255)">
          <section style="background: transparent">
            <div style="background: transparent">
              <p id="deep-text" style="color: rgb(190, 190, 190)">
                Deeply nested text
              </p>
            </div>
          </section>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('FAILED')
    expect(result.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          selector: 'p#deep-text',
          backgroundColor: 'rgb(255, 255, 255)'
        })
      ])
    )
  })
})
