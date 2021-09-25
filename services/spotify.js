import 'dotenv/config.js';
import BaseService from './base.js';

class SpotifyService extends BaseService {
    #configuration;
    #states;

    constructor(browserInstance) {
        super();

        this._browserInstance = browserInstance;

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
        await this._openedPage.goto(`${this.#configuration.spotifyUrl}`, {waitUntil: 'domcontentloaded'});
        var url = await this._openedPage.url();

        if (url.indexOf('https://open.spotify.com/') === 0) {
            console.log('[SLACK] ✅ I\'m in!');
            this.#states.logged = true;
        } else {
            await this._openedPage.type('#login-username', this.#configuration.spotifyLogin);
            await this._openedPage.type('#login-password', this.#configuration.spotifyPass);
            await this._openedPage.click('#login-button');

            this.#states.logged = true;
            console.log('[SLACK] ✅ I\'m in! Redirecting...');
            // TODO: catch login errors

            await this._openedPage.waitForNavigation({waitUntil: 'domcontentloaded'});
        }

        
    }

    async doSearchAndPlayFirstResult(term) {
        console.log(`[SLACK] Searching for "${term}""`);
        await this._openedPage.goto(`${this.#configuration.spotifyUrl}search/${encodeURIComponent(term)}`, {waitUntil: 'domcontentloaded'});
        await this._openedPage.waitForSelector('[data-testid="top-result-card"] [data-testid="play-button"]');
        console.log(`[SLACK] Playing first result for "${term}""`);
        await this._openedPage.click('[data-testid="top-result-card"] [data-testid="play-button"]');
    }

}

export default SpotifyService;