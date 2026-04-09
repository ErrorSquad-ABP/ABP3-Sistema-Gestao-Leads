const GITHUB_API_VERSION = '2022-11-28';

function requiredEnv(name) {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

function optionalEnv(name) {
	const value = process.env[name]?.trim();
	return value ? value : undefined;
}

async function githubGetJson(url, githubToken) {
	const response = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${githubToken}`,
			'X-GitHub-Api-Version': GITHUB_API_VERSION,
		},
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`GitHub API ${response.status} for ${url}: ${body}`);
	}

	return response.json();
}

async function trelloGetJson(path, { key, token }) {
	const url = new URL(`https://api.trello.com/1${path}`);
	url.searchParams.set('key', key);
	url.searchParams.set('token', token);

	const response = await fetch(url);
	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Trello API ${response.status} for ${url}: ${body}`);
	}

	return response.json();
}

function countCardsByList(lists) {
	return lists.map((list) => ({
		name: list.name,
		count: Array.isArray(list.cards) ? list.cards.length : 0,
	}));
}

function summarizeCards(cards, limit = 3) {
	return cards.slice(0, limit).map((card) => {
		const link = card.shortUrl ? ` (${card.shortUrl})` : '';
		return `- \`${card.name}\`${link}`;
	});
}

async function loadRepository(repository, githubToken) {
	return githubGetJson(
		`https://api.github.com/repos/${repository}`,
		githubToken,
	);
}

async function loadOpenPullRequests(repository, githubToken) {
	const prs = await githubGetJson(
		`https://api.github.com/repos/${repository}/pulls?state=open&per_page=50`,
		githubToken,
	);
	return Array.isArray(prs) ? prs : [];
}

async function loadTrelloBoard(boardId, trelloCreds) {
	return trelloGetJson(
		`/boards/${boardId}?fields=name,url,shortUrl,shortLink`,
		trelloCreds,
	);
}

async function loadTrelloLists(boardId, trelloCreds) {
	const lists = await trelloGetJson(
		`/boards/${boardId}/lists?fields=name,closed&cards=open&card_fields=name,shortUrl,due,dueComplete`,
		trelloCreds,
	);
	return Array.isArray(lists) ? lists.filter((list) => !list.closed) : [];
}

function buildDocsLinks({ repository, defaultBranch }) {
	const base = `https://github.com/${repository}/blob/${defaultBranch}`;
	return [
		`- Sprint Goal: ${base}/docs/agile/sprint-1-goal.md`,
		`- Sprint backlog: ${base}/docs/agile/sprint-backlog.md`,
		`- Task breakdown: ${base}/docs/agile/sprint-1-task-breakdown.md`,
		`- Docs index: ${base}/docs/README.md`,
	];
}

function buildSnapshotPayload({
	repository,
	defaultBranch,
	trelloBoard,
	trelloLists,
	pullRequests,
}) {
	const counts = countCardsByList(trelloLists);
	const doingCards =
		trelloLists.find((list) => list.name.toUpperCase() === 'DOING')?.cards ?? [];
	const reviewCards =
		trelloLists.find((list) => list.name.toUpperCase() === 'REVIEW')?.cards ?? [];
	const blockedCards =
		trelloLists.find((list) => list.name.toUpperCase() === 'BLOCKED')?.cards ?? [];
	const conditionalCards =
		trelloLists.find((list) => list.name.toUpperCase() === 'CONDITIONAL')?.cards ??
		[];

	const trelloLines = [
		`- Board: ${trelloBoard.url}`,
		...counts.map((item) => `- \`${item.name}\`: ${item.count} cards`),
	];

	const highlightLines = [
		...summarizeCards(doingCards),
		...summarizeCards(reviewCards),
		...summarizeCards(blockedCards),
		...summarizeCards(conditionalCards),
	];

	const prLines =
		pullRequests.length > 0
			? pullRequests
					.sort((left, right) => right.number - left.number)
					.map(
						(pr) =>
							`- \`#${pr.number}\` ${pr.title} (${pr.head?.ref ?? 'unknown'} -> ${
								pr.base?.ref ?? 'unknown'
							}) - ${pr.html_url}`,
					)
			: ['- Nenhum PR aberto no momento.'];

	const docLines = buildDocsLinks({ repository, defaultBranch });

	const operationalLines = [
		'- Este snapshot reconcilia board do Trello, PRs abertos e documentação versionada.',
		'- Divergência entre board, docs e código deve ser tratada como bloqueio de coordenação.',
		'- Atualização automática planejada a cada 30 minutos pelo GitHub Actions.',
	];

	return {
		snapshot: {
			snapshotKey: 'backlog_sprint_status',
			title: `${trelloBoard.name} - Snapshot Operacional`,
			statusLine: `*Repositório:* ${repository}\n*Sprint:* Sprint 1\n*Branch de referência:* ${defaultBranch}\n*Atualização:* board, PRs e docs reconciliados`,
			trelloLines,
			highlightLines:
				highlightLines.length > 0
					? highlightLines
					: ['- Nenhum card em DOING, REVIEW, BLOCKED ou CONDITIONAL no momento.'],
			prLines,
			docLines,
			operationalLines,
			generatedAt: new Date().toLocaleString('pt-BR', {
				timeZone: 'America/Sao_Paulo',
			}),
		},
	};
}

async function postSnapshot(webhookUrl, webhookToken, payload) {
	const headers = {
		'Content-Type': 'application/json',
		'User-Agent': 'abp3-backlog-sync',
	};
	if (webhookToken) {
		headers.Authorization = `Bearer ${webhookToken}`;
	}

	const response = await fetch(webhookUrl, {
		method: 'POST',
		headers,
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(
			`Backlog sync relay webhook returned ${response.status}: ${body}`,
		);
	}

	return response.json();
}

async function main() {
	const repository = requiredEnv('GITHUB_REPOSITORY');
	const githubToken = requiredEnv('GITHUB_TOKEN');
	const webhookUrl = requiredEnv('SLACK_SYNC_WEBHOOK_URL');
	const webhookToken = optionalEnv('SLACK_SYNC_WEBHOOK_TOKEN');
	const trelloKey = requiredEnv('TRELLO_KEY');
	const trelloToken = requiredEnv('TRELLO_TOKEN');
	const trelloBoardId = requiredEnv('TRELLO_BOARD_ID');
	const trelloCreds = {
		key: trelloKey,
		token: trelloToken,
	};

	const [repoInfo, pullRequests, trelloBoard, trelloLists] = await Promise.all([
		loadRepository(repository, githubToken),
		loadOpenPullRequests(repository, githubToken),
		loadTrelloBoard(trelloBoardId, trelloCreds),
		loadTrelloLists(trelloBoardId, trelloCreds),
	]);

	const payload = buildSnapshotPayload({
		repository,
		defaultBranch: repoInfo.default_branch ?? 'main',
		trelloBoard,
		trelloLists,
		pullRequests,
	});

	const response = await postSnapshot(webhookUrl, webhookToken, payload);
	console.log(
		JSON.stringify(
			{
				ok: true,
				snapshotKey: payload.snapshot.snapshotKey,
				status: response.status ?? 'unknown',
				channel: response.to ?? 'unknown',
			},
			null,
			2,
		),
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
