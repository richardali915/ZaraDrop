export function handleCors(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
    }
    return null;
}
export function json(data) {
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
export function err(message, status = 400) {
    return json({ error: message, ok: false, status });
}
