import { default as axios } from "axios"
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
config();

export default class Translator {
    constructor() {
        this.target = "en"
        this.languages_dict = {}
        this.languageName_to_code = {}
    }

    async init() {

        try {
            const res = await axios.get("https://api.cognitive.microsofttranslator.com/languages",
                {
                    params: {
                        'api-version': '3.0',
                    }

                });
            this.languages_dict = res.data.translation
            this.createLanguageNameAndCodeDict()
        }
        catch (err) {
            console.log('Language manager error:', err)
            throw err
        }
    }

    createLanguageNameAndCodeDict() {
        for (const code in this.languages_dict) {
            const codeData = this.languages_dict[code]
            const languageName = codeData.name.toLowerCase()
            this.languageName_to_code[languageName] = code
        }
    }

    getCodeByName(languageName) {

        languageName = languageName.toLowerCase()

        if (this.languageName_to_code[languageName]) {
            return this.languageName_to_code[languageName]
        }
        return null;
    }

    async translate(text) {
        return await translate_async(text, this.target)
    }
}


const key = process.env.AZURE_TRANSLATOR_KEY;
const endpoint = process.env.ENDPOINT;
const location = process.env.LOCATION;

async function translate_async(text, targetLanguage) {
    try {
        const response = await axios({
            baseURL: endpoint,
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Ocp-Apim-Subscription-Region': location,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            params: {
                'api-version': '3.0',
                'to': targetLanguage
            },
            data: [{
                'text': text
            }],
            responseType: 'json'
        });
        return response.data[0].translations[0].text;
    } catch (error) {
        console.error("Translation error:", error);
        return "Translation failed";
    }
}