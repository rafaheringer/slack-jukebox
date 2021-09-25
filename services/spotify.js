import puppeteer from 'puppeteer-core';
import 'dotenv/config.js';
import BaseService from './base.js';

class SpotifyService extends BaseService {
    #configuration;
    #states;

    constructor() {
        super();
        this.#configuration = {
            spotifyLogin: process.env.SPOTIFY_EMAIL,
            spotifyPass: process.env.SPOTIFY_PASSWORD
        }
    }

    async foo() {
        console.log('bar');
    }

}

export default SpotifyService;