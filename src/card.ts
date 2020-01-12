import { IncomingMessage, ServerResponse } from 'http';
import fileSystem from 'fs';
import path from 'path';
import { parseRequest } from './parser';
import { getScreenshot } from './chromium';
import { getHtml } from './template';
import { writeTempFile, pathToFileURL } from './file';

const isDev = process.env.NOW_REGION === 'dev1';
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    console.log('parsing req');
    const parsedReq = parseRequest(req);
    console.log('parsedReq', parsedReq);
    const html = getHtml(parsedReq);
    if (isHtmlDebug) {
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
      return;
    }
    const { text, fileType } = parsedReq;
    const filePath = await writeTempFile(text, html);
    const fileUrl = pathToFileURL(filePath);
    const file = await getScreenshot(fileUrl, fileType, isDev);
    res.statusCode = 200;
    res.setHeader('Content-Type', `image/${fileType}`);
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
    );
    res.end(file);
  } catch (e) {
    console.log('error', e);
    const data = fileSystem.readFileSync(
      path.join(__dirname, '../public/fallback.png')
    );
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/png');
    res.end(data);
    console.error(e);
  }
}
