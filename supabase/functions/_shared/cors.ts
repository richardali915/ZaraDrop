export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  }
  return null;
}

export function json(data: any) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}

export function err(message: string, status = 400) {
  return json({ error: message, ok: false, status });
}
