FROM node:22-alpine AS deps

WORKDIR /app
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false

COPY package.json package-lock.json* ./
COPY tsconfig.base.json biome.json eslint.config.cjs ./
COPY front/package.json front/package.json
COPY back/package.json back/package.json

RUN npm ci --no-audit --no-fund

FROM deps AS dev

COPY back ./back

EXPOSE 3001

CMD ["npm", "run", "dev", "--workspace", "back"]

FROM deps AS build

COPY back ./back

RUN npm run build --workspace back

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false

COPY package.json package-lock.json* ./
COPY back/package.json back/package.json

RUN npm ci --workspace back --include-workspace-root=false --omit=dev --no-audit --no-fund

COPY --from=build /app/back/dist ./back/dist

EXPOSE 3001

CMD ["node", "back/dist/main.js"]
