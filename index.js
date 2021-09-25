import SlackService  from './services/slack.js';
import SpotifyService from './services/spotify.js';

(async() => {
    // Slack Tab
    var slackTab = new SlackService();
    await slackTab.init();
    await slackTab.doLogin();
    // await slackTab.joinHuddle();
    // await slackTab.sendMessage(':headphones: Hey, I\'m here! Let\'s listen a good music... :notes:');

    // slackTab.neverMuteWatcher();
    // slackTab.acceptInvitationWatcher();

    // Spotify tab
    // var spotifyTab = new SpotifyService();
    // await spotifyTab.init();
    // spotifyTab.foo();

})();
