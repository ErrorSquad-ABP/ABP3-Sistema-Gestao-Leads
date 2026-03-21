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

COPY front ./front

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace", "front"]

FROM deps AS build

COPY front ./front

RUN npm run build --workspace front

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=build /app/front/.next/standalone/front ./front
COPY --from=build /app/front/.next/static ./front/.next/static

EXPOSE 3000

CMD ["node", "front/server.js"]
