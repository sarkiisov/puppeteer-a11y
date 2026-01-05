FROM node:24

ENV LANG=en_US.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --reporter=silent

COPY tsconfig.json .

COPY src ./src

RUN pnpm build

CMD ["node", "dist/index.js"]