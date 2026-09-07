import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 8787);

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body, null, 2));
}

async function body(request) {
  let data = '';
  for await (const chunk of request) data += chunk;
  try { return JSON.parse(data || '{}'); }
  catch { return null; }
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const html = await readFile(join(root, 'index.html'), 'utf8');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  if (req.method === 'POST' && req.url === '/api/web4/agent') {
    const input = await body(req);
    if (!input) return json(res, 400, { error: 'Invalid JSON' });
    if (input.protocol !== 'web4') return json(res, 400, { error: 'Unsupported protocol' });
    if (!input.identity) return json(res, 401, { error: 'Identity required' });

    return json(res, 200, {
      protocol: 'web4',
      version: input.version || '1.0',
      request: {
        identity: input.identity,
        task: input.task || null
      },
      agent: {
        id: 'web4-agent-001',
        status: 'active',
        capabilities: input.capabilities || []
      },
      result: {
        type: 'agent-response',
        message: 'Web4 agent successfully processed the request.'
      },
      verification: {
        verified: true,
        timestamp: new Date().toISOString()
      }
    });
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`Web4 AI Agent example: http://localhost:${port}`);
});
