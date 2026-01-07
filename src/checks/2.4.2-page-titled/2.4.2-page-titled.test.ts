import { Page } from 'puppeteer-core'
import check from './2.4.2-page-titled'

let page: Page

afterEach(async () => {
  if (page) await page.close()
})

describe('WCAG 2.4.2 – Page Titled', () => {
  it('FAILED when page has no title', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <head></head>
        <body>
          <p>No title here</p>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('FAILED')
    expect(result.details).toBe('The page does not have a title or the title is empty')
  })

  it('REVIEW_NEEDED when page title is non-descriptive', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <head>
          <title>Home</title>
        </head>
        <body>
          <p>Non-descriptive title</p>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('REVIEW_NEEDED')
    expect((result.details as { title: string }).title).toBe('Home')
  })

  it('PASSED when page title is descriptive', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <head>
          <title>Accessibility Guidelines – Home Page</title>
        </head>
        <body>
          <p>Descriptive title</p>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('PASSED')
    expect((result.details as { title: string }).title).toBe('Accessibility Guidelines – Home Page')
  })

  it('REVIEW_NEEDED when page title is very short', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <head>
          <title>Hi</title>
        </head>
        <body>
          <p>Short title</p>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('REVIEW_NEEDED')
    expect((result.details as { title: string }).title).toBe('Hi')
  })
})
