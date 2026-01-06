import { franc } from 'franc'
import langs from 'langs'

/**
 * Extracts the primary language subtag from a BCP 47 locale string
 *
 * @param {string} locale - A BCP 47 language tag (e.g., "en-US", "fr-FR")
 * @returns {string} The primary language subtag in lowercase (e.g., "en", "fr")
 */
export function getPrimaryLanguage(locale: string): string {
  return locale.split(/[-_]/)[0].toLowerCase()
}

/**
 * Determines the ISO code type for the langs library
 *
 * @param {string} code - A language code (ISO 639-1, ISO 639-2/2T, or ISO 639-3)
 * @returns {'1' | '3' | '2T'} The code type compatible with langs library lookup
 */
function detectCodeType(code: string): '1' | '3' | '2T' {
  if (code.length === 2) return '1'
  if (code.length === 3) return '3'
  return '2T'
}

/**
 * Compares two language codes and determines if they represent the same language
 *
 * @param {string} code1 - First language code (ISO 639-1, ISO 639-2/2T, or ISO 639-3)
 * @param {string} code2 - Second language code (ISO 639-1, ISO 639-2/2T, or ISO 639-3)
 * @returns {boolean} True if both codes represent the same language, false otherwise
 */
export function isSameLanguage(code1: string, code2: string): boolean {
  const lang1 = langs.where(detectCodeType(code1), code1)
  const lang2 = langs.where(detectCodeType(code2), code2)

  if (!lang1 || !lang2) return false
  return lang1['1'] === lang2['1']
}

/**
 * Detects the dominant language from an array of text blocks
 *
 * @param {string[]} texts - An array of text strings to analyze
 * @returns {string | null} ISO 639-3 code of the dominant language (e.g., "eng"), or null if detection fails
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
