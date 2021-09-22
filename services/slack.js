import puppeteer from 'puppeteer-core';
import 'dotenv/config.js';

class SlackService {

    #configuration = {
        clientUrl: null,
        slackUrl: process.env.SLACK_URL,
        slackLogin: process.env.SLACK_EMAIL,
        slackPass: process.env.SLACK_PASSWORD,
        huddleChannel: process.env.SLACK_CHANNEL_ID,
        developMode: process.env.NODE_ENV === 'development',
        chromePath: process.env.CHROMIUM_PATH
    };

    #browserInstance;
    #openedPage;

    #states = {
        logged: false,
        isInChannel: false,
        isInHuddle: false
    };

    constructor() {}

    async init() {
        this.#browserInstance = await puppeteer.launch({
            headless: !this.#configuration.developMode,
            slowMo: this.#configuration.developMode ? 50 : 0,
            executablePath: this.#configuration.chromePath,
            userDataDir: '.data/slack',
            args: ['--use-fake-ui-for-media-stream', '--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox'],
            ignoreDefaultArgs: ['--mute-audio'],
            defaultViewport: {
                width: 1200,
                height: 700
            }
        });

        this.#openedPage = await this.#browserInstance.newPage();

        this.#openedPage.on('dialog', async dialog => {
            console.log(`Dialog opened: ${dialog.message()}`);
            await dialog.dismiss();
        });
    }

    async doLogin() {
        if (this.#states.logged) {
            return console.warn('I\'m already logged.');
        }

        console.log('🤞 Started login...');
    
        await this.#openedPage.goto(`${this.#configuration.slackUrl}?no_sso=1`, {waitUntil: 'domcontentloaded'});
        var url = await this.#openedPage.url();

        if (url.indexOf('/client/') !== -1) {
            this.#states.logged = true;
            this.#configuration.clientUrl = url;
            this.#states.isInChannel = true;
            console.log('✅ I\'m already logged in! Redirecting...');
        } else {
            await this.#openedPage.type('#email', this.#configuration.slackLogin);
            await this.#openedPage.type('#password', this.#configuration.slackPass);
            await this.#openedPage.click('#signin_btn');
            this.#states.logged = true;
            console.log('✅ I\'m in! Redirecting...');
            this.#openedPage.screenshot({path: 'loggedin.png'});

            await this.#openedPage.waitForNavigation({waitUntil: 'domcontentloaded'});
            var url = await this.#openedPage.url();
            this.#configuration.clientUrl = url;
            this.#states.isInChannel = true;
            // TODO: Catch if login fail
        }
        
    }

    async joinHuddle() {
        if (!this.#states.logged) {
            throw Error('How you think that I can enter a Huddle without did login?');
        } else if (!this.#states.isInChannel) {
            throw Error('I can\'t join huddle without entered a channel.');
        }

        console.log('🤞 Joing huddle...');
        this.#openedPage.screenshot({path: 'beforeJoinHuddle.png'});
        await this.#openedPage.goto(`${this.#configuration.clientUrl}\\${this.#configuration.huddleChannel}`, {waitUntil: 'domcontentloaded'});
        await this.#openedPage.waitForTimeout(5 * 1000);
        await this.#openedPage.waitForSelector('#huddle_toggle');
        await this.#openedPage.click('#huddle_toggle');
        console.log('✅ Here we go! I\'m in huddle.');
        this.#states.isInHuddle = true;
        this.#openedPage.screenshot({path: 'afterJoinHuddle.png'});

        await this.sendMessage(':headphones: Hey, I\'m here! Let\'s listen a good music... :notes:');
    }

    async sendMessage(message) {
        if (!this.#states.logged) {
            throw Error('I can\'t send messages.. sorry :( You need to login first.');
        } else if (!this.#states.isInChannel) {
            throw Error('I can\'t send nmessages without entered a channel.');
        }

        console.log('Sending message...');
        await this.#openedPage.evaluate((selector, message) => {
            document.querySelector(selector).innerHTML = message;
        }, 'div.ql-editor > p', message);

        return await this.#openedPage.click('[data-qa=texty_send_button]');
    }

    neverMuteWatcher() {
        const selector = '[data-qa=huddle_sidebar_footer_mute_button][aria-checked=false]';
        this.#openedPage.waitForSelector(selector, {timeout: 0}).then(async () => {
            await this.#openedPage.click(selector);
            this.neverMuteWatcher();
        }, this.neverMuteWatcher);
    }

    acceptInvitationWatcher() {
        // TODO: Accept invitations from another huddles
    }
}

export default SlackService;