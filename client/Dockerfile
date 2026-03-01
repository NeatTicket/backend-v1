FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Serve build using static server
RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
