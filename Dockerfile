# stage 1 Build the SPA (Vite)
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend 
COPY frontend/pacjage.json frontend/package-lock.json ./
RUN npm install --no-audit --no-fund --leagcy-peer-deps
COPY frontend/ ./
# Empty = browser calls /api on the dame host as the page.
ENV VITE_API_URL=
#Public Clerk key is embedded in client JS.
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm run build


# stage 2: build API bundle
FROM node:22-bookworm-slim AS backend-build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install --no-audit --no-fund 
COPY backend/ ./
RUN npm run build


# stage 3: runtime image
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./Public

EXPOSE 3001
USER node 
CMD ["node", "dist/index.js"]