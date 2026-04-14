import path from 'node:path';
import type { NextConfig } from 'next';

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
};

export default nextConfig;
