'use client';

import { useState } from 'react';

type LoginFormState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'error'; message: string };

function LoginPage() {
	const [formState, setFormState] = useState<LoginFormState>({
		status: 'idle',
	});
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!email || !password) {
			setFormState({
				status: 'error',
				message: 'Preencha todos os campos antes de continuar.',
			});
			return;
		}

		setFormState({ status: 'loading' });

		// TODO: substituir pelo server action real (login-action.ts)
		setTimeout(() => {
			setFormState({
				status: 'error',
				message: 'Credenciais inválidas. Verifique e-mail e senha.',
			});
		}, 1200);
	}

	const isLoading = formState.status === 'loading';

	return (
		<main className="login">
			<div className="login__card">
				<header className="login__header">
					<p className="login__eyebrow">
						Sistema de Gestão de Leads · 1000 Valle Multimarcas
					</p>
					<h1 className="login__title">Entrar</h1>
					<p className="login__subtitle">
						Acesse sua conta para continuar.
					</p>
				</header>

				<form className="login__form" onSubmit={handleSubmit} noValidate>
					<div className="login__field">
						<label className="login__label" htmlFor="email">
							E-mail
						</label>
						<input
							className="login__input"
							id="email"
							type="email"
							autoComplete="email"
							placeholder="seu@email.com.br"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isLoading}
						/>
					</div>

					<div className="login__field">
						<label className="login__label" htmlFor="password">
							Senha
						</label>
						<div className="login__input-wrapper">
							<input
								className="login__input login__input--password"
								id="password"
								type={showPassword ? 'text' : 'password'}
								autoComplete="current-password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isLoading}
							/>
							<button
								type="button"
								className="login__toggle-password"
								onClick={() => setShowPassword((prev) => !prev)}
								aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
								disabled={isLoading}
							>
								{showPassword ? (
									<EyeOffIcon />
								) : (
									<EyeIcon />
								)}
							</button>
						</div>
					</div>

					{formState.status === 'error' && (
						<div className="login__error" role="alert">
							<ErrorIcon />
							<span>{formState.message}</span>
						</div>
					)}

					<button
						className="login__submit"
						type="submit"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<span className="login__spinner" aria-hidden="true" />
								Entrando…
							</>
						) : (
							'Entrar'
						)}
					</button>
				</form>

				<footer className="login__footer">
					<p>
						ErrorSquad-ABP · FATEC Jacareí · DSM 2026-1
					</p>
				</footer>
			</div>
		</main>
	);
}

// ---------------------------------------------------------------------------
// Ícones inline — evita dependência de biblioteca só para a tela de login
// ---------------------------------------------------------------------------

function EyeIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	);
}

function EyeOffIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
			<line x1="1" y1="1" x2="23" y2="23" />
		</svg>
	);
}

function ErrorIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="8" x2="12" y2="12" />
			<line x1="12" y1="16" x2="12.01" y2="16" />
		</svg>
	);
}

export { LoginPage };
