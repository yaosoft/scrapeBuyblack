import { myBrowser } from "./browser.js";
import { scrapeData } from './scrape.js'
import axios from 'axios';
import fs from 'fs';

const page_total = 74;   // the total of page that should be loaded
var page_first = 0;    // first page to start crawling with
var page_last = 25;   // the number of page to scrap
var page_counter = 0;
var item_first = 0;    // first item to start crawling with
var step = 22;   // ToDo: dynamically ( number of items on a page )
var item_last = step; // step; // last item to stop crawling for a page
var page_current = page_first;
var retry01 = 0;
var retry02 = 0;
const max_retry01 = 100; // Geting listing page HTML with scraperAPI 
const max_retry02 = 2;
const max_retry03 = 3;
const max_retry04 = 10;    // Next button
var allScrapedData = [];
var indices = {};
var itemsIndices = {};
itemsIndices['firstItemIndice'] = item_first;
itemsIndices['lastItemIndice'] = item_last - 1;
var this_is_the_first_page = true;
const url = 'https://www.michaelhill.com.au/jewellery/shop-all';  
//'https://whatismyipaddress.com/';  https://www.google.com;

//const proxyIP = '54.241.76.219';
//const proxyPort = '3000';
//const proxyServer = 'http://' + proxyIP + ':' + proxyPort;
const proxyServer = '';


async function scraperAPI() {
  const data = await axios({
    data: {
      apiKey: '71d0b9239e80f182095973b797dd5102',
      url: 'https://www.michaelhill.com.au/jewellery/shop-all'
    },
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    url: 'https://async.scraperapi.com/jobs'
  });
  return data;
}
// const resp = await scraperAPI(); // Commented if not used
// const statusUrl = resp.data.statusUrl;
const statusUrl = "https://async.scraperapi.com/jobs/a787c7e4-032f-4305-a87b-2378d41cdd5a";
console.log('List page status URL: ' + statusUrl);

// start nodejs proxy
// import {proxy} from './proxy.js';
// const proxyOk = await proxy.createProxy(proxyIP, proxyPort);
// console.log('proxy ok: ' + proxyOk );

//import useProxy from 'puppeteer-page-proxy';
//await useProxy(page, proxyServer);
//const data = await useProxy.lookup(page);
//console.log('ip: ' + data.ip);


// await page.setJavaScriptEnabled(true);

// Get the listing page HTML
async function getPageHTML(){
  await axios.get(statusUrl)
    .then( res => {
// console.log(res.data);
      const datas = res.data;
      const status = datas.status;
      console.log('status: ' + status);
      if (status == 'finished') {
        const html = datas.response.body;
        fs.writeFile('pageHTML.html', html, 'utf8', function (err) {
          if (err) {
            return console.log(err);
          }
          console.log( "Main Page HTML saved. View it at pageHTML.html" );
        });
        scrapeHTML(html);
      }
      else{
        if (retry01 < max_retry01) {
          console.log("Retrying listing page HTML " + retry01 + ' / ' + max_retry01);
          retry01++;
          setTimeout(getPageHTML, 3000);
        }
        else {
          console.log("Failed to open the main page. Retry please.");
        }
      }
    })
    .catch(error => {
      console.log(error)
    })
}
await getPageHTML();
// console.log('html: ' + html)

async function scrapeHTML(HTML){
  // set page
  
  // const browser = await myBrowser.start(proxyServer);
  const browser = await myBrowser.start('');
  const page = await browser.newPage();

  //Randomize viewport size
  // await page.setViewport({
  //  width: 1920 + Math.floor(Math.random() * 100),
  //  height: 3000 + Math.floor(Math.random() * 100),
  //  deviceScaleFactor: 1,
  //  hasTouch: false,
  //  isLandscape: false,
  //  isMobile: false,
  //});
  // set page's browser client
  const agents = ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 73.0.3683.75 Safari / 537.36Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36, Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36, Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36, Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"];
  // import randomUseragent from 'random-useragent';
  // set request interception
    // await page.setRequestInterception(true);
  const randomAgents = agents[Math.floor(Math.random() * agents.length)];
  // const randomAgents = randomUseragent.getRandom(); // gets a random user agent string
  await page.setUserAgent(randomAgents);
  await page.setContent(HTML, { timeout: 60000 });

  // Scrape data
  itemsIndices = {};

 
  const datas = scrapeData.scraping(page);

  //console.log(datas);
}