import type { Page } from 'puppeteer-core'
import check from './1.2.2-captions-prerecorded'

let page: Page

afterEach(async () => {
  if (page) await page.close()
})

describe('WCAG 1.2.2 – Captions (Prerecorded)', () => {
  it('REVIEW_NEEDED when video has no captions track', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <video id="video1" src="movie.mp4" controls></video>
          <video class="intro" src="intro.mp4"></video>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('REVIEW_NEEDED')
    expect(result.details).toHaveLength(2)

    expect(result.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ selector: 'video#video1' }),
        expect.objectContaining({ selector: 'video.intro' })
      ])
    )
  })

  it('PASSED when all videos have captions track', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <video src="movie.mp4" controls>
            <track kind="captions" src="movie.vtt" srclang="en" label="English">
          </video>

          <video src="intro.mp4">
            <track kind="captions" src="intro.vtt">
          </video>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('REVIEW_NEEDED')
  })

  it('ignores non-captions tracks (subtitles only)', async () => {
    page = await globalThis.__BROWSER__.newPage()

    await page.setContent(`
      <html>
        <body>
          <video id="video2" src="movie.mp4">
            <track kind="subtitles" src="movie.vtt">
          </video>
        </body>
      </html>
    `)

    const result = await check.run(page)

    expect(result.status).toBe('REVIEW_NEEDED')
    expect(result.details).toHaveLength(1)
    expect((result.details[0] as { src: string; selector: string }).selector).toBe('video#video2')
  })
})
