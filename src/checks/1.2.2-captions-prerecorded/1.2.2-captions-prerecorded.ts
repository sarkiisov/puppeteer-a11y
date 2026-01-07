import { ElementHandle } from 'puppeteer-core'
import { PageCheck } from '../../types'
import { getElementSelector } from '../../utils/puppeteer'

export default {
  id: '1.2.2',
  name: 'Captions (Prerecorded)',
  level: 'A',
  run: async (page) => {
    await page.exposeFunction('getElementSelector', getElementSelector)

    const videosWithoutCaptions = await page.evaluate(
      /* c8 ignore start */ async () => {
        const videos = Array.from(document.querySelectorAll('video'))
        const filtered = videos.filter(
          (video) =>
            !Array.from(video.querySelectorAll('track')).some((track) => track.kind === 'captions')
        )

        return Promise.all(
          filtered.map(async (element) => ({
            src: element.src,
            selector: await window.getElementSelector(element as unknown as ElementHandle)
          }))
        )
      } /* c8 ignore end */
    )

    await page.removeExposedFunction('getElementSelector')

    if (videosWithoutCaptions.length > 0) {
      return {
        status: 'REVIEW_NEEDED',
        details: videosWithoutCaptions,
        recommendations:
          'Video elements must have HTML native captions for prerecorded audio content'
      }
    }

    return {
      status: 'PASSED',
      details: 'All videos with audio have HTML native captions'
    }
  }
} satisfies PageCheck
