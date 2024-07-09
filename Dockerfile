FROM node AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS development
CMD ["npm", "run", "start:dev"]

FROM base AS production
RUN npm run build
CMD ["npm", "run", "start:prod"]