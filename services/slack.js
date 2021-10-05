import 'dotenv/config.js';
import BaseService from './baseService.js';

class SlackService extends BaseService {
    #configuration;
    #states;

    constructor(browserInstance) {
        super();

        this._browserInstance = browserInstance;

        this.#configuration = {
            clientUrl: null,
            slackUrl: process.env.SLACK_URL,
            slackLogin: process.env.SLACK_EMAIL,
            slackPass: process.env.SLACK_PASSWORD,
            huddleChannel: process.env.SLACK_CHANNEL_ID
        };
    
        this.#states = {
            logged: false,
            isInChannel: false,
            isInHuddle: false
        };
    }

    async doLogin() {
        if (this.#states.logged) {
            return console.warn('[SLACK] I\'m already logged.');
        }

        console.log('[SLACK] 🤞 Starting login...');
    
        await this._openedPage.goto(`${this.#configuration.slackUrl}?no_sso=1`, {waitUntil: 'domcontentloaded'});
        var url = await this._openedPage.url();

        if (url.indexOf('/client/') !== -1) {
            this.#states.logged = true;
            this.#configuration.clientUrl = url;
            this.#states.isInChannel = true;
            console.log('[SLACK] ✅ I\'m already logged in! Redirecting...');
        } else {
            await this._openedPage.type('#email', this.#configuration.slackLogin);
            await this._openedPage.type('#password', this.#configuration.slackPass);
            await this._openedPage.click('#signin_btn');

            this.#states.logged = true;
            console.log('[SLACK] ✅ I\'m in! Redirecting...');
            // TODO: catch login errors

            await this._openedPage.waitForNavigation({waitUntil: 'domcontentloaded'});
            var url = await this._openedPage.url();
            this.#configuration.clientUrl = url;
            this.#states.isInChannel = true;
        }
        
    }

    async joinHuddle() {
        await this._openedPage.evaluate(_ => {
            navigator.mediaDevices.enumerateDevices().then((devices) => { 
                console.log(`JUKEBOX: Devices: ${JSON.stringify(devices)}`) ;
            });
        });
        
        if (!this.#states.logged) {
            throw Error('[SLACK] How you think that I can enter a Huddle without did login?');
        } else if (!this.#states.isInChannel) {
            throw Error('[SLACK] I can\'t join huddle without entered a channel.');
        }

        console.log('[SLACK] 🤞 Joing huddle...');
        await this._openedPage.goto(`${this.#configuration.clientUrl}\\${this.#configuration.huddleChannel}`, {waitUntil: 'domcontentloaded'});
        await this._openedPage.waitForSelector('#huddle_toggle');
        await this._openedPage.waitForTimeout(1000);
        await this._openedPage.click('#huddle_toggle');
        console.log('[SLACK] ✅ Here we go! I\'m in huddle.');
        this.#states.isInHuddle = true;
    }

    async sendMessage(message) {
        if (!this.#states.logged) {
            throw Error('I can\'t send messages.. sorry :( You need to login first.');
        } else if (!this.#states.isInChannel) {
            throw Error('I can\'t send nmessages without entered a channel.');
        }

        console.log('Sending message...');
        await this._openedPage.evaluate((selector, message) => {
            document.querySelector(selector).innerHTML = message;
        }, 'div.ql-editor > p', message);

        return await this._openedPage.click('[data-qa=texty_send_button]');
    }

    neverMuteWatcher() {
        const selector = '[data-qa=huddle_sidebar_footer_mute_button][aria-checked=false]';
        this._openedPage.waitForSelector(selector, {timeout: 0}).then(async () => {
            await this._openedPage.click(selector);
            await this._openedPage.waitForTimeout(5000);
            this.neverMuteWatcher();
        }, this.neverMuteWatcher);
    }

    acceptInvitationWatcher() {
        const selector = '[data-qa="huddle_invite_join"]';
        this._openedPage.waitForSelector(selector, {timeout: 0}).then(async () => {
            await this._openedPage.click(selector);
            try {
                await this._openedPage.click('[data-qa="huddle_join_modal_go"]');
            } catch(e) {}
            await this._openedPage.waitForTimeout(5000);
            this.acceptInvitationWatcher();
        }, this.acceptInvitationWatcher);
    }

    generalDialogWatcher() {
        const selector = '[data-qa="dialog_go"]';
        this._openedPage.waitForSelector(selector, {timeout: 0}).then(async () => {
            await this._openedPage.click(selector);
            await this._openedPage.waitForTimeout(5000);
            this.generalDialogWatcher();
        }, this.generalDialogWatcher);
    }
}

export default SlackService;