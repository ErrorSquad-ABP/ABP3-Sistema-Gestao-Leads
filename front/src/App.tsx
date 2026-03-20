type Highlight = {
	id: string;
	title: string;
	description: string;
};

const pillars: Highlight[] = [
	{
		id: 'architecture',
		title: 'Monólito modular',
		description:
			'Backend em módulos de negócio com fronteiras claras e API REST centralizada.',
	},
	{
		id: 'analytics',
		title: 'Dashboard analítico',
		description:
			'Leitura operacional e gerencial com filtros temporais e indicadores de conversão.',
	},
	{
		id: 'security',
		title: 'Segurança no backend',
		description: 'RBAC, JWT, hashing seguro e autorização tratada no servidor.',
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

function App() {
	return (
		<main className="shell">
			<section className="hero">
				<div className="hero__eyebrow">
					ABP 2026-1 • FATEC Jacareí • ErrorSquad-ABP
				</div>
				<h1>Sistema de Gestão de Leads com Dashboard Analítico</h1>
				<p className="hero__summary">
					Base inicial em single repository para o projeto da 1000 Valle
					Multimarcas, preparada para evoluir com frontend em React, backend em
					Node.js e banco PostgreSQL.
				</p>
				<div className="hero__chips">
					<span>React + TypeScript</span>
					<span>Node.js + Express</span>
					<span>PostgreSQL</span>
					<span>Docker Compose</span>
				</div>
			</section>

			<section className="panel">
				<div className="panel__header">
					<h2>Pilares técnicos</h2>
					<p>
						Arquitetura, governança e segurança definidas desde o início do
						semestre.
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
						O frontend será organizado por features para manter alta coesão e
						baixo acoplamento.
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

export default App;
