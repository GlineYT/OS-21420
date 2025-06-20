FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all application files
COPY . .

WORKDIR /app/JS/loginsignup
EXPOSE 3000
CMD ["node", "server.js"]