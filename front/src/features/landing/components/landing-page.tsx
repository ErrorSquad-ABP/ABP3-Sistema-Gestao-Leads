type Highlight = {
	id: string;
	title: string;
	description: string;
};

type ApiStatusSnapshot = {
	endpoint: string;
	mode: 'online' | 'offline';
	service: string;
	status: string;
	timestamp: string | null;
};

const pillars: Highlight[] = [
	{
		id: 'architecture',
		title: 'Apps separadas',
		description:
			'Frontend em Next.js e API em NestJS separados, conectados por HTTP/JSON dentro do mesmo repositório.',
	},
	{
		id: 'analytics',
		title: 'Dashboard analítico',
		description:
			'Leitura operacional e gerencial com filtros temporais e indicadores de conversão.',
	},
	{
		id: 'security',
		title: 'Segurança no servidor',
		description:
			'RBAC, JWT, hashing seguro e autorização concentrada no backend.',
	},
];

const plannedModules: Highlight[] = [
	{
		id: 'auth',
		title: 'Autenticação',
		description:
			'Login com e-mail e senha, emissão de JWT e manutenção de credenciais.',
	},
	{
		id: 'leads',
		title: 'Leads e clientes',
		description:
			'Captação multicanal, vínculo com cliente, loja e atendente responsável.',
	},
	{
		id: 'negotiations',
		title: 'Negociações',
		description:
			'Estágio, status, importância, encerramento e histórico de mudanças.',
	},
	{
		id: 'dashboards',
		title: 'Indicadores',
		description:
			'Painéis operacionais e analíticos para atendente, gerente, gerente geral e admin.',
	},
];

type LandingPageProps = {
	apiStatus: ApiStatusSnapshot;
};

function formatTimestamp(timestamp: string | null) {
	if (!timestamp) {
		return 'API ainda não respondeu nesta sessão.';
	}

	return new Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'short',
		timeStyle: 'medium',
	}).format(new Date(timestamp));
}

function LandingPage({ apiStatus }: LandingPageProps) {
	return (
		<main className="shell">
			<section className="hero">
				<div className="hero__eyebrow">
					ABP 2026-1 • FATEC Jacareí • ErrorSquad-ABP
				</div>
				<h1>Sistema de Gestão de Leads com Dashboard Analítico</h1>
				<p className="hero__summary">
					Base inicial em single repository com <code>front</code> em{' '}
					<code>Next.js</code> e <code>back</code> em <code>NestJS</code>,
					preparada para evoluir com fronteira HTTP clara, backend modular e
					PostgreSQL como núcleo analítico e transacional.
				</p>
				<div className="hero__chips">
					<span>Front: Next.js</span>
					<span>API: NestJS</span>
					<span>HTTP/JSON</span>
					<span>PostgreSQL</span>
				</div>
			</section>

			<section className="status">
				<div>
					<p className="status__eyebrow">Integração entre aplicações</p>
					<h2>Frontend consumindo a API separada por contrato HTTP</h2>
				</div>
				<div className={`status__pill status__pill--${apiStatus.mode}`}>
					<strong>
						{apiStatus.mode === 'online' ? 'API online' : 'API offline'}
					</strong>
					<span>{apiStatus.endpoint}</span>
				</div>
				<div className="status__grid">
					<div>
						<span className="status__label">Serviço</span>
						<strong>{apiStatus.service}</strong>
					</div>
					<div>
						<span className="status__label">Estado</span>
						<strong>{apiStatus.status}</strong>
					</div>
					<div>
						<span className="status__label">Última leitura</span>
						<strong>{formatTimestamp(apiStatus.timestamp)}</strong>
					</div>
				</div>
			</section>

			<section className="panel">
				<div className="panel__header">
					<h2>Pilares técnicos</h2>
					<p>
						Arquitetura, governança, integração HTTP e segurança definidas desde
						o início do semestre.
					</p>
				</div>
				<div className="grid">
					{pillars.map((pillar) => (
						<article className="card" key={pillar.id}>
							<h3>{pillar.title}</h3>
							<p>{pillar.description}</p>
						</article>
					))}
				</div>
			</section>

			<section className="panel panel--contrast">
				<div className="panel__header">
					<h2>Módulos previstos</h2>
					<p>
						O frontend será organizado por features enquanto o backend preserva
						fronteiras de domínio e contratos próprios.
					</p>
				</div>
				<div className="grid">
					{plannedModules.map((module) => (
						<article className="card card--dark" key={module.id}>
							<h3>{module.title}</h3>
							<p>{module.description}</p>
						</article>
					))}
				</div>
			</section>

			<section className="timeline">
				<div className="timeline__item">
					<strong>Sprint 1</strong>
					<span>Fundação técnica, autenticação e RBAC</span>
				</div>
				<div className="timeline__item">
					<strong>Sprint 2</strong>
					<span>Negociação, histórico e dashboard operacional</span>
				</div>
				<div className="timeline__item">
					<strong>Sprint 3</strong>
					<span>Dashboard analítico, logs e hardening final</span>
				</div>
			</section>
		</main>
	);
}

export type { ApiStatusSnapshot };
export { LandingPage };
