#!/usr/bin/env node
/**
 * Smoke HTTP contra a API Nest (servidor já em execução).
 * Uso: BASE_URL=http://127.0.0.1:3001/api node scripts/smoke-http.mjs
 *
 * Espera 404 em recursos inexistentes (dados vazios). Falha em 5xx ou respostas inesperadas.
 */

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3001/api';
const SAMPLE_UUID = '00000000-0000-4000-8000-000000000001';

function fail(msg) {
	console.error(`[FALHA] ${msg}`);
	process.exit(1);
}

async function req(method, path, options = {}) {
	const url = `${BASE.replace(/\/$/, '')}${path}`;
	const res = await fetch(url, {
		method,
		headers: {
			Accept: 'application/json',
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
			...options.headers,
		},
		body: options.body ? JSON.stringify(options.body) : undefined,
	});
	let json;
	const text = await res.text();
	try {
		json = text ? JSON.parse(text) : null;
	} catch {
		json = { _raw: text };
	}
	return { res, json };
}

function assert(cond, msg) {
	if (!cond) {
		fail(msg);
	}
}

async function main() {
	console.log(`Smoke: ${BASE}\n`);

	// Health (sem banco no handler)
	{
		const { res, json } = await req('GET', '/health');
		assert(
			res.status === 200,
			`GET /health esperado 200, obteve ${res.status}`,
		);
		assert(json?.success === true, 'GET /health envelope success');
		assert(json?.data?.status === 'ok', 'GET /health data.status === ok');
		console.log('OK GET /health');
	}

	// Listar usuários (paginado)
	{
		const { res, json } = await req('GET', '/users');
		assert(res.status === 200, `GET /users esperado 200, obteve ${res.status}`);
		assert(json?.success === true, 'GET /users envelope');
		const d = json?.data;
		assert(d && typeof d === 'object', 'GET /users data é objeto');
		assert(Array.isArray(d.items), 'GET /users data.items é array');
		assert(typeof d.page === 'number', 'GET /users data.page');
		assert(typeof d.limit === 'number', 'GET /users data.limit');
		assert(typeof d.total === 'number', 'GET /users data.total');
		assert(typeof d.totalPages === 'number', 'GET /users data.totalPages');
		const expectedPages = d.total === 0 ? 0 : Math.ceil(d.total / d.limit);
		assert(
			d.totalPages === expectedPages,
			`GET /users totalPages esperado ${expectedPages}, obteve ${d.totalPages}`,
		);
	}
	{
		const { res, json } = await req('GET', '/users?page=1&limit=5');
		assert(res.status === 200, `GET /users?page&limit esperado 200`);
		assert(json?.data?.limit === 5, 'GET /users respeita limit');
		assert(typeof json?.data?.totalPages === 'number', 'totalPages presente');
		console.log('OK GET /users (paginação)');
	}

	// Usuário inexistente → 404
	{
		const { res, json } = await req('GET', `/users/${SAMPLE_UUID}`);
		assert(
			res.status === 404,
			`GET /users/:id inexistente esperado 404, obteve ${res.status}`,
		);
		assert(json?.success === false, 'GET usuário 404 envelope success false');
		console.log('OK GET /users/:id (404 esperado)');
	}

	// Lead inexistente → 404
	{
		const { res, json } = await req('GET', `/leads/${SAMPLE_UUID}`);
		assert(
			res.status === 404,
			`GET /leads/:id inexistente esperado 404, obteve ${res.status}`,
		);
		assert(json?.success === false, 'GET lead 404 envelope');
		console.log('OK GET /leads/:id (404 esperado)');
	}

	// UUID inválido → 400
	{
		const { res } = await req('GET', '/users/nao-uuid');
		assert(
			res.status === 400,
			`GET /users com id inválido esperado 400, obteve ${res.status}`,
		);
		console.log('OK GET /users/invalid-uuid (400 esperado)');
	}

	// PATCH usuário sem campos → 400 domínio
	{
		const { res, json } = await req('PATCH', `/users/${SAMPLE_UUID}`, {
			body: {},
		});
		assert(
			res.status === 400,
			`PATCH /users/:id {} esperado 400, obteve ${res.status}`,
		);
		const code = json?.errors?.[0]?.code;
		assert(
			code === 'user.update.no_fields',
			`PATCH vazio esperado code user.update.no_fields, obteve ${code}`,
		);
		console.log('OK PATCH /users/:id {} (400 user.update.no_fields)');
	}

	// Listas por owner/team (vazias, mas rota deve responder)
	{
		const { res, json } = await req('GET', `/leads/owner/${SAMPLE_UUID}`);
		assert(
			res.status === 200,
			`GET leads/owner esperado 200, obteve ${res.status}`,
		);
		assert(Array.isArray(json?.data), 'leads/owner data array');
		console.log('OK GET /leads/owner/:ownerUserId');
	}
	{
		const { res, json } = await req('GET', `/leads/team/${SAMPLE_UUID}`);
		assert(
			res.status === 200,
			`GET leads/team esperado 200, obteve ${res.status}`,
		);
		assert(Array.isArray(json?.data), 'leads/team data array');
		console.log('OK GET /leads/team/:teamId');
	}

	console.log('\nSmoke concluído: todas as verificações passaram.');
}

main().catch((e) => {
	const cause = e?.cause;
	if (cause?.code === 'ECONNREFUSED') {
		console.error(
			'Não foi possível conectar à API. Suba o back (com Postgres e DATABASE_URL) e tente de novo.',
		);
		console.error(`Alvo: ${BASE}`);
	} else {
		console.error(e);
	}
	process.exit(1);
});
