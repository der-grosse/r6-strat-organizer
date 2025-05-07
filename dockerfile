# Use the official Node.js image as the base image
FROM node:20 AS base

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

RUN mkdir -p /app/data

# Build the Next.js application
RUN npm run build

# Use node for production
FROM node:20-slim AS production

# Install SQLite runtime
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/src ./src
COPY --from=base /app/data ./data

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]