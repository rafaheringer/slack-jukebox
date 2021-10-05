# slack-jukebox
A bot user to listen music on Slack Huddles


## Environment variables
```SH
NODE_ENV=development
CHROMIUM_PATH=<your_chrome_or_edge_path_if_not_in_docker>
SLACK_URL=https://<yourorganization>.slack.com
SLACK_EMAIL=<your_email>
SLACK_PASSWORD=<your_password>
SLACK_CHANNEL_ID=<slack_channel_id>
SPOTIFY_EMAIL=<your_email>
SPOTIFY_PASSWORD=<your_password>
```

### Debuging

**Play sample audio**
```SH
paplay /home/appuser/app/sample.wav -v --device=MicOutput
```

**List audio sources**
```SH
pacmd list-sources | grep -e 'index:' -e device.string -e 'name:'
```


### Todo
[ ] Review EACCESS permission when take Screenshots