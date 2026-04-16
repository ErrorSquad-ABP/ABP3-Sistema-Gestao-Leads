import path from 'node:path';
import type { NextConfig } from 'next';

const apiProxyTarget = process.env.API_INTERNAL_URL?.replace(/\/$/, '');

const nextConfig: NextConfig = {
	reactStrictMode: true,
	output: 'standalone',
	// npm workspaces: trace from repo root so hoisted deps are in standalone output.
	outputFileTracingRoot: path.join(process.cwd(), '..'),
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.shadcnspace.com',
				pathname: '/**',
			},
		],
	},
	async rewrites() {
		if (!apiProxyTarget) {
			return [];
		}

		return [
			{
				source: '/api/:path*',
				destination: `${apiProxyTarget}/api/:path*`,
			},
		];
	},
};

export default nextConfig;
