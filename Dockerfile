FROM node:20-alpine

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run dev server, binding to all interfaces so it's accessible from outside the container
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
