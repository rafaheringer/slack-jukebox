import 'dotenv/config.js';
import BaseService from './baseService.js';

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

        console.log('[SPOTIFY] 🤞 Starting login...');
        await this._openedPage.goto(`${this.#configuration.spotifyUrl}`, {waitUntil: 'domcontentloaded'});
        var url = await this._openedPage.url();

        if (url.indexOf('https://open.spotify.com/') === 0) {
            console.log('[SPOTIFY] ✅ I\'m in!');
            this.#states.logged = true;
        } else {
            await this._openedPage.waitForSelector('#login-username');
            await this._openedPage.type('#login-username', this.#configuration.spotifyLogin);
            await this._openedPage.click('#login-password');
            await this._openedPage.type('#login-password', this.#configuration.spotifyPass);
            await this._openedPage.click('#login-button');
            await this._openedPage.waitForTimeout(3000);

            url = await this._openedPage.url();

            if (url.indexOf('https://open.spotify.com/') === 0) {
                this.#states.logged = true;
                console.log('[SPOTIFY] ✅ I\'m in! Redirecting...');
            } else {
                console.log('[SPOTIFY] ⚠️ Whoops! Something was wrong:');
                await this._openedPage.evaluate(_ => {
                    console.log(`JUKEBOX: ${document.querySelector('.alert').innerText}`) ;
                });
                await this._openedPage.screenshot({path: 'spotify-after-login.png'});
            }
        }
    }

    async doSearchAndPlayFirstResult(term) {
        try {
            console.log(`[SPOTIFY] Searching for "${term}""`);
            await this._openedPage.goto(`${this.#configuration.spotifyUrl}search/${encodeURIComponent(term)}`, {waitUntil: 'domcontentloaded'});
            await this._openedPage.waitForSelector('[data-testid="top-result-card"] [data-testid="play-button"]');
            
            await this._openedPage.screenshot({path: 'spotify-after-search.png'});
            console.log(`[SPOTIFY] Playing first result for "${term}""`);

            await this._openedPage.click('[data-testid="top-result-card"] [data-testid="play-button"]');
            await this._openedPage.waitForTimeout(5000);

            await this._openedPage.screenshot({path: 'spotify-after-search-and-play.png'});

            const isPlaying =  (await this._openedPage.$('[data-testid="control-button-pause"]')) !== null || false;

            console.log(`[SPOTIFY] Is playing music: ${isPlaying}`);

            if (isPlaying === false) {
                await this._openedPage.click('[data-testid="top-result-card"] [data-testid="play-button"]');
                console.log('clicking in play');
                await this._openedPage.click('[data-testid="control-button-play"]');
                await this._openedPage.screenshot({path: 'spotify-after-search-and-play-click.png'});
            }


        } catch(error) {
            console.error(`[SPOTIFY] 🚨 Error on search and play`);
            console.error(error);
            await this._openedPage.screenshot({path: 'spotify-error-after-search.png'});
        }
        
    }



}

export default SpotifyService;