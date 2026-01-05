import { z } from 'zod'

const envSchema = z.object({
  PUPPETEER_EXECUTABLE_PATH: z.string().min(1).optional(),
  PUPPETEER_HEADLESS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  PUPPETEER_TIMEOUT_MS: z.string().regex(/^\d+$/).default('30000').transform(Number)
})

export const env = envSchema.parse(process.env)
