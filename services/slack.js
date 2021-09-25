import 'dotenv/config.js';
import puppeteer from 'puppeteer-core';

class SlackService {

    #configuration = {
        clientUrl: null,
        slackUrl: process.env.SLACK_URL,
        slackLogin: process.env.SLACK_EMAIL,
        slackPass: process.env.SLACK_PASSWORD,
        huddleChannel: process.env.SLACK_CHANNEL_ID,
        developMode: process.env.NODE_ENV === 'development',
        chromePath: process.env.CHROMIUM_PATH,
        isInDocker: process.env.DOCKER_ENV || false
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
            headless: this.#configuration.isInDocker ? true : false,
            slowMo: 50,
            executablePath: this.#configuration.chromePath,
            userDataDir: '.data/slack',
            args: ['--use-fake-ui-for-media-stream', '--no-sandbox','--enable-blink-features=GetUserMedia','--autoplay-policy=no-user-gesture-required'],
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

        this.#openedPage.on('console', msg => {
            if (msg._text.indexOf('JUKEBOX:') === 0) {
                console.log(`Log from ${msg._text}`);
            }
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
            // this.#openedPage.screenshot({path: 'loggedin.png'});

            await this.#openedPage.waitForNavigation({waitUntil: 'domcontentloaded'});
            var url = await this.#openedPage.url();
            this.#configuration.clientUrl = url;
            this.#states.isInChannel = true;
        }
        
    }

    async joinHuddle() {
        this.#openedPage.evaluate(_ => {
            console.log(`JUKEBOX: Slack device Prefs: ${localStorage.getItem('devicePrefs')}`);
            console.log(`JUKEBOX: For test: ${localStorage.getItem('SLACK_DEBUG_DISABLED')}`);

            navigator.mediaDevices.enumerateDevices().then((devices) => { 
                console.log(`JUKEBOX: Devices ${JSON.stringify(devices)}`) ;
            });
        });
        
        if (!this.#states.logged) {
            throw Error('How you think that I can enter a Huddle without did login?');
        } else if (!this.#states.isInChannel) {
            throw Error('I can\'t join huddle without entered a channel.');
        }

        console.log('🤞 Joing huddle...');
        // this.#openedPage.screenshot({path: 'beforeJoinHuddle.png'});
        await this.#openedPage.goto(`${this.#configuration.clientUrl}\\${this.#configuration.huddleChannel}`, {waitUntil: 'domcontentloaded'});
        await this.#openedPage.waitForSelector('#huddle_toggle');
        await this.#openedPage.click('#huddle_toggle');
        console.log('✅ Here we go! I\'m in huddle.');
        this.#states.isInHuddle = true;
        // this.#openedPage.screenshot({path: 'afterJoinHuddle.png'});
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