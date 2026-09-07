import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 8787);
let latestJotformSubmission = null;

function json(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(JSON.stringify(body, null, 2));
}

async function readRequestBody(request) {
  let data = '';
  for await (const chunk of request) data += chunk;
  return data;
}

function parseJotformBody(raw, contentType = '') {
  if (!raw) return {};

  if (contentType.includes('application/json')) {
    try { return JSON.parse(raw); } catch { return { raw }; }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    const object = Object.fromEntries(params.entries());
    for (const key of ['rawRequest', 'data', 'payload']) {
      if (object[key]) {
        try { object[key] = JSON.parse(object[key]); } catch { /* keep original */ }
      }
    }
    return object;
  }

  try { return JSON.parse(raw); } catch { return { raw }; }
}

function normalizeJotformSubmission(payload) {
  const submissionId =
    payload?.submissionID ??
    payload?.submissionId ??
    payload?.id ??
    payload?.data?.submissionID ??
    null;

  const fields = payload?.answers ?? payload?.data ?? payload;

  return {
    source: 'jotform',
    submissionId,
    receivedAt: new Date().toISOString(),
    fields
  };
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      const html = await readFile(join(root, 'index.html'), 'utf8');
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    if (req.method === 'GET' && req.url === '/api/jotform/latest') {
      return json(res, 200, latestJotformSubmission || {
        source: 'jotform',
        status: 'empty',
        message: 'No Jotform webhook submission has been received yet.'
      });
    }

    if (req.method === 'POST' && req.url === '/api/jotform/webhook') {
      const raw = await readRequestBody(req);
      const payload = parseJotformBody(raw, req.headers['content-type'] || '');
      latestJotformSubmission = normalizeJotformSubmission(payload);

      return json(res, 202, {
        accepted: true,
        protocol: 'web4',
        source: 'jotform',
        submission: latestJotformSubmission,
        verification: {
          received: true,
          timestamp: latestJotformSubmission.receivedAt
        }
      });
    }

    if (req.method === 'POST' && req.url === '/api/web4/agent') {
      const raw = await readRequestBody(req);
      let input;
      try { input = JSON.parse(raw || '{}'); } catch { return json(res, 400, { error: 'Invalid JSON' }); }

      if (input.protocol !== 'web4') return json(res, 400, { error: 'Unsupported protocol' });
      if (!input.identity) return json(res, 401, { error: 'Identity required' });

      return json(res, 200, {
        protocol: 'web4',
        version: input.version || '1.0',
        request: {
          identity: input.identity,
          task: input.task || null,
          input: input.input || null
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

    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Web4 AI Agent example: http://localhost:${port}`);
});
