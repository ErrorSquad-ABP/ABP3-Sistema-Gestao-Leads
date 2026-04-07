import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactStrictMode: true,
	output: 'standalone',
	// npm workspaces: trace from repo root so hoisted deps are in standalone output.
	outputFileTracingRoot: path.join(process.cwd(), '..'),
};

export default nextConfig;
