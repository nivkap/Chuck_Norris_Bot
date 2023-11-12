import Translator from './translator.js';
import Scraper from './scraper.js';
import myBot from './bot.js';

async function initializeComponents() {
    const translator = new Translator();
    const scraper = new Scraper();

    try {
        await Promise.all([translator.init(), scraper.init()]);
        return { translator, scraper };
    } catch (err) {
        console.error("Initialization error:", err.message);
        throw err;
    }
}

function startBot(translator, scraper) {
    myBot.init(translator, scraper);
}

async function main() {
    try {
        const { translator, scraper } = await initializeComponents();
        startBot(translator, scraper);
    } catch (err) {
        console.error("Main function error:", err.message);
    }
}

main();
