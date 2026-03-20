FROM node:22-alpine

WORKDIR /app
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false

COPY package.json package-lock.json* ./
COPY tsconfig.base.json biome.json eslint.config.cjs ./
COPY front/package.json front/package.json
COPY back/package.json back/package.json

RUN npm ci --no-audit --no-fund

COPY front ./front

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace", "front"]
