import { launch, Page } from 'puppeteer-core';
import { getOptions } from './options';
let _page: Page | null;

async function getPage(isDev: boolean) {
  if (_page) {
    return _page;
  }
  const options = await getOptions(isDev);
  const browser = await launch(options);
  _page = await browser.newPage();
  return _page;
}

export async function getScreenshot(
  url: string,
  type: FileType,
  isDev: boolean
) {
  const page = await getPage(isDev);
  await page.setViewport({ width: 2048, height: 1170 });
  await page.goto(url);
  await page.evaluate(() => (document.body.style.background = 'transparent'));

  // const file = await page.screenshot({ type, omitBackground: true });
  const file = await page.screenshot({ type, omitBackground: true });
  return file;
}
