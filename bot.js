import TelegramBot from 'node-telegram-bot-api';
import { config } from 'dotenv';
config();

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });


async function init(translator, scraper) {

    const options = {
        start: /^(s|S)(t|T)(a|A)(r|R)(t|T)$/,
        number: /^(1[0-1][0-1]|[1-9]\d*)$/, 
        language: /^(s|S)(e|E)(t|T) (l|L)(a|A)(n|N)(g|G)(u|U)(a|A)(g|G)(e|E) (.+)/ 
    };    

    const MessageType = {
        START: 'start',
        NUMBER: 'number',
        LANGUAGE: 'language',
        UNKNOWN: 'unknown'
    };

    const startMessage = 'Hello!\n' +
        `Please enter a number between 1-101 in order to get a joke.\n` +
        `Have fun!`

    async function setLanguage(msg, chatId){
    
        const res = msg.match(options.language)[12];
    
        const code = translator.getCodeByName(res)
        if (!code) {
            bot.sendMessage(chatId, await translator.translate("Sorry, I could not process your request. Please check for any typo or select another language\n"))
            return;
        }
        translator.target = code
        bot.sendMessage(chatId, await translator.translate(`No problem`))
    }

    async function handleStartMsg(chatId){
        bot.sendMessage(chatId, await translator.translate(startMessage))
    }

    async function selectJoke(msg, chatId){
        if(scraper.getSize() !== 101){
            bot.sendMessage(chatId, await translator.translate(`Sorry, I could not load all 101 jokes. Please try again later.`))
            return;
        }
        const res = msg.match(options.number)[0];

        if (res > 101 || res < 1 ){
            bot.sendMessage(chatId, await translator.translate(`Sorry, I could not process your request. Please enter a number between 1-101`))
            return;
        }

        const translatedText = await translator.translate(`${res}. ` + scraper.getJoke(res))

        bot.sendMessage(chatId, translatedText)
    }

    function getMessageType(msg) {
        if (options.language.test(msg)) {
            return MessageType.LANGUAGE;
        } else if (options.start.test(msg)) {
            return MessageType.START;
        } else if (options.number.test(msg)) {
            return MessageType.NUMBER;
        } else {
            return MessageType.UNKNOWN;
        }
    }

    bot.on('message', async (msg) => {
        const newMsg = msg.text;
        const chatId = msg.chat.id;
    
        const messageType = getMessageType(newMsg);
    
        switch (messageType) {
            case MessageType.LANGUAGE:
                setLanguage(newMsg, chatId);
                break;
    
            case MessageType.START:
                handleStartMsg(chatId);
                break;
    
            case MessageType.NUMBER:
                selectJoke(newMsg, chatId);
                break;
    
            default:
                bot.sendMessage(chatId, await translator.translate(`Sorry, I could not process your request. Please try again`));
                break;
        }
    });
    
    console.log('Bot is running');
}

const myBot = { init };

export default myBot