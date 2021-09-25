import BaseService from './services/base.js';
import SlackService  from './services/slack.js';
import SpotifyService from './services/spotify.js';
import YoutubeService from './services/youtube.js';

(async() => {
    // Open browser
    var browser = new BaseService();
    var browserInstance = await browser.startBrowser();

    // Slack Tab
    async function slack() {
        var slackTab = new SlackService(browserInstance);
        await slackTab.init();
        await slackTab.doLogin();
        await slackTab.joinHuddle();
        // await slackTab.sendMessage(':headphones: Hey, I\'m here! Let\'s listen a good music... :notes:');

        slackTab.neverMuteWatcher();
        slackTab.acceptInvitationWatcher();
    }
    

    // Spotify tab
    async function spotify() {
        var spotifyTab = new SpotifyService(browserInstance);
        await spotifyTab.init();
        await spotifyTab.doLogin();
        await spotifyTab.doSearchAndPlayFirstResult('top brasil');
    }

    // Youtube tab
    async function youtube() {
        var youtube = new YoutubeService(browserInstance);
        await youtube.init();
        await youtube.doSearchAndPlayFirstResult('top brasil');
    }

    // START!
    slack();
    //spotify();
    youtube();

})();
