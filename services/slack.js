import 'dotenv/config.js';
import puppeteer from 'puppeteer-core';
import BaseService from './base.js';

class SlackService extends BaseService {
    #configuration;
    #states;

    constructor() {
        super();

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

        console.log('[SLACK] 🤞 Started login...');
    
        await this.openedPage.goto(`${this.#configuration.slackUrl}?no_sso=1`, {waitUntil: 'domcontentloaded'});
        var url = await this.openedPage.url();

        if (url.indexOf('/client/') !== -1) {
            this.#states.logged = true;
            this.#configuration.clientUrl = url;
            this.#states.isInChannel = true;
            console.log('[SLACK] ✅ I\'m already logged in! Redirecting...');
        } else {
            await this.openedPage.type('#email', this.#configuration.slackLogin);
            await this.openedPage.type('#password', this.#configuration.slackPass);
            await this.openedPage.click('#signin_btn');

            this.#states.logged = true;
            console.log('[SLACK] ✅ I\'m in! Redirecting...');
            // TODO: catch login errors

            await this.openedPage.waitForNavigation({waitUntil: 'domcontentloaded'});
            var url = await this.openedPage.url();
            this.#configuration.clientUrl = url;
            this.#states.isInChannel = true;
        }
        
    }

    async joinHuddle() {
        await this.openedPage.waitForTimeout(15000);
        await this.openedPage.evaluate(_ => {
            console.log(`JUKEBOX: Slack device Prefs: ${localStorage.getItem('devicePrefs')}`);

            navigator.mediaDevices.enumerateDevices().then((devices) => { 
                console.log(`JUKEBOX: Devices ${JSON.stringify(devices)}`) ;
            });
        });
        
        if (!this.#states.logged) {
            throw Error('[SLACK] How you think that I can enter a Huddle without did login?');
        } else if (!this.#states.isInChannel) {
            throw Error('[SLACK] I can\'t join huddle without entered a channel.');
        }

        console.log('[SLACK] 🤞 Joing huddle...');
        await this.openedPage.goto(`${this.#configuration.clientUrl}\\${this.#configuration.huddleChannel}`, {waitUntil: 'domcontentloaded'});
        await this.openedPage.waitForSelector('#huddle_toggle');
        await this.openedPage.click('#huddle_toggle');
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
        await this.openedPage.evaluate((selector, message) => {
            document.querySelector(selector).innerHTML = message;
        }, 'div.ql-editor > p', message);

        return await this.openedPage.click('[data-qa=texty_send_button]');
    }

    neverMuteWatcher() {
        const selector = '[data-qa=huddle_sidebar_footer_mute_button][aria-checked=false]';
        this.openedPage.waitForSelector(selector, {timeout: 0}).then(async () => {
            await this.openedPage.click(selector);
            this.neverMuteWatcher();
        }, this.neverMuteWatcher);
    }

    acceptInvitationWatcher() {
        // TODO: Accept invitations from another huddles
    }
}

export default SlackService;