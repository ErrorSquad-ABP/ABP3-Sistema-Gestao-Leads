#!/usr/bin/env node
/**
 * Smoke HTTP contra a API Nest (servidor já em execução).
 * Uso: BASE_URL=http://127.0.0.1:3001/api node scripts/smoke-http.mjs
 *
 * Rotas protegidas exigem JWT. Opcional: SMOKE_ADMIN_EMAIL + SMOKE_ADMIN_PASSWORD
 * (usuário com role ADMINISTRATOR no banco) para validar listagem de usuários e leads autenticados.
 *
 * Opcional: SMOKE_INVALID_LOGIN_PASSWORD — palavra-passe só para o teste de login inválido (401).
 * Se omitida, usa valor derivado do PID (evita literal fixo no código).
 */

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3001/api';
const SAMPLE_UUID = '00000000-0000-4000-8000-000000000001';
const SMOKE_ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL;
const SMOKE_ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD;
const SMOKE_INVALID_LOGIN_PASSWORD =
	process.env.SMOKE_INVALID_LOGIN_PASSWORD ??
	`__smoke_invalid_${process.pid}__`;

function fail(msg) {
	console.error(`[FALHA] ${msg}`);
	process.exit(1);
}

function assert(cond, msg) {
	if (!cond) {
		fail(msg);
	}
}

/** Monta header `Cookie` a partir de `Set-Cookie` (Node fetch). */
function cookieHeaderFromResponse(res) {
	const fn = res.headers.getSetCookie;
	if (typeof fn === 'function') {
		const list = fn.call(res.headers);
		if (Array.isArray(list) && list.length > 0) {
			return list.map((line) => line.split(';')[0]).join('; ');
		}
	}
	const single = res.headers.get('set-cookie');
	if (typeof single === 'string' && single.length > 0) {
		return single
			.split(/,(?=[^;]+?=)/)
			.map((p) => p.split(';')[0].trim())
			.join('; ');
	}
	return '';
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

	// Readiness (PostgreSQL — falha se API sem DATABASE_URL/banco)
	{
		const { res, json } = await req('GET', '/health/ready');
		assert(
			res.status === 200,
			`GET /health/ready esperado 200, obteve ${res.status} (Postgres acessível?)`,
		);
		assert(json?.success === true, 'GET /health/ready envelope success');
		assert(
			json?.data?.status === 'ready',
			'GET /health/ready data.status === ready',
		);
		console.log('OK GET /health/ready');
	}

	// Login inválido → 401
	{
		const { res, json } = await req('POST', '/auth/login', {
			body: {
				email: 'naoexiste@example.com',
				password: SMOKE_INVALID_LOGIN_PASSWORD,
			},
		});
		assert(
			res.status === 401,
			`POST /auth/login credenciais inválidas esperado 401, obteve ${res.status}`,
		);
		assert(json?.success === false, 'POST /auth/login envelope erro');
		const code = json?.errors?.[0]?.code;
		assert(
			code === 'auth.invalid_credentials',
			`POST /auth/login esperado auth.invalid_credentials, obteve ${code}`,
		);
		console.log('OK POST /auth/login (401 credenciais inválidas)');
	}

	// Sessão opcional (pública): nunca 401 — adequado a bootstrap no cliente
	{
		const { res, json } = await req('GET', '/auth/session');
		assert(
			res.status === 200,
			`GET /auth/session sem JWT esperado 200, obteve ${res.status}`,
		);
		assert(json?.success === true, 'GET /auth/session envelope success');
		assert(json?.data === null, 'GET /auth/session data null sem sessão');
		console.log('OK GET /auth/session (200 sem sessão)');
	}
	{
		const { res, json } = await req('GET', '/auth/session', {
			headers: { Authorization: 'Bearer invalid.token.value' },
		});
		assert(
			res.status === 200,
			`GET /auth/session Bearer inválido esperado 200, obteve ${res.status}`,
		);
		assert(json?.data === null, 'GET /auth/session data null JWT inválido');
		console.log('OK GET /auth/session (200 JWT inválido)');
	}

	// Sem token → 401 nas rotas protegidas
	{
		const { res } = await req('GET', '/users');
		assert(
			res.status === 401,
			`GET /users sem JWT esperado 401, obteve ${res.status}`,
		);
		console.log('OK GET /users (401 sem autenticação)');
	}
	{
		const { res } = await req('GET', `/leads/${SAMPLE_UUID}`);
		assert(
			res.status === 401,
			`GET /leads/:id sem JWT esperado 401, obteve ${res.status}`,
		);
		console.log('OK GET /leads/:id (401 sem autenticação)');
	}
	{
		const { res } = await req('GET', '/dashboards/analytic?mode=month');
		assert(
			res.status === 401,
			`GET /dashboards/analytic sem JWT esperado 401, obteve ${res.status}`,
		);
		console.log('OK GET /dashboards/analytic (401 sem autenticação)');
		const { res } = await req('GET', `/leads/${SAMPLE_UUID}/detail`);
		assert(
			res.status === 401,
			`GET /leads/:id/detail sem JWT esperado 401, obteve ${res.status}`,
		);
		console.log('OK GET /leads/:id/detail (401 sem autenticação)');
	}

	let adminAuthHeader = null;
	let adminCookie = null;
	let sampleLeadIdFromList = null;

	if (SMOKE_ADMIN_EMAIL && SMOKE_ADMIN_PASSWORD) {
		const loginRes = await fetch(`${BASE.replace(/\/$/, '')}/auth/login`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: SMOKE_ADMIN_EMAIL,
				password: SMOKE_ADMIN_PASSWORD,
			}),
		});
		const loginText = await loginRes.text();
		let loginJson;
		try {
			loginJson = loginText ? JSON.parse(loginText) : null;
		} catch {
			loginJson = null;
		}
		assert(
			loginRes.status === 200 || loginRes.status === 201,
			`Login smoke admin esperado 200 ou 201, obteve ${loginRes.status} — verifique SMOKE_ADMIN_EMAIL/SMOKE_ADMIN_PASSWORD e role ADMINISTRATOR`,
		);
		assert(loginJson?.success === true, 'Login smoke envelope');
		const access = loginJson?.data?.accessToken;
		assert(
			typeof access === 'string' && access.length > 0,
			'Login smoke accessToken',
		);
		assert(
			loginJson?.data?.refreshToken === undefined,
			'Login smoke: refresh opaco só em cookie HttpOnly, não no JSON',
		);
		let cookieAfterLogin = cookieHeaderFromResponse(loginRes);
		const refreshRes = await fetch(`${BASE.replace(/\/$/, '')}/auth/refresh`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				...(cookieAfterLogin ? { Cookie: cookieAfterLogin } : {}),
			},
			body: JSON.stringify({}),
		});
		const refreshText = await refreshRes.text();
		let refreshJson;
		try {
			refreshJson = refreshText ? JSON.parse(refreshText) : null;
		} catch {
			refreshJson = null;
		}
		assert(
			refreshRes.status === 200 || refreshRes.status === 201,
			`POST /auth/refresh esperado 200/201, obteve ${refreshRes.status}`,
		);
		assert(refreshJson?.success === true, 'Refresh smoke envelope');
		const accessAfter = refreshJson?.data?.accessToken;
		assert(
			typeof accessAfter === 'string' && accessAfter.length > 0,
			'Refresh smoke accessToken',
		);
		const cookieAfterRefresh = cookieHeaderFromResponse(refreshRes);
		if (cookieAfterRefresh) {
			cookieAfterLogin = cookieAfterRefresh;
		}
		adminAuthHeader = { Authorization: `Bearer ${accessAfter}` };
		adminCookie = cookieAfterLogin;
		console.log('OK login smoke + POST /auth/refresh (credenciais SMOKE_*)');
	}

	if (adminAuthHeader && adminCookie) {
		const { res, json } = await req('GET', '/auth/session', {
			headers: {
				...adminAuthHeader,
				Cookie: adminCookie,
			},
		});
		assert(
			res.status === 200,
			`GET /auth/session autenticado esperado 200, obteve ${res.status}`,
		);
		assert(json?.success === true, 'GET /auth/session envelope (autenticado)');
		assert(
			json?.data !== null && typeof json.data === 'object',
			'GET /auth/session data deve ser utilizador',
		);
		assert(
			typeof json.data.id === 'string' && typeof json.data.email === 'string',
			'GET /auth/session data.id / data.email',
		);
		console.log('OK GET /auth/session (200 com sessão admin)');
	}

	const authHeaders =
		adminAuthHeader !== null
			? adminAuthHeader
			: { Authorization: 'Bearer invalid' };

	// Listar usuários: com admin → 200; sem admin → 403 se token inválido
	if (adminAuthHeader) {
		const { res, json } = await req('GET', '/users', {
			headers: {
				...adminAuthHeader,
				...(adminCookie ? { Cookie: adminCookie } : {}),
			},
		});
		assert(
			res.status === 200,
			`GET /users autenticado esperado 200, obteve ${res.status}`,
		);
		assert(json?.success === true, 'GET /users envelope');
		const d = json?.data;
		assert(d && typeof d === 'object', 'GET /users data é objeto');
		assert(Array.isArray(d.items), 'GET /users data.items é array');
		console.log('OK GET /users (autenticado admin)');
	}

	{
		const { res, json } = await req('GET', '/users?page=1&limit=5', {
			headers: authHeaders,
		});
		if (adminAuthHeader) {
			assert(res.status === 200, `GET /users?page&limit esperado 200`);
			assert(json?.data?.limit === 5, 'GET /users respeita limit');
			console.log('OK GET /users (paginação autenticada)');
		} else {
			assert(res.status === 401, 'GET /users paginação sem credenciais → 401');
		}
	}

	// Usuário inexistente → 404 (com token válido admin) ou 401
	{
		const { res, json } = await req('GET', `/users/${SAMPLE_UUID}`, {
			headers: authHeaders,
		});
		if (adminAuthHeader) {
			assert(
				res.status === 404,
				`GET /users/:id inexistente esperado 404, obteve ${res.status}`,
			);
			assert(json?.success === false, 'GET usuário 404 envelope');
			console.log('OK GET /users/:id (404 esperado)');
		} else {
			assert(res.status === 401, 'GET /users/:id sem auth → 401');
		}
	}

	// Lead inexistente
	{
		const { res, json } = await req('GET', `/leads/${SAMPLE_UUID}`, {
			headers: authHeaders,
		});
		if (adminAuthHeader) {
			assert(
				res.status === 404,
				`GET /leads/:id inexistente esperado 404, obteve ${res.status}`,
			);
			assert(json?.success === false, 'GET lead 404 envelope');
			console.log('OK GET /leads/:id (404 esperado)');
		} else {
			assert(res.status === 401, 'GET /leads/:id sem auth → 401');
		}
	}
	{
		const { res, json } = await req('GET', `/leads/${SAMPLE_UUID}/detail`, {
			headers: authHeaders,
		});
		if (adminAuthHeader) {
			assert(
				res.status === 404,
				`GET /leads/:id/detail inexistente esperado 404, obteve ${res.status}`,
			);
			assert(json?.success === false, 'GET lead detail 404 envelope');
			console.log('OK GET /leads/:id/detail (404 esperado)');
		} else {
			assert(res.status === 401, 'GET /leads/:id/detail sem auth → 401');
		}
	}

	// UUID inválido → 400 (rota protegida: com Bearer inválido ainda 401 primeiro)
	{
		const { res } = await req('GET', '/users/nao-uuid', {
			headers: authHeaders,
		});
		if (adminAuthHeader) {
			assert(
				res.status === 400,
				`GET /users id inválido esperado 400, obteve ${res.status}`,
			);
			console.log('OK GET /users/invalid-uuid (400 esperado)');
		} else {
			assert(res.status === 401, 'GET /users invalid uuid sem auth → 401');
		}
	}

	// PATCH usuário sem campos → 400 domínio (só com admin)
	if (adminAuthHeader) {
		const { res, json } = await req('PATCH', `/users/${SAMPLE_UUID}`, {
			body: {},
			headers: adminAuthHeader,
		});
		assert(
			res.status === 400,
			`PATCH /users/:id {} esperado 400, obteve ${res.status}`,
		);
		const code = json?.errors?.[0]?.code;
		assert(
			code === 'user.update.no_fields',
			`PATCH vazio esperado user.update.no_fields, obteve ${code}`,
		);
		console.log('OK PATCH /users/:id {} (400 user.update.no_fields)');
	}

	// Listas por owner/team
	{
		const { res, json } = await req('GET', `/leads/owner/${SAMPLE_UUID}`, {
			headers: authHeaders,
		});
		if (adminAuthHeader) {
			assert(res.status === 200, `GET leads/owner esperado 200`);
			assert(Array.isArray(json?.data?.items), 'leads/owner data.items array');
			assert(typeof json?.data?.total === 'number', 'leads/owner data.total');
			console.log('OK GET /leads/owner/:ownerUserId');
		} else {
			assert(res.status === 401, 'GET leads/owner sem auth → 401');
		}
	}
	{
		const { res, json } = await req('GET', `/leads/team/${SAMPLE_UUID}`, {
			headers: authHeaders,
		});
		if (adminAuthHeader) {
			assert(res.status === 200, `GET leads/team esperado 200`);
			assert(Array.isArray(json?.data?.items), 'leads/team data.items array');
			console.log('OK GET /leads/team/:teamId');
		} else {
			assert(res.status === 401, 'GET leads/team sem auth → 401');
		}
	}
	{
		const { res, json } = await req('GET', '/leads/all', {
			headers: adminAuthHeader,
		});
		if (adminAuthHeader) {
			assert(res.status === 200, `GET leads/all esperado 200`);
			assert(Array.isArray(json?.data?.items), 'leads/all data.items array');
			sampleLeadIdFromList =
				typeof json.data.items[0]?.id === 'string'
					? json.data.items[0].id
					: null;
			console.log('OK GET /leads/all');
		}
	}

	if (adminAuthHeader) {
		const { res, json } = await req('GET', '/dashboards/analytic?mode=month', {
			headers: {
				...adminAuthHeader,
				...(adminCookie ? { Cookie: adminCookie } : {}),
			},
		});
		assert(
			res.status === 200,
			`GET /dashboards/analytic?mode=month esperado 200, obteve ${res.status}`,
		);
		assert(json?.success === true, 'Dashboard analítico envelope success');
		assert(
			json?.data?.filter?.mode === 'month',
			'Dashboard analítico preserva mode=month',
		);
		assert(
			typeof json?.data?.summary?.totalLeads === 'number',
			'Dashboard analítico retorna summary.totalLeads',
		);
		assert(
			json?.data?.summary?.convertedLeads +
				json?.data?.summary?.notConvertedLeads ===
				json?.data?.summary?.totalLeads,
			'Dashboard analítico mantém consistência entre total, convertidos e não convertidos',
		);
		assert(
			Array.isArray(json?.data?.byAttendant),
			'Dashboard analítico retorna byAttendant',
		);
		assert(
			Array.isArray(json?.data?.importanceDistribution),
			'Dashboard analítico retorna importanceDistribution',
		);
		console.log('OK GET /dashboards/analytic?mode=month (contrato básico)');
	}

	if (adminAuthHeader) {
		const { res, json } = await req(
			'GET',
			'/dashboards/analytic?mode=custom&startDate=2026-04-10&endDate=2026-04-01',
			{
				headers: {
					...adminAuthHeader,
					...(adminCookie ? { Cookie: adminCookie } : {}),
				},
			},
		);
		assert(
			res.status === 400,
			`GET /dashboards/analytic custom inválido esperado 400, obteve ${res.status}`,
		);
		assert(json?.success === false, 'Dashboard analítico erro envelope');
		assert(
			json?.errors?.[0]?.code === 'dashboard.time_range.invalid_bounds',
			`Dashboard analítico custom inválido esperado dashboard.time_range.invalid_bounds, obteve ${json?.errors?.[0]?.code}`,
		);
		console.log('OK GET /dashboards/analytic custom inválido (400 esperado)');
	}

	if (adminAuthHeader) {
		const { res, json } = await req(
			'GET',
			'/dashboards/analytic?mode=custom&startDate=2024-01-01&endDate=2025-12-31',
			{
				headers: {
					...adminAuthHeader,
					...(adminCookie ? { Cookie: adminCookie } : {}),
				},
			},
		);
		assert(
			res.status === 200,
			`GET /dashboards/analytic custom amplo para admin esperado 200, obteve ${res.status}`,
		);
		assert(json?.success === true, 'Dashboard analítico custom amplo envelope');
		assert(
			json?.data?.filter?.scope === 'full',
			'Dashboard analítico admin mantém escopo full',
		);
		console.log('OK GET /dashboards/analytic custom amplo (admin)');
	if (adminAuthHeader && sampleLeadIdFromList) {
		const { res, json } = await req(
			'GET',
			`/leads/${sampleLeadIdFromList}/detail`,
			{
				headers: adminAuthHeader,
			},
		);
		assert(
			res.status === 200,
			`GET /leads/:id/detail autenticado esperado 200, obteve ${res.status}`,
		);
		assert(json?.success === true, 'GET lead detail envelope');
		assert(
			json?.data?.lead?.id === sampleLeadIdFromList,
			'lead detail data.lead.id',
		);
		assert(Array.isArray(json?.data?.timeline), 'lead detail timeline array');
		assert(
			typeof json?.data?.permissions?.canManageDeals === 'boolean',
			'lead detail permissions.canManageDeals boolean',
		);
		console.log('OK GET /leads/:id/detail (200 autenticado)');
	}

	if (!adminAuthHeader) {
		console.log(
			'\nNota: defina SMOKE_ADMIN_EMAIL e SMOKE_ADMIN_PASSWORD (admin no DB) para exercitar CRUD/listagens autenticadas e o dashboard analítico.',
		);
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
