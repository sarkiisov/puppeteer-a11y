/**
 * Calculates the relative luminance of a color according to WCAG formula
 *
 * @param {number} r - Red channel value (0-255)
 * @param {number} g - Green channel value (0-255)
 * @param {number} b - Blue channel value (0-255)
 * @returns {number} Relative luminance (0 = darkest, 1 = lightest)
 */
const luminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((v) => {
    v = v / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

/**
 * Calculates the contrast ratio between two colors according to WCAG
 *
 * @param {string} foreground - Foreground color in rgb(a) format, e.g., "rgb(255, 255, 255)"
 * @param {string} background - Background color in rgb(a) format, e.g., "rgb(0, 0, 0)"
 * @returns {number} Contrast ratio (1 = no contrast, 21 = maximum contrast)
 */
export const contrastRatio = (foreground: string, background: string): number => {
  const parseRGB = (color: string): [number, number, number] => {
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!m) return [0, 0, 0]
    return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]
  }

  const [r1, g1, b1] = parseRGB(foreground)
  const [r2, g2, b2] = parseRGB(background)

  const L1 = luminance(r1, g1, b1)
  const L2 = luminance(r2, g2, b2)

  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}
