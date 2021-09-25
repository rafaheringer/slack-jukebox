FROM node:16

# Dependencies
RUN apt-get -qqy update && apt-get -qqy install pulseaudio pulseaudio-utils \
         gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget \
         chromium 

# Add normal user and group with passwordless sudo
RUN groupadd appuser --gid 1201 \
  && useradd appuser --create-home --gid 1201 --shell /bin/bash --uid 1200 \
  && usermod -a -G audio,video appuser \
  && usermod -a -G sudo appuser \
  && echo 'ALL ALL = (ALL) NOPASSWD: ALL' >> /etc/sudoers \
  && echo 'appuser:secret' | chpasswd
ENV HOME=/home/appuser

# Change user
USER 1200:1201
WORKDIR /home/appuser/app

# Do not use puppeteer embedded chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
ENV CHROMIUM_PATH="/usr/bin/chromium"
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

# Audio process
COPY sample.wav /opt/media/sample.wav
COPY entrypoint.sh /opt/bin/entrypoint.sh
ENTRYPOINT /opt/bin/entrypoint.sh