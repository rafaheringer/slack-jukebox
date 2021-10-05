import puppeteer from 'puppeteer-core';
import 'dotenv/config.js';

class BaseService {
    #settings;
    _browserInstance;
    _openedPage;

    constructor() {
        this.#settings = {
            developMode: process.env.NODE_ENV === 'development',
            chromePath: process.env.CHROMIUM_PATH,
            isInDocker: process.env.DOCKER_ENV || false
        };
    }

    async startBrowser() {
        this._browserInstance = await puppeteer.launch({
            headless: this.#settings.isInDocker ? true : false,
            slowMo: 50,
            executablePath: this.#settings.chromePath,
            userDataDir: '.data/slack',
            args: ['--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required','--disable-dev-shm-usage','--disable-gpu', '--disable-setuid-sandbox','--no-sandbox'],
            ignoreDefaultArgs: ['--mute-audio'],
            defaultViewport: {
                width: 1200,
                height: 700
            }
        });

        return new Promise(resolve => {
            resolve(this._browserInstance);
        });
    }

    async init() {
        this._openedPage = await this._browserInstance.newPage();

        this._openedPage.on('dialog', async dialog => {
            console.log(`Dialog opened: ${dialog.message()}`);
            await dialog.dismiss();
        });

        this._openedPage.on('console', msg => {
            if (msg._text.indexOf('JUKEBOX:') === 0) {
                console.log(`Log from ${msg._text}`);
            }
        });
    }

}

export default BaseService;