import { getApiOverview } from '../modules/system/application/get-api-overview';

function ApiHomePage() {
	const overview = getApiOverview();

	return (
		<main className="shell">
			<section className="hero">
				<p className="hero__eyebrow">API separada em Next.js</p>
				<h1>{overview.name}</h1>
				<p className="hero__summary">
					Aplicação de backend consumida pelo frontend por HTTP/JSON, com
					organização interna de monólito modular e foco em segurança, auditoria
					e evolução analítica.
				</p>
			</section>

			<section className="panel">
				<h2>Estado da base</h2>
				<div className="grid">
					<div className="card">
						<span className="label">Status</span>
						<strong>{overview.status}</strong>
					</div>
					<div className="card">
						<span className="label">Transporte</span>
						<strong>{overview.transport}</strong>
					</div>
					<div className="card">
						<span className="label">Padrão interno</span>
						<strong>{overview.backendPattern}</strong>
					</div>
				</div>
			</section>

			<section className="panel">
				<h2>Endpoints iniciais</h2>
				<ul className="list">
					<li>
						<strong>/api/health</strong> • health check operacional
					</li>
					<li>
						<strong>/api/v1</strong> • visão inicial da API e módulos previstos
					</li>
				</ul>
			</section>
		</main>
	);
}

export default ApiHomePage;
