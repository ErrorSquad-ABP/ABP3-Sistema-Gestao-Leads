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

async function loadReviews(repository, prNumber, githubToken) {
	const reviews = await githubGetJson(
		`https://api.github.com/repos/${repository}/pulls/${prNumber}/reviews?per_page=100`,
		githubToken,
	);
	return Array.isArray(reviews) ? reviews : [];
}

function hoursSince(value) {
	return Math.max(
		0,
		Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60)),
	);
}

function summarizeLatestReview(reviews) {
	const meaningful = reviews.filter((review) =>
		['APPROVED', 'CHANGES_REQUESTED'].includes(review.state),
	);

	if (meaningful.length === 0) {
		return null;
	}

	return meaningful.sort(
		(left, right) =>
			new Date(right.submitted_at).getTime() -
			new Date(left.submitted_at).getTime(),
	)[0];
}

function classifyPullRequest(pr, latestReview) {
	if (latestReview?.state === 'CHANGES_REQUESTED') {
		return 'changes_requested';
	}
	if (latestReview?.state === 'APPROVED') {
		return 'approved';
	}
	if ((pr.requested_reviewers?.length ?? 0) > 0) {
		return 'awaiting_review';
	}
	return 'open';
}

function formatStatusLabel(status) {
	switch (status) {
		case 'changes_requested':
			return 'CHANGES_REQUESTED';
		case 'approved':
			return 'APPROVED';
		case 'awaiting_review':
			return 'AGUARDANDO_REVIEW';
		default:
			return 'ABERTO';
	}
}

function buildStatusCounts(items) {
	const counts = {
		changes_requested: 0,
		approved: 0,
		awaiting_review: 0,
		open: 0,
	};

	for (const item of items) {
		counts[item.status] += 1;
	}

	return counts;
}

function buildSnapshotPayload({
	repository,
	defaultBranch,
	items,
}) {
	const counts = buildStatusCounts(items);
	const groupedByBase = items.reduce((acc, item) => {
		const key = item.baseRef ?? 'unknown';
		acc.set(key, [...(acc.get(key) ?? []), item]);
		return acc;
	}, new Map());

	const prLines =
		items.length > 0
			? items.map((item) => {
					const age = `${hoursSince(item.createdAt)}h`;
					const reviewBy = item.latestReviewer
						? ` | reviewer: ${item.latestReviewer}`
						: '';
					return `- \`#${item.number}\` ${formatStatusLabel(item.status)} | ${item.title} | ${item.authorLogin} | ${item.headRef} -> ${item.baseRef} | idade: ${age}${reviewBy} | ${item.htmlUrl}`;
				})
			: ['- Nenhum PR aberto no momento.'];

	const highlightLines = Array.from(groupedByBase.entries()).map(
		([baseRef, prItems]) => `- \`${baseRef}\`: ${prItems.length} PR(s) abertos`,
	);

	const docLines = [
		`- PR template: https://github.com/${repository}/blob/${defaultBranch}/.github/PULL_REQUEST_TEMPLATE.md`,
		`- Quality flow: https://github.com/${repository}/blob/${defaultBranch}/docs/quality/README.md`,
		`- PRs abertos: https://github.com/${repository}/pulls`,
	];

	const operationalLines = [
		'- Este snapshot consolida a fila atual de PRs abertos no repositório.',
		'- Alertas imediatos de APPROVED e CHANGES_REQUESTED continuam chegando por evento separado.',
		'- PR parado, aprovado sem merge ou com mudança pedida deve ser tratado como item ativo de coordenação.',
	];

	return {
		snapshot: {
			snapshotKey: 'pr_queue_status',
			channelTarget: 'pr_alerts',
			title: 'Fila de PRs - Snapshot Operacional',
			statusLine: `*Repositório:* ${repository}\n*Branch padrão:* ${defaultBranch}\n*Total abertos:* ${items.length}\n*Resumo:* ${counts.changes_requested} changes requested, ${counts.approved} approved, ${counts.awaiting_review} aguardando review, ${counts.open} abertos sem decisão`,
			trelloLines: [],
			highlightLines,
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
		'User-Agent': 'abp3-pr-queue-sync',
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
			`PR queue sync relay webhook returned ${response.status}: ${body}`,
		);
	}

	return response.json();
}

async function main() {
	const repository = requiredEnv('GITHUB_REPOSITORY');
	const githubToken = requiredEnv('GITHUB_TOKEN');
	const webhookUrl = requiredEnv('SLACK_SYNC_WEBHOOK_URL');
	const webhookToken = optionalEnv('SLACK_SYNC_WEBHOOK_TOKEN');

	const [repoInfo, prs] = await Promise.all([
		loadRepository(repository, githubToken),
		loadOpenPullRequests(repository, githubToken),
	]);

	const items = await Promise.all(
		prs
			.sort((left, right) => right.number - left.number)
			.map(async (pr) => {
				const reviews = await loadReviews(repository, pr.number, githubToken);
				const latestReview = summarizeLatestReview(reviews);
				return {
					number: pr.number,
					title: pr.title,
					htmlUrl: pr.html_url,
					authorLogin: pr.user?.login ?? 'unknown',
					baseRef: pr.base?.ref ?? 'unknown',
					headRef: pr.head?.ref ?? 'unknown',
					createdAt: pr.created_at,
					status: classifyPullRequest(pr, latestReview),
					latestReviewer: latestReview?.user?.login ?? null,
				};
			}),
	);

	const payload = buildSnapshotPayload({
		repository,
		defaultBranch: repoInfo.default_branch ?? 'main',
		items,
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
