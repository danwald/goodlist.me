FROM node:22-slim
WORKDIR /app
# AIDEV-NOTE: Prisma's query engine needs to detect the system libssl version at
# `prisma generate` time; node:22-slim doesn't ship openssl, so without this Prisma
# silently guesses (openssl-1.1.x) which risks bundling the wrong engine binary.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
CMD ["npm", "run", "dev"]
