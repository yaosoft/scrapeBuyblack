// WARNING: don't use console.error here for debug, use console.error instead. STDOUT is used to deliver output data

import { myBrowser } from "./browser.js";

// find value of input process argument with --input-data
const inpDataB64 = process.argv.find((a) => a.startsWith('--input-data')).replace('--input-data', '')
const inputData = await JSON.parse(Buffer.from(inpDataB64, 'base64').toString())

// console.error(inputData.url);  // print out data to STDOUT
const proxyIP = '184.169.231.206';
const proxyPort = '3000';
const proxyServer = 'http://' + proxyIP + ':' + proxyPort;

const browser = await myBrowser.start(proxyServer);
const itemPage = await browser.newPage();
await itemPage.setRequestInterception(true)
await itemPage.on('request', (req) => {
  if (
    req.resourceType() === 'image' ||
    req.resourceType() == 'stylesheet' ||
    req.resourceType() == 'font'
  ) {
    req.abort();
  }
  else {
    req.continue();
  }
});

await itemPage.setViewport({
    width: 1366,
    height: 768,
    //deviceScaleFactor: 1,
    //hasTouch: false,
    isLandscape: true,
    //isMobile: false,
});

const link = inputData.link;
// const ID = inputData.ID;

// read the file content from itemHTMLFile
const getData = async () => {
    // 
    var dataObj = {};
    // Get Item page HTML page url

    var itemPromise = () => new Promise(async (resolve, reject) => {
        // Load html page

        // await itemPage.setRequestInterception(true)
        // await itemPage.on('request', (req) => {
        //     if (
        //         req.resourceType() === 'image' ||
        //         req.resourceType() == 'stylesheet' ||
        //         req.resourceType() == 'font'
        //     ) {
        //         req.abort();
        //     }
        //     else {
        //         req.continue();
        //     }
        // });

        // set page's browser client
        const agents = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"];
        // import randomUseragent from 'random-useragent';
        // set request interception
        var randomAgents = agents[Math.floor(Math.random() * agents.length)];
        // const randomAgents = randomUseragent.getRandom(); // gets a random user agent string
        await itemPage.setUserAgent(randomAgents);

        // autoscroll
        async function autoScroll() {
            await itemPage.evaluate(async () => {
                    await new Promise( async(resolve) => {
                        var totalHeight = 0;
                        var distance = 200;
                        var timer = setInterval( async() => {
                            var scrollHeight = document.body.scrollHeight;
                            await window.scrollBy(0, distance);
                            totalHeight += distance;

                            if (totalHeight >= scrollHeight - window.innerHeight) {
                                await clearInterval(timer);
                                resolve();
                            }
                        }, 100);
                    });
            });
        }
        
        // Open the item page
        await itemPage.goto(link, {timeout: 60000});

        try {
// Item name
			const itemNameX = "//div/h1";       
			var itemName = '';
			try {
				const els = await itemPage.$x(itemNameX);
				await itemPage.waitForXPath( itemNameX, {timeout:10000} );
				itemName = await itemPage.evaluate(el => el.textContent, els[0] )
			}
			catch (err) {
				console.error('-! Item name issue: ' + err.message);
console.error('err: ' + err);
				itemName = '';
			}

			// Website
			const websiteX = "//a[ contains( @title, 'Website' ) ]";
			var website = '';
			try {
				await itemPage.waitForXPath(websiteX, { timeout: 10000 });
				const els = await itemPage.$x(websiteX);
				website = await itemPage.evaluate(el => el.href, els[0])
			}
			catch (err) {
				console.error('-! Website issue');
console.error('err: ' + err);
				website = '';
			}
                    
			// Phone
			var phone = '';
			const phoneX = "//a[ contains( @href, 'tel:' ) ]/u";
			try {
				await itemPage.waitForXPath(phoneX, { timeout: 10000 });
				const els = await itemPage.$x(phoneX);
				phone = await itemPage.evaluate(el => el.textContent, els[0])
			}
			catch (err) {
				console.error('-! Phone issue');
				console.error('err: ' + err);
				phone = '';
			}
            
            // Address
            var address = '';
            const addressX = "//div[ contains( ., 'Location' )]/following-sibling::div";
            try {
                await itemPage.waitForXPath(addressX, { timeout: 10000 });
                const els = await itemPage.$x(addressX);
                address = await itemPage.evaluate(el => el.textContent, els[0])
            }
            catch (err) {
                console.error('-! Address issue');
console.error('err: ' + err);
                address = '';
            }

            // About
            var about = '';
            const aboutX = "//h2[ contains( ., 'About' )]/following-sibling::div";
            try {
                await itemPage.waitForXPath(aboutX, { timeout: 10000 });
                const els = await itemPage.$x(aboutX);
                about = await itemPage.evaluate(el => el.textContent, els[0])
            }
            catch (err) {
                console.error('-! about issue');
console.error('err: ' + err);
                about = '';
            }

            // Service
            var service = '';
            const serviceX = "//div[contains(@class, 'specialties-table')]//li//a[contains(@class, 'btn')]";
            try {
                await itemPage.waitForXPath( serviceX, { timeout: 10000 } );
                const els = await itemPage.$x( serviceX );
                service = await itemPage.evaluate( el => el.textContent, els[0] )
            }
            catch (err) {
                console.error('-! service issue');
console.error('err: ' + err);
                service = '';
            }
			
			// Operating hours
            var hours = '';
            const hoursX = "//h2[ contains( ., 'Hours of Operation' )]/following-sibling::div";
            try {
                await itemPage.waitForXPath(hoursX, { timeout: 10000 });
                const els = await itemPage.$x(hoursX);
                hours = await itemPage.evaluate(el => el.textContent, els[0])
            }
            catch (err) {
                console.error('-! hours issue');
console.error('err: ' + err);
                hours = '';
            }

			// Images 
            var image = '';
            const imageX = "//img[ contains( @title, 'Contact' )] ";
            try {
                await itemPage.waitForXPath( imageX, { timeout: 10000 } );
                const els = await itemPage.$x( imageX );
                image = await itemPage.evaluate( el => el.src, els[0] )
            }
            catch (err) {
                console.error('-! image issue');
console.error('err: ' + err);
                image = '';
            }

            // Collect
            dataObj['Name'] 		= await itemName.trim();
            dataObj['About'] 		= about.trim();
            dataObj['Website'] 		= (website != null) ? website : '';
            dataObj['Phone'] 		= (phone != null) ? phone : '';
            dataObj['Address'] 		= (address != null) ? address : '';
            dataObj['Hours'] 		= (hours != null) ? hours : '';
			dataObj['Services'] 	= (service != null) ? service : '';
            dataObj['Country'] 		= 1;
            dataObj['Image_url'] 	= image;

// console.error( 'Address: ' + dataObj['Address'] );

            await resolve(dataObj);
		}
        catch (err) {
            console.error( err );
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
