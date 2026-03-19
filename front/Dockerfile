FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY tsconfig.base.json biome.json eslint.config.cjs .eslintrc.cjs ./
COPY front/package.json front/package.json
COPY back/package.json back/package.json

RUN npm install

COPY front ./front

EXPOSE 5173

CMD ["npm", "run", "dev", "--workspace", "front"]
