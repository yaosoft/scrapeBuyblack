// WARNING: don't use console.log here for debug, use console.error instead. STDOUT is used to deliver output data

import { myBrowser } from "./browser.js";
import axios from 'axios';
import fs from 'fs';
import { textMatch } from './textMatch.js';
import cheerio from 'cheerio';

// find value of input process argument with --input-data
const inpDataB64 = process.argv.find((a) => a.startsWith('--input-data')).replace('--input-data', '')
const inputData = await JSON.parse(Buffer.from(inpDataB64, 'base64').toString())

// console.log(inputData.url);  // print out data to STDOUT
const proxyIP = '184.169.231.206';
const proxyPort = '3000';
// const proxyServer = 'http://' + proxyIP + ':' + proxyPort;
const proxyServer = '';

const browser = await myBrowser.start(proxyServer);
const itemPage = await browser.newPage();
const name = inputData.name;
const profile = inputData.profile;
// const itemIndice = 2;
// const name = inputData.name;
// const itemHTMLFile = "./" + itemIndice + '.html';

// read the file content from itemHTMLFile
//const html = fs.readFileSync(itemHTMLFile, 'utf8', function (err, data) {
//    if (err)
//        return err;
    // Display the file content
    // console.log(data);
//    return data;
//});


// await itemPage.screenshot({ path: 'screenshot02.png', fullPage: true });
// await itemPage.goto(link, { waitUntil: 'networkidle2' });

const getData = async () => {
    // 
    var dataObj = {};
    // Get Item page HTML page url
    
    var itemPromise = () => new Promise(async (resolve, reject) => {
        // Load html page
        //await itemPage.setContent(html, { timeout: 120000 });
        const textToMatch = profile;
        
        // find Propublica profile URL
        const query_url = "https://www.google.com/search?q=" + profile + " " + name;
        await itemPage.goto(query_url);
        await itemPage.waitForSelector('title');
// await itemPage.screenshot({ path: 'screenshot02.png', fullPage: true });
        try {
            await itemPage.waitForXPath("(//h3/..)[1]");
            const [el] = await itemPage.$x("(//h3/..)[1]");
            
            var matching = await itemPage.evaluate( el => el.href, el) 

            dataObj[textToMatch]  =  matching;

        }
        catch (err) {
// console.log(err )
            const query_url = "https://www.google.com/search?q=" + profile + " " + name;
// console.log('Errror with profile url - ' + query_url );
            dataObj[textToMatch] = '';

        }
        finally {

            resolve(dataObj);

        }

    });

    //const toReturn = await itemPromise();
    const toReturn = await itemPromise();
    // await browser.close;
    return toReturn;

}
const outputData = await getData();

await itemPage.close();
await browser.close();

console.log(JSON.stringify(outputData))  // print out data to STDOUT