import puppeteer from 'puppeteer-core';
import 'dotenv/config.js';
import BaseService from './base.js';

class SpotifyService extends BaseService {
    #configuration;
    #states;

    constructor() {
        super();

        this.#configuration = {
            spotifyUrl: 'https://accounts.spotify.com/en/login?continue=https:%2F%2Fopen.spotify.com%2F',
            spotifyLogin: process.env.SPOTIFY_EMAIL,
            spotifyPass: process.env.SPOTIFY_PASSWORD
        }

        this.#states = {
            logged: false
        };
    }

    async doLogin() {
        if (this.#states.logged) {
            return console.warn('I\'m already logged.');
        }

        console.log('🤞[SPOTIFY] Started login...');
        await this.openedPage.goto(`${this.#configuration.spotifyUrl}`, {waitUntil: 'domcontentloaded'});
        var url = await this.openedPage.url();

        if (url.indexOf('https://open.spotify.com/') === 0) {
            console.log('[SLACK] ✅ I\'m in!');
            this.#states.logged = true;
        } else {
            await this.openedPage.type('#login-username', this.#configuration.spotifyLogin);
            await this.openedPage.type('#login-password', this.#configuration.spotifyPass);
            await this.openedPage.click('#login-button');

            this.#states.logged = true;
            console.log('[SLACK] ✅ I\'m in! Redirecting...');
            // TODO: catch login errors

            await this.openedPage.waitForNavigation({waitUntil: 'domcontentloaded'});
        }

        
    }

    async doSearchAndPlayFirstResult(term) {
        console.log(`[SLACK] Searching for "${term}""`);
        await this.openedPage.goto(`${this.#configuration.spotifyUrl}search/${encodeURIComponent(term)}`, {waitUntil: 'domcontentloaded'});
        await this.openedPage.waitForSelector('[data-testid="top-result-card"] [data-testid="play-button"]');
        console.log(`[SLACK] Playing first result for "${term}""`);
        await this.openedPage.click('[data-testid="top-result-card"] [data-testid="play-button"]');
    }

}

export default SpotifyService;