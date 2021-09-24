import SlackService  from './services/slack.js';

(async() => {
    var slackTab = new SlackService();
    await slackTab.init();
    await slackTab.doLogin();
    await slackTab.joinHuddle();
    // await slackTab.sendMessage(':headphones: Hey, I\'m here! Let\'s listen a good music... :notes:');

    slackTab.neverMuteWatcher();
    slackTab.acceptInvitationWatcher();
})();
