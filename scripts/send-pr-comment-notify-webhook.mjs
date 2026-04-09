import { readFile } from 'node:fs/promises';

const GITHUB_API_VERSION = '2022-11-28';
const MAX_SUMMARY_CHARS = 220;
const MAX_BODY_CHARS = 500;

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

function truncate(value, max) {
	if (value.length <= max) {
		return value;
	}
	return `${value.slice(0, max - 1).trimEnd()}…`;
}

function summarizeComment(value) {
	const normalized = normalizeWhitespace(value);
	if (!normalized) {
		return '';
	}

	const sentence =
		normalized.match(/^(.{1,220}?[.!?])(?:\s|$)/u)?.[1] ?? normalized;
	return truncate(sentence, MAX_SUMMARY_CHARS);
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

function parsePrNumberFromUrl(value) {
	if (typeof value !== 'string') {
		return null;
	}
	const match = value.match(/\/pulls\/(\d+)(?:$|[/?])/);
	return match ? Number(match[1]) : null;
}

function commentContextLine({ kind, path, line }) {
	if (kind === 'inline' && path) {
		return line ? `${path}:${line}` : path;
	}
	return null;
}

async function loadPrDetails({ repositoryFullName, prNumber, githubToken }) {
	if (!repositoryFullName || !prNumber || !githubToken) {
		throw new Error(
			'repositoryFullName, prNumber and githubToken are required.',
		);
	}

	const url = `https://api.github.com/repos/${repositoryFullName}/pulls/${prNumber}`;
	return githubGetJson(url, githubToken);
}

function buildMessageText({
	repositoryFullName,
	prNumber,
	prTitle,
	prAuthorLogin,
	commenterLogin,
	commentKind,
	commentContext,
	commentSummary,
	prUrl,
	baseRefName,
	headRefName,
}) {
	const typeLabel =
		commentKind === 'inline'
			? commentContext
				? `comentário inline em ${commentContext}`
				: 'comentário inline no PR'
			: 'comentário geral no PR';

	return [
		'*NOVO COMENTÁRIO EM PR*',
		`- Repositório: ${repositoryFullName}`,
		`- PR: #${prNumber} - ${prTitle}`,
		`- Autor: ${prAuthorLogin}`,
		`- Comentou: ${commenterLogin}`,
		`- Tipo: ${typeLabel}`,
		`- Fluxo: ${headRefName} -> ${baseRefName}`,
		`- Resumo do comentário: ${commentSummary}`,
		`- Link: ${prUrl}`,
	].join('\n');
}

async function main() {
	const webhookUrl = optionalEnv('PR_REVIEW_NOTIFY_WEBHOOK_URL');
	if (!webhookUrl) {
		console.log(
			'PR_REVIEW_NOTIFY_WEBHOOK_URL not configured; skipping PR comment notification.',
		);
		return;
	}

	const githubEventName = requiredEnv('GITHUB_EVENT_NAME');
	const githubToken = requiredEnv('GITHUB_TOKEN');
	const webhookToken = optionalEnv('PR_REVIEW_NOTIFY_WEBHOOK_TOKEN');
	const event = await loadEvent();

	if (event.action !== 'created') {
		console.log(`Ignoring action "${event.action}".`);
		return;
	}

	if (event.sender?.type === 'Bot') {
		console.log('Ignoring bot comment event.');
		return;
	}

	const repositoryFullName = event.repository?.full_name;
	const repositoryHtmlUrl = event.repository?.html_url ?? null;
	const prNumber =
		event.pull_request?.number ??
		event.issue?.number ??
		parsePrNumberFromUrl(event.issue?.pull_request?.url) ??
		parsePrNumberFromUrl(event.pull_request?.url) ??
		null;
	const rawCommentBody = normalizeWhitespace(event.comment?.body ?? '');

	if (githubEventName === 'issue_comment' && !event.issue?.pull_request) {
		console.log('Ignoring issue comment outside pull request context.');
		return;
	}

	if (!repositoryFullName || !prNumber) {
		throw new Error('Unable to resolve PR repository or number from event.');
	}

	if (!rawCommentBody) {
		console.log('Ignoring empty comment body.');
		return;
	}

	const pr = await loadPrDetails({
		repositoryFullName,
		prNumber,
		githubToken,
	});

	if (pr.state !== 'open') {
		console.log(
			`Ignoring comment on PR #${prNumber} because it is ${pr.state}.`,
		);
		return;
	}

	const commentKind =
		githubEventName === 'pull_request_review_comment' ? 'inline' : 'general';
	const commentLine =
		event.comment?.line ?? event.comment?.original_line ?? null;
	const commentPath = event.comment?.path ?? null;
	const commentContext = commentContextLine({
		kind: commentKind,
		path: commentPath,
		line: commentLine,
	});
	const commentSummary = summarizeComment(rawCommentBody);
	const commenterLogin = event.comment?.user?.login ?? 'unknown';
	const prUrl = pr.html_url ?? event.issue?.html_url ?? null;
	const messageText = buildMessageText({
		repositoryFullName,
		prNumber,
		prTitle: pr.title ?? event.issue?.title ?? 'sem título',
		prAuthorLogin: pr.user?.login ?? event.issue?.user?.login ?? 'unknown',
		commenterLogin,
		commentKind,
		commentContext,
		commentSummary,
		prUrl,
		baseRefName: pr.base?.ref ?? 'unknown',
		headRefName: pr.head?.ref ?? 'unknown',
	});

	const payload = {
		event: `${githubEventName}.created`,
		repository: {
			fullName: repositoryFullName,
			htmlUrl: repositoryHtmlUrl,
		},
		pullRequest: {
			number: prNumber,
			title: pr.title ?? event.issue?.title ?? null,
			htmlUrl: prUrl,
			authorLogin: pr.user?.login ?? null,
			baseRefName: pr.base?.ref ?? null,
			headRefName: pr.head?.ref ?? null,
		},
		review: {
			id: event.comment?.pull_request_review_id ?? event.comment?.id ?? null,
			state: 'commented',
			body: truncate(rawCommentBody, MAX_BODY_CHARS) || null,
			htmlUrl: event.comment?.html_url ?? prUrl,
			reviewerLogin: commenterLogin,
			submittedAt: event.comment?.created_at ?? null,
			commentKind,
			commentPath,
			commentLine,
		},
		notification: {
			channel: 'slack',
			messageText,
		},
	};

	const headers = {
		'Content-Type': 'application/json',
		'User-Agent': 'abp3-pr-comment-notifier',
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
			`PR comment relay webhook returned ${response.status}: ${body}`,
		);
	}

	console.log(`PR comment notification queued for PR #${prNumber}.`);
}

await main();
