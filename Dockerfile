FROM alpine:latest

WORKDIR /usr/src/app

RUN apk add --update --no-cache \
    chromium \
    git \
    nodejs \
    npm

# Do not use puppeteer embedded chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
ENV CHROMIUM_PATH="/usr/bin/chromium-browser"
ENV PUPPETEER_EXECUTABLE_PATH="${CHROMIUM_PATH}"

# Add node packages to path 
ENV PATH="/node_modules/.bin:${PATH}"

# Install APP
ENV NODE_ENV=production
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
