import { PageCheck } from '../types'

export default {
  id: '1.2.2',
  name: 'Captions (Prerecorded)',
  level: 'A',
  run: async (page) => {
    const videosWithoutCaptions = await page.$$eval('video', (videos) =>
      videos
        .map((video) => {
          const hasCaptions = Array.from(video.querySelectorAll('track')).some(
            (track) => track.kind === 'captions'
          )

          if (!hasCaptions) {
            const selector = video.id
              ? `#${video.id}`
              : video.className
              ? `${video.tagName.toLowerCase()}.${video.className.split(' ').join('.')}`
              : video.tagName.toLowerCase()

            return {
              src: video.currentSrc || video.src,
              selector
            }
          }

          return null
        })
        .filter(Boolean)
    )

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
