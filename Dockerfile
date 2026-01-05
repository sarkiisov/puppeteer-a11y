FROM node:24

ENV LANG=en_US.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --reporter=silent --dangerously-allow-all-builds

COPY tsconfig.json .

COPY src ./src

RUN pnpm build

RUN echo '#!/bin/bash\ncd /app && node dist/index.js "$@"' > /usr/local/bin/pa11y \
    && chmod +x /usr/local/bin/pa11y

CMD ["sleep", "infinity"]