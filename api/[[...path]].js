/**
 * Vercel Serverless Proxy — проксирует /api/* на backend.
 * Требует: VERCEL_BACKEND_URL (например https://your-backend.onrender.com)
 */
export const config = {
  runtime: 'nodejs',
};

function getBody(req) {
  if (['GET', 'HEAD'].includes(req.method)) return undefined;
  const body = req.body;
  if (!body) return undefined;
  return typeof body === 'string' ? body : JSON.stringify(body);
}

export default async function handler(req, res) {
  const backendUrl = process.env.VERCEL_BACKEND_URL;
  if (!backendUrl) {
    return res.status(500).json({
      error: 'Backend URL не настроен. Добавьте VERCEL_BACKEND_URL в Vercel.',
    });
  }

  const path = req.query.path || [];
  const pathStr = Array.isArray(path) ? path.join('/') : path;
  const base = backendUrl.replace(/\/$/, '');
  const query = (req.url || '').includes('?') ? req.url.split('?')[1] || '' : '';
  const targetUrl = query ? `${base}/api/${pathStr}?${query}` : `${base}/api/${pathStr}`;

  try {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers['content-length'];

    const fetchOptions = {
      method: req.method,
      headers,
      body: getBody(req),
    };

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    // Пересылаем Set-Cookie (важно для refresh_token при логине)
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    res.status(response.status).setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    return res.send(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(502).json({
      error: 'Не удалось подключиться к backend. Проверьте VERCEL_BACKEND_URL.',
    });
  }
}
