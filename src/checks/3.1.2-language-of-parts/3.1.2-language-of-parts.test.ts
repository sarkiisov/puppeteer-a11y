import { Page } from 'puppeteer-core'
import check from './3.1.2-language-of-parts'

let page: Page

afterEach(async () => {
  if (page) await page.close()
})

describe('WCAG 3.1.2 – Language of Parts', () => {
  it('PASSED when all elements with lang match their text content', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html lang="en">
        <body>
          <p lang="en" id="para-en">
            This is a long paragraph in English. It contains multiple sentences to ensure the language detection works reliably.
            We add several more sentences to provide enough context and make English the dominant language for this element.
          </p>
          <span lang="ru" id="span-ru">
            Это длинный русский текст, который точно соответствует lang="ru". Добавлено несколько предложений для надёжного распознавания языка.
            Проверяем работу проверки элементов с атрибутом lang.
          </span>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('PASSED')
  })

  it('REVIEW_NEEDED when element lang does not match its text, with longer content', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html lang="en">
        <body>
          <!-- Declared as English, but text is Russian and long -->
          <p lang="en" id="para-mismatch">
            Это русский текст, который достаточно длинный для точного определения языка.
            Он содержит несколько предложений, чтобы увеличить вероятность корректного определения языка.
            Проверяем работу проверки элементов с атрибутом lang и несоответствующим текстом.
          </p>

          <!-- Correctly labeled -->
          <span lang="ru" id="span-correct">
            Это ещё один абзац на русском языке, который правильно размечен с помощью lang="ru".
            Добавлено несколько предложений, чтобы повысить точность распознавания языка.
          </span>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('REVIEW_NEEDED')

    expect(result.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          declaredLanguage: 'en',
          detectedLanguage: expect.stringMatching(/ru/i),
          selector: 'p#para-mismatch'
        })
      ])
    )

    expect(result.details).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ selector: '#span-correct' })])
    )
  })

  it('PASSED when there are no lang attributes other than <html>', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html lang="en">
        <body>
          <p>
            This is English text with multiple sentences to ensure sufficient content for language detection.
          </p>
          <div>
            Another English paragraph with enough words to guarantee detection works properly.
          </div>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('PASSED')
  })

  it('REVIEW_NEEDED when element has insufficient text for detection', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html lang="en">
        <body>
          <p lang="fr" id="short-text">Hello</p>
        </body>
      </html>
    `)

    const result = await check.run(page)
    const details = result.details as { detectedLanguage: string; selector: string }[]

    expect(result.status).toBe('REVIEW_NEEDED')
    expect(details[0].detectedLanguage).toBeNull()
    expect(details[0].selector).toBe('p#short-text')
  })
})
