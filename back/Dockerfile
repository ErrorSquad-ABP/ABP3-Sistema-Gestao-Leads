FROM node:22-alpine

WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=384
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false

COPY package.json package-lock.json* ./
COPY tsconfig.base.json biome.json eslint.config.cjs .eslintrc.cjs ./
COPY front/package.json front/package.json
COPY back/package.json back/package.json

RUN npm ci --no-audit --no-fund

COPY back ./back

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace", "back"]
