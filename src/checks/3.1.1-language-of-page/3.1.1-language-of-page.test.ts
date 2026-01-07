import { Page } from 'puppeteer-core'
import check from './3.1.1-language-of-page'

let page: Page

afterEach(async () => {
  if (page) await page.close()
})

describe('WCAG 3.1.1 – Language of Page', () => {
  it('FAILED when <html> has no lang attribute', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <p>This is some text</p>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('FAILED')
    expect(result.details).toBe('Could not find lang attribute on <html>')
  })

  it('REVIEW_NEEDED when page has insufficient text for detection', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html lang="en">
        <body>
          <p> </p>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('REVIEW_NEEDED')
    expect(result.details).toBe('Could not detect dominant language from page text')
  })

  it('PASSED when html lang is Russian and entire content is Russian', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
    <html lang="ru">
      <body>
        <p>Это пример текста на русском языке. Он предназначен для проверки корректного определения языка страницы.</p>
      </body>
    </html>
  `)

    const result = await check.run(page)
    const details = result.details as { htmlLanguage: string; dominantLanguage: string }

    expect(result.status).toBe('PASSED')
    expect(details.htmlLanguage).toBe('ru')
    expect(details.dominantLanguage.toLowerCase()).toBe('rus')
  })

  it('PASSED when html lang="en" and page has mixed Russian and English text, majority English', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
    <html lang="en">
      <body>
        <!-- Short Russian paragraph -->
        <p id="russian-para">
          Это короткий русский текст для тестирования.
        </p>

        <!-- Longer English paragraph -->
        <p id="english-para">
          This is a longer paragraph in English. It contains enough sentences and words to make English the dominant language
          of the page. By including multiple sentences and extra content, we ensure that language detection sees English as the
          primary language, even though there is some Russian content present.
        </p>
      </body>
    </html>
  `)

    const result = await check.run(page)
    const details = result.details as { htmlLanguage: string; dominantLanguage: string }

    expect(result.status).toBe('PASSED')
    expect(details.htmlLanguage).toBe('en')
    expect(details.dominantLanguage.toLowerCase()).toBe('eng')
  })
})
