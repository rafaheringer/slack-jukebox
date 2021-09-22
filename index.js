import SlackService  from './services/slack.js';

(async() => {
    var slackTab = new SlackService();
    await slackTab.init();
    await slackTab.doLogin();
    await slackTab.joinHuddle();

    slackTab.neverMuteWatcher();
    slackTab.acceptInvitationWatcher();
})();
