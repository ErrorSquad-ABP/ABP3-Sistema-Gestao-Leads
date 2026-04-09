import { readFile } from 'node:fs/promises';

const GITHUB_API_VERSION = '2022-11-28';
const MAX_SUMMARY_ITEMS = 3;
const MAX_SUMMARY_CHARS = 220;

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

function normalizeWhitespace(value) {
	return value.replace(/\s+/g, ' ').trim();
}

function summarizeComment(value) {
	const normalized = normalizeWhitespace(value);
	if (!normalized) {
		return '';
	}
	const sentence =
		normalized.match(/^(.{1,220}?[.!?])(?:\s|$)/u)?.[1] ?? normalized;
	if (sentence.length <= MAX_SUMMARY_CHARS) {
		return sentence;
	}
	return `${sentence.slice(0, MAX_SUMMARY_CHARS - 1).trimEnd()}…`;
}

function uniqueSummaries(items) {
	const seen = new Set();
	const out = [];
	for (const item of items) {
		const summary = summarizeComment(item.body ?? '');
		if (!summary) {
			continue;
		}
		const key = summary.toLowerCase();
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		out.push({
			path: item.path ?? null,
			summary,
			url: item.html_url ?? null,
		});
		if (out.length >= MAX_SUMMARY_ITEMS) {
			break;
		}
	}
	return out;
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

async function loadEvent() {
	const eventPath = requiredEnv('GITHUB_EVENT_PATH');
	const raw = await readFile(eventPath, 'utf8');
	return JSON.parse(raw);
}

async function loadReviewComments(event, githubToken) {
	const reviewId = event.review?.id;
	const repository = event.repository?.full_name;
	const prNumber = event.pull_request?.number;

	if (!reviewId || !repository || !prNumber || !githubToken) {
		return [];
	}

	const url = `https://api.github.com/repos/${repository}/pulls/${prNumber}/reviews/${reviewId}/comments?per_page=100`;
	const comments = await githubGetJson(url, githubToken);
	return Array.isArray(comments) ? comments : [];
}

function buildMessageText({
	repositoryFullName,
	prNumber,
	prTitle,
	authorLogin,
	reviewerLogin,
	reviewState,
	reviewBody,
	summaries,
	prUrl,
	baseRefName,
	headRefName,
}) {
	const summaryLines =
		summaries.length > 0
			? [
					'*Pontos principais*',
					...summaries.map((item, index) => `- ${index + 1}. ${item.summary}`),
				]
			: [];

	if (reviewState === 'approved') {
		const core = reviewBody
			? normalizeWhitespace(reviewBody)
			: 'Os pontos pendentes foram bem endereçados e, da minha revisão, o PR ficou em condição de aprovação.';
		return [
			'*PR APPROVED*',
			`- Repositório: ${repositoryFullName}`,
			`- PR: #${prNumber} - ${prTitle}`,
			`- Autor: ${authorLogin}`,
			`- Revisor: ${reviewerLogin}`,
			`- Fluxo: ${headRefName} -> ${baseRefName}`,
			`- Status: aprovado na revisão atual`,
			`- Observação do revisor: ${core}`,
			`- Link: ${prUrl}`,
		].join('\n');
	}

	const core = reviewBody
		? normalizeWhitespace(reviewBody)
		: 'Encontrei pontos que ainda precisam ajuste antes de aprovação.';
	return [
		'*PR COM CORREÇÕES SOLICITADAS*',
		`- Repositório: ${repositoryFullName}`,
		`- PR: #${prNumber} - ${prTitle}`,
		`- Autor: ${authorLogin}`,
		`- Revisor: ${reviewerLogin}`,
		`- Fluxo: ${headRefName} -> ${baseRefName}`,
		`- Status: changes requested na revisão atual`,
		`- Observação do revisor: ${core}`,
		...summaryLines,
		`- Link: ${prUrl}`,
	].join('\n');
}

async function main() {
	const webhookUrl = optionalEnv('PR_REVIEW_NOTIFY_WEBHOOK_URL');
	if (!webhookUrl) {
		console.log(
			'PR_REVIEW_NOTIFY_WEBHOOK_URL not configured; skipping PR review notification.',
		);
		return;
	}

	const githubToken = optionalEnv('GITHUB_TOKEN');
	const webhookToken = optionalEnv('PR_REVIEW_NOTIFY_WEBHOOK_TOKEN');
	const event = await loadEvent();

	if (event.action !== 'submitted') {
		console.log(`Ignoring pull_request_review action "${event.action}".`);
		return;
	}

	const reviewState = event.review?.state;
	if (reviewState !== 'approved' && reviewState !== 'changes_requested') {
		console.log(`Ignoring review state "${reviewState ?? 'unknown'}".`);
		return;
	}

	const reviewComments = await loadReviewComments(event, githubToken);
	const summaries = uniqueSummaries(reviewComments);
	const reviewBody = normalizeWhitespace(event.review?.body ?? '');
	const messageText = buildMessageText({
		repositoryFullName: event.repository.full_name,
		prNumber: event.pull_request.number,
		prTitle: event.pull_request.title,
		authorLogin: event.pull_request.user?.login ?? 'unknown',
		reviewerLogin: event.review.user?.login ?? 'unknown',
		reviewState,
		reviewBody,
		summaries,
		prUrl: event.pull_request.html_url,
		baseRefName: event.pull_request.base?.ref ?? 'unknown',
		headRefName: event.pull_request.head?.ref ?? 'unknown',
	});

	const payload = {
		event: 'pull_request_review.submitted',
		repository: {
			fullName: event.repository.full_name,
			htmlUrl: event.repository.html_url,
		},
		pullRequest: {
			number: event.pull_request.number,
			title: event.pull_request.title,
			htmlUrl: event.pull_request.html_url,
			authorLogin: event.pull_request.user?.login ?? null,
		},
		review: {
			id: event.review.id,
			state: reviewState,
			body: reviewBody || null,
			htmlUrl: event.review.html_url,
			reviewerLogin: event.review.user?.login ?? null,
			submittedAt: event.review.submitted_at ?? null,
			inlineComments: reviewComments.map((comment) => ({
				id: comment.id ?? null,
				path: comment.path ?? null,
				body: normalizeWhitespace(comment.body ?? ''),
				htmlUrl: comment.html_url ?? null,
			})),
			inlineSummary: summaries,
		},
		notification: {
			channel: 'slack',
			messageText,
		},
	};

	const headers = {
		'Content-Type': 'application/json',
		'User-Agent': 'abp3-pr-review-notifier',
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
			`PR review relay webhook returned ${response.status}: ${body}`,
		);
	}

	console.log(
		`PR review notification queued for PR #${event.pull_request.number}.`,
	);
}

await main();
