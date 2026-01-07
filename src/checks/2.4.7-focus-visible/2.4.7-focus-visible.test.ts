import { Page } from 'puppeteer-core'
import check from './2.4.7-focus-visible'

let page: Page

afterEach(async () => {
  if (page) await page.close()
})

describe('WCAG 2.4.7 – Focus Visible', () => {
  it('FAILED when focusable elements have no visible focus', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <head>
          <style>
            * { border: none; outline: none; box-shadow: none }
          </style>
        </head>
        <body>
          <a href="#" id="link1">Link</a>
          <button id="button1">Button</button>
          <input type="text" id="input1" />
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('FAILED')
    expect(result.details).toEqual(
      expect.arrayContaining(['a#link1', 'button#button1', 'input#input1'])
    )
  })

  it('PASSED when focusable elements have visible focus', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <head>
          <style>
            a:focus, button:focus, input:focus {
              outline: 2px solid blue;
            }
          </style>
        </head>
        <body>
          <a href="#" id="link2">Link</a>
          <button id="button2">Button</button>
          <input type="text" id="input2" />
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('PASSED')
  })

  it('FAILED when only some elements have visible focus', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <head>
          <style>
            * { border: none; outline: none; box-shadow: none }

            button:focus { outline: 2px solid green; }
          </style>
        </head>
        <body>
          <a href="#" id="link3">Link</a>
          <button id="button3">Button</button>
          <input type="text" id="input3" />
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('FAILED')
    expect(result.details).toEqual(expect.arrayContaining(['a#link3', 'input#input3']))
    expect(result.details).not.toContain('#button3')
  })
})
