import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request(path, init) {
	const response = await fetch(`${baseUrl}/api${path}`, {
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(init?.headers ?? {}),
		},
		...init,
	});

	const contentType = response.headers.get('content-type') ?? '';
	const body = contentType.includes('application/json')
		? await response.json()
		: null;

	return {
		response,
		body,
	};
}

function assertSuccessEnvelope(result, message) {
	assert.equal(
		result.response.ok,
		true,
		`${message} | HTTP ${result.response.status}: ${JSON.stringify(result.body)}`,
	);
	assert.equal(
		result.body?.success,
		true,
		`${message} | Envelope inesperado: ${JSON.stringify(result.body)}`,
	);
}

const [customersResult, storesResult, usersResult] = await Promise.all([
	request('/customers'),
	request('/stores'),
	request('/users?page=1&limit=1'),
]);

assertSuccessEnvelope(customersResult, 'Falha ao listar customers');
assertSuccessEnvelope(storesResult, 'Falha ao listar stores');
assertSuccessEnvelope(usersResult, 'Falha ao listar users');

const customer = customersResult.body.data?.[0];
const store = storesResult.body.data?.[0];
const owner = usersResult.body.data?.items?.[0] ?? null;

if (!customer || !store) {
	console.error(
		'O smoke test precisa de pelo menos 1 customer e 1 store já cadastrados para inserir um lead.',
	);
	console.error(
		'Dica: cadastre esses dados base primeiro, depois rode `npm run test:http` novamente.',
	);
	process.exit(1);
}

const createPayload = {
	customerId: customer.id,
	storeId: store.id,
	ownerUserId: owner?.id ?? null,
	source: 'whatsapp',
};

const createResult = await request('/leads', {
	method: 'POST',
	body: JSON.stringify(createPayload),
});

assertSuccessEnvelope(createResult, 'Falha ao criar lead');

const leadId = createResult.body.data?.id;
assert.equal(typeof leadId, 'string');
assert.equal(createResult.body.data?.customerId, customer.id);
assert.equal(createResult.body.data?.storeId, store.id);
assert.equal(createResult.body.data?.source, 'whatsapp');
assert.equal(typeof createResult.body.data?.customer?.name, 'string');
assert.equal(typeof createResult.body.data?.store?.name, 'string');

const findResult = await request(`/leads/${leadId}`);
assertSuccessEnvelope(findResult, 'Falha ao buscar lead recém-criado');
assert.equal(findResult.body.data?.id, leadId);

const deleteResult = await request(`/leads/${leadId}`, {
	method: 'DELETE',
});
assert.equal(
	deleteResult.response.status,
	204,
	`Falha ao remover lead criado no smoke test: HTTP ${deleteResult.response.status}`,
);

console.log('Smoke HTTP de lead executado com sucesso.');
console.log(
	JSON.stringify(
		{
			id: leadId,
			customer: findResult.body.data.customer.name,
			store: findResult.body.data.store.name,
			owner: findResult.body.data.owner?.name ?? null,
			runId: crypto.randomUUID(),
		},
		null,
		2,
	),
);
