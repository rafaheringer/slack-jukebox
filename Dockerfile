FROM alpine:latest

# Create user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Dependencies
RUN apk add --update --no-cache \
    chromium git nodejs npm \
    pulseaudio pulseaudio-alsa pulseaudio-utils alsa-lib alsa-utils alsa-tools
    
# Change user
USER appuser
WORKDIR /usr/src/app

# Audio process
COPY sample.mp3 /opt/media/sample.mp3
COPY entrypoint.sh /opt/bin/entrypoint.sh
ENTRYPOINT /opt/bin/entrypoint.sh

# Do not use puppeteer embedded chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
ENV CHROMIUM_PATH="/usr/bin/chromium-browser"
ENV PUPPETEER_EXECUTABLE_PATH="${CHROMIUM_PATH}"
ENV DOCKER_ENV=true

# Add node packages to path 
ENV PATH="/node_modules/.bin:${PATH}"

# Install the APP
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --production
RUN mv node_modules ../
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
