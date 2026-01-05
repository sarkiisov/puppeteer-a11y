import { franc } from 'franc'
import langs from 'langs'

/**
 * Extract primary language subtag from BCP 47 (e.g., "en-US" -> "en")
 */
export function getPrimaryLanguage(locale: string): string {
  return locale.split(/[-_]/)[0].toLowerCase()
}

/**
 * Determine ISO code type for langs library
 */
function detectCodeType(code: string): '1' | '3' | '2T' {
  if (code.length === 2) return '1'
  if (code.length === 3) return '3'
  return '2T'
}

/**
 * Compare two language codes using ISO 639-1
 */
export function isSameLanguage(code1: string, code2: string): boolean {
  const lang1 = langs.where(detectCodeType(code1), code1)
  const lang2 = langs.where(detectCodeType(code2), code2)

  if (!lang1 || !lang2) return false
  return lang1['1'] === lang2['1']
}

/**
 * Detect dominant language of multiple text blocks
 * Returns ISO 639-3 code (e.g. "eng")
 */
export function detectDominantLanguage(texts: string[]): string | null {
  const charCountMap: Record<string, number> = {}
  let totalChars = 0

  for (const text of texts) {
    const detected = franc(text, { minLength: 10 })
    if (detected === 'und') continue

    const count = text.length
    charCountMap[detected] = (charCountMap[detected] || 0) + count
    totalChars += count
  }

  if (Object.keys(charCountMap).length === 0) return null

  return Object.entries(charCountMap).reduce<string | null>(
    (maxLang, [lang, count]) => (count > (charCountMap[maxLang!] || 0) ? lang : maxLang),
    null
  )
}
