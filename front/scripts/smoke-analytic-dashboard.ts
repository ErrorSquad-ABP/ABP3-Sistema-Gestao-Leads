import { parseAnalyticDashboardResponse } from '../src/features/dashboard-analytic/schemas/analytic-dashboard.schema';

const BASE_URL = process.env.ANALYTIC_BASE_URL ?? 'http://127.0.0.1:3001/api';
const SMOKE_ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL;
const SMOKE_ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD;
const SMOKE_NON_ADMIN_EMAIL = process.env.SMOKE_NON_ADMIN_EMAIL;
const SMOKE_NON_ADMIN_PASSWORD = process.env.SMOKE_NON_ADMIN_PASSWORD;

type LoginResult = {
	readonly accessToken: string;
	readonly user: {
		readonly id: string;
		readonly email: string;
		readonly role: string;
	};
};

type HttpResult = {
	readonly response: Response;
	readonly json: unknown;
};

function fail(message: string): never {
	console.error(`[FALHA] ${message}`);
	process.exit(1);
}

function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		fail(message);
	}
}

async function request(
	path: string,
	init: RequestInit = {},
): Promise<HttpResult> {
	const response = await fetch(`${BASE_URL.replace(/\/$/, '')}${path}`, {
		...init,
		headers: {
			Accept: 'application/json',
			...(init.body ? { 'Content-Type': 'application/json' } : {}),
			...init.headers,
		},
	});

	const text = await response.text();
	let json: unknown = null;
	if (text) {
		try {
			json = JSON.parse(text);
		} catch {
			json = text;
		}
	}

	return { response, json };
}

async function login(email: string, password: string): Promise<LoginResult> {
	const { response, json } = await request('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ email, password }),
	});

	assert(
		response.status === 200 || response.status === 201,
		`Login smoke esperado 200/201, obteve ${response.status}`,
	);
	assert(
		typeof json === 'object' && json !== null,
		'Login smoke deve retornar envelope JSON',
	);

	const payload = json as {
		success?: boolean;
		data?: {
			accessToken?: string;
			user?: LoginResult['user'];
		};
	};

	assert(payload.success === true, 'Login smoke envelope success');
	assert(
		typeof payload.data?.accessToken === 'string' &&
			payload.data.accessToken.length > 0,
		'Login smoke accessToken ausente',
	);
	assert(payload.data?.user, 'Login smoke user ausente');

	return {
		accessToken: payload.data.accessToken,
		user: payload.data.user,
	};
}

async function fetchDashboard(accessToken: string, query: string) {
	return request(`/dashboards/analytic?${query}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

async function main() {
	console.log(`Smoke front analytic dashboard -> ${BASE_URL}`);

	assert(
		SMOKE_ADMIN_EMAIL && SMOKE_ADMIN_PASSWORD,
		'Defina SMOKE_ADMIN_EMAIL e SMOKE_ADMIN_PASSWORD para validar o dashboard com dados reais.',
	);

	const adminSession = await login(SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD);
	console.log(`OK login admin (${adminSession.user.email})`);

	const monthResult = await fetchDashboard(
		adminSession.accessToken,
		'mode=month',
	);
	assert(
		monthResult.response.status === 200,
		`Dashboard month esperado 200, obteve ${monthResult.response.status}`,
	);
	assert(
		typeof monthResult.json === 'object' && monthResult.json !== null,
		'Dashboard month deve retornar envelope JSON',
	);
	const monthEnvelope = monthResult.json as {
		success?: boolean;
		data?: unknown;
	};
	assert(monthEnvelope.success === true, 'Dashboard month envelope success');
	const parsedDashboard = parseAnalyticDashboardResponse(monthEnvelope.data);
	assert(
		parsedDashboard.summary.convertedLeads +
			parsedDashboard.summary.notConvertedLeads ===
			parsedDashboard.summary.totalLeads,
		'Dashboard month inconsistente entre total, convertidos e nao convertidos',
	);
	console.log(
		`OK contrato front-back mode=month (${parsedDashboard.filter.scope}, ${parsedDashboard.summary.totalLeads} leads)`,
	);

	const customResult = await fetchDashboard(
		adminSession.accessToken,
		'mode=custom&startDate=2026-04-01&endDate=2026-04-25',
	);
	assert(
		customResult.response.status === 200,
		`Dashboard custom esperado 200, obteve ${customResult.response.status}`,
	);
	const customEnvelope = customResult.json as {
		success?: boolean;
		data?: unknown;
	};
	assert(customEnvelope.success === true, 'Dashboard custom envelope success');
	const parsedCustom = parseAnalyticDashboardResponse(customEnvelope.data);
	assert(parsedCustom.filter.mode === 'custom', 'Dashboard custom preserva mode');
	assert(
		parsedCustom.filter.startDate === '2026-04-01' &&
			parsedCustom.filter.endDate === '2026-04-25',
		'Dashboard custom deve ecoar as datas aplicadas',
	);
	console.log('OK contrato front-back mode=custom');

	const invalidBoundsResult = await fetchDashboard(
		adminSession.accessToken,
		'mode=custom&startDate=2026-04-25&endDate=2026-04-01',
	);
	assert(
		invalidBoundsResult.response.status === 400,
		`Dashboard custom invalido esperado 400, obteve ${invalidBoundsResult.response.status}`,
	);
	const invalidEnvelope = invalidBoundsResult.json as {
		success?: boolean;
		errors?: Array<{ code?: string }>;
	};
	assert(
		invalidEnvelope.success === false,
		'Dashboard custom invalido deve retornar envelope de erro',
	);
	assert(
		invalidEnvelope.errors?.[0]?.code === 'dashboard.time_range.invalid_bounds',
		`Codigo de erro inesperado para bounds invalidos: ${invalidEnvelope.errors?.[0]?.code}`,
	);
	console.log('OK tratamento de erro temporal invalido');

	if (SMOKE_NON_ADMIN_EMAIL && SMOKE_NON_ADMIN_PASSWORD) {
		const nonAdminSession = await login(
			SMOKE_NON_ADMIN_EMAIL,
			SMOKE_NON_ADMIN_PASSWORD,
		);
		console.log(`OK login nao-admin (${nonAdminSession.user.email})`);

		const scopedResult = await fetchDashboard(
			nonAdminSession.accessToken,
			'mode=month',
		);
		assert(
			scopedResult.response.status === 200,
			`Dashboard month nao-admin esperado 200, obteve ${scopedResult.response.status}`,
		);
		const scopedEnvelope = scopedResult.json as {
			success?: boolean;
			data?: unknown;
		};
		const scopedDashboard = parseAnalyticDashboardResponse(scopedEnvelope.data);
		assert(
			scopedDashboard.filter.scope !== 'full',
			'Dashboard nao-admin nao deve receber escopo full',
		);
		console.log(`OK escopo hierarquico (${scopedDashboard.filter.scope})`);

		const limitedResult = await fetchDashboard(
			nonAdminSession.accessToken,
			'mode=custom&startDate=2024-01-01&endDate=2025-12-31',
		);
		assert(
			limitedResult.response.status === 400,
			`Dashboard custom amplo para nao-admin esperado 400, obteve ${limitedResult.response.status}`,
		);
		const limitedEnvelope = limitedResult.json as {
			success?: boolean;
			errors?: Array<{ code?: string }>;
		};
		assert(
			limitedEnvelope.errors?.[0]?.code ===
				'dashboard.time_range.exceeds_non_admin_limit',
			`Codigo inesperado para limite temporal nao-admin: ${limitedEnvelope.errors?.[0]?.code}`,
		);
		console.log('OK limite temporal nao-admin');
	} else {
		console.log(
			'Nota: defina SMOKE_NON_ADMIN_EMAIL e SMOKE_NON_ADMIN_PASSWORD para validar escopo hierarquico real.',
		);
	}

	console.log('Smoke analitico concluido com sucesso.');
}

main().catch((error) => {
	if (error instanceof Error) {
		console.error(error.message);
	} else {
		console.error(error);
	}
	process.exit(1);
});
