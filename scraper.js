import puppeteer from 'puppeteer-extra';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';
import { load } from 'cheerio';

const sourceURL = "https://parade.com/968666/parade/chuck-norris-jokes/";

export default class Scraper {
    constructor() {
        this.scrapedJokes = [];
    }

    async init() {
        try {
            await this.setupPuppeteer();
            await this.fetchJokes();
        } catch (err) {
            console.error('scraper error:', err);
            throw err;
        }
    }

    async setupPuppeteer() {
        puppeteer.use(pluginStealth());
        this.browser = await puppeteer.launch({ headless: "new", executablePath: executablePath() });
        this.page = await this.browser.newPage();

        this.page.setRequestInterception(true);
        this.page.on('request', async (request) => {
            if (request.resourceType() === 'image') {
                await request.abort();
            } else {
                await request.continue();
            }
        });
        
        await new Promise(r => setTimeout(r, 1000));
    }

    async fetchJokes() {
        await this.page.goto(sourceURL);
        const html = await this.page.content();
        await this.browser.close();
        const $ = load(html);

        $('ol li').each((index, element) => {
            this.scrapedJokes.push($(element).text());
        });
        if(this.scrapedJokes.length !== 101)
            console.log('could not load all 101 jokes')
        
    }    

    getJoke(index) {
        return this.scrapedJokes[index - 1];
    }

    getSize() {
        return this.scrapedJokes.length;
    }
}

