import 'dotenv/config.js';
import BaseService from './base.js';

class YoutubeService extends BaseService {
    #configuration;
    #states;

    constructor(browserInstance) {
        super();

        this._browserInstance = browserInstance;

        this.#configuration = {
            youtubeUrl: 'https://www.youtube.com'
        }

        this.#states = {
            logged: false
        };
    }

    async doSearchAndPlayFirstResult(term) {
        try {
            console.log(`[YOUTUBE] Searching for "${term}""`);
            await this._openedPage.goto(`${this.#configuration.youtubeUrl}/results?search_query=${encodeURIComponent(term)}`, {waitUntil: 'domcontentloaded'});
            await this._openedPage.waitForSelector('#contents a#video-title');
            await this._openedPage.waitForTimeout(3000);
            await this._openedPage.screenshot({path: 'youtube-while-searching.png'});
            await this._openedPage.click('#contents a#video-title');
            await this._openedPage.waitForTimeout(3000);
            await this._openedPage.screenshot({path: 'youtube-while-searching-click.png'});


            // await this._openedPage.waitForSelector('#contents ytmusic-responsive-list-item-renderer a');
            // await this._openedPage.click('#contents ytmusic-responsive-list-item-renderer a');
            // await this._openedPage.waitForSelector('.watch-button a [aria-label="Shuffle"]');
            // await this._openedPage.click('.watch-button a');


        } catch(error) {
            console.error(`[YOUTUBE] 🚨 Error on search and play`);
            console.error(error);
            await this._openedPage.screenshot({path: 'youtube-error-after-search.png'});
        }
        
    }



}

export default YoutubeService;