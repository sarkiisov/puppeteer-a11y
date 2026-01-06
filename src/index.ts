import { program } from 'commander'
import { launchBrowser } from './browser'

import path from 'path'

import { runPageChecks } from './utils/check'

import checks from './checks'

program.name('puppeteer-a11y')

program
  .command('screenshot')
  .argument('<url>', 'URL to visit')
  .option('-o, --output <file>', 'Output screenshot file', 'screenshot.png')
  .action(async (url: string, options: any) => {
    const browser = await launchBrowser()
    const page = await browser.newPage()

    await page.goto(url, { waitUntil: 'networkidle2' })

    const outputPath = path.resolve(options.output)

    await page.screenshot({ path: outputPath })

    console.log(`Screenshot saved to ${outputPath}`)

    await browser.close()
  })

program
  .command('run')
  .argument('<url>', 'URL to visit')
  .action(async (url: string) => {
    const browser = await launchBrowser()
    const page = await browser.newPage()

    await page.goto(url, { waitUntil: 'networkidle2' })

    const pageCheckResults = await runPageChecks(page, checks)

    console.log(JSON.stringify(pageCheckResults, null, 2))

    await browser.close()
  })

program.parse(process.argv)
