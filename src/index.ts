import { program } from 'commander'
import { launchBrowser } from './browser'

import path from 'path'

program.name('puppeteer-a11y')

program
  .command('screenshot')
  .argument('<url>', 'URL to visit')
  .option('-o, --output <file>', 'Output screenshot file', 'screenshot.png')
  .action(async (url: string, options: any) => {
    const browser = await launchBrowser()
    const page = await browser.newPage()

    console.log('URL', url)

    await page.goto(url, { waitUntil: 'networkidle2' })
    console.log(await page.title())

    const outputPath = path.resolve(options.output)
    await page.screenshot({ path: outputPath })
    console.log(`Screenshot saved to ${outputPath}`)

    await browser.close()
  })

program.parse(process.argv)
