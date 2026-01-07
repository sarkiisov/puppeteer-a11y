import { ElementHandle } from 'puppeteer-core'

export const getElementSelector = (element: ElementHandle): string => {
  return String(element.remoteObject().description)
}
