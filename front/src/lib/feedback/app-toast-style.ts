/** Estilo padrão de toast (Sonner) alinhado à palette da sidebar. */
const appToastStyle = {
	style: {
		background: 'var(--sidebar)',
		color: 'var(--sidebar-foreground)',
		border: '1px solid var(--sidebar-border)',
	},
} as const;

export { appToastStyle };
