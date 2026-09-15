import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({ limit: '10mb' }));

/**
 * Proxy API for Google Apps Script Web App (Excel / Google Sheets sync)
 * Prevents CORS issues and manages 302 redirects seamlessly
 */
app.post('/api/sheet-proxy', async (req, res) => {
  try {
    const { scriptUrl, action, data } = req.body;
    if (!scriptUrl || typeof scriptUrl !== 'string') {
      res.status(400).json({ success: false, error: 'Google Apps Script Web App URL is required' });
      return;
    }

    if (!scriptUrl.includes('script.google.com')) {
      res.status(400).json({ success: false, error: 'Invalid URL. Must be a script.google.com URL' });
      return;
    }

    // Google Apps Script accepts GET with query parameters or POST with payload
    if (action === 'getData' || action === 'test') {
      const url = new URL(scriptUrl);
      url.searchParams.set('action', action);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });

      const text = await response.text();
      const isLoginRedirect = response.url.includes('accounts.google.com') || response.url.includes('ServiceLogin');
      const isHtml = text.trim().startsWith('<!doctype') || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html') || text.includes('drive-logo');

      if (isLoginRedirect || response.status === 401 || (isHtml && !text.includes('"status"'))) {
        res.status(403).json({
          success: false,
          status: 'error',
          isPermissionError: true,
          error: "Google Apps Script Permission Error: Google Sign-in page redirect ho raha hai. Iska matlab Apps Script me 'Who has access' (Kisko access hai) me 'Anyone' (Koi bhi) chuna nahi gaya hai."
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Google Apps Script returned status ${response.status}: ${response.statusText}`);
      }

      try {
        const json = JSON.parse(text);
        res.json({ success: true, ...json });
      } catch {
        res.json({ success: true, raw: text });
      }
    } else {
      // POST action (saveData / syncData)
      const response = await fetch(scriptUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify({ action, data })
      });

      const text = await response.text();
      const isLoginRedirect = response.url.includes('accounts.google.com') || response.url.includes('ServiceLogin');
      const isHtml = text.trim().startsWith('<!doctype') || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html') || text.includes('drive-logo');

      if (isLoginRedirect || response.status === 401 || (isHtml && !text.includes('"status"'))) {
        res.status(403).json({
          success: false,
          status: 'error',
          isPermissionError: true,
          error: "Google Apps Script Permission Error: Google access deny kar raha hai. Apps Script deploy settings me 'Who has access' ko 'Anyone' karein."
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Google Apps Script returned status ${response.status}: ${response.statusText}`);
      }

      try {
        const json = JSON.parse(text);
        res.json({ success: true, ...json });
      } catch {
        res.json({ success: true, raw: text });
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown proxy error';
    console.error('Sheet proxy error:', errorMessage);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
