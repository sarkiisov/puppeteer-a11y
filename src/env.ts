import { z } from 'zod'

const envSchema = z.object({
  PUPPETEER_EXECUTABLE_PATH: z.string().min(1),
  PUPPETEER_HEADLESS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  PUPPETEER_TIMEOUT_MS: z.string().regex(/^\d+$/).default('30000').transform(Number),
  PUPPETEER_WIDTH: z.string().regex(/^\d+$/).default('800').transform(Number),
  PUPPETEER_HEIGHT: z.string().regex(/^\d+$/).default('600').transform(Number)
})

export const env = envSchema.parse(process.env)
