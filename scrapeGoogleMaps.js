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
// await itemPage.setRequestInterception(true)
// await itemPage.on('request', (req) => {
  // if (
    // req.resourceType() === 'image' ||
    // req.resourceType() == 'stylesheet' ||
    // req.resourceType() == 'font'
  // ) {
    // req.abort();
  // }
  // else {
    // req.continue();
  // }
// });

await itemPage.setViewport({
    width: 1366,
    height: 768,
    //deviceScaleFactor: 1,
    //hasTouch: false,
    isLandscape: true,
    //isMobile: false,
});

// const link = inputData.gMapsUrl;
const country 	= inputData.country;
const name 		= inputData.company_name;
const link 		= 'https://google.com/maps';

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
        
        // Open the item page
		const query = name + ' ' + country;
        await itemPage.goto( link, { timeout: 120000 } );

		// search the place
		await itemPage.type( "input[id=searchboxinput]", query );
		// const searchBtnX = "//button[ contains( @aria-label, 'Search' ) ]";
        // const elem = await itemPage.$x( searchBtnX );
		// elem[0].hover();
		// elem[0].click();
		// await itemPage.type( String.fromCharCode(13) );
		await itemPage.keyboard.press('Enter');
		
// console.error( searchBtnX );
		
		await new Promise( r => setTimeout( r, 10000 ));
		var allItems = '';
		var licount = '';
        try {
			
			// Item name
			const nameX = "//h1";       
			var itemName = '';
			try {
				const els = await itemPage.$x(nameX);
				await itemPage.waitForXPath( nameX, {timeout:10000} );
				itemName = await itemPage.evaluate(el => el.textContent, els[0] )
			}
			catch (err) {
				console.error('-! Google map Item Name issue: ' + err.message);
console.error('err: ' + err);
				itemName = '';
			}
			
			// Item address
			const addressX = "//button[ contains( @data-item-id, 'address' ) ]/div//div[2]/div";       
			var address = '';
			try {
				const els = await itemPage.$x(addressX);
				await itemPage.waitForXPath( addressX, {timeout:10000} );
				address = await itemPage.evaluate(el => el.textContent, els[0] )
			}
			catch (err) {
				console.error('-! Google map Item Address issue: ' + err.message);
console.error('err: ' + err);
				address = '';
			}

			// Website
			const websiteX = "//a[ contains( @data-item-id, 'authority' ) ]/div/div[2]/div";
			var website = '';
			try {
				await itemPage.waitForXPath(websiteX, { timeout: 10000 });
				const els = await itemPage.$x(websiteX);
				website = await itemPage.evaluate(el => el.textContent, els[0])
			}
			catch (err) {
				console.error('-! Google map Website issue');
console.error('err: ' + err);
				website = '';
			}
console.error('website :----------> ' + website);   
			// Phone
			var phone = '';
			const phoneX = "//button[ contains( @data-item-id, 'phone' ) ]/div/div[2]/div[1]";
			try {
				await itemPage.waitForXPath(phoneX, { timeout: 10000 });
				const els = await itemPage.$x(phoneX);
				phone = await itemPage.evaluate(el => el.textContent, els[0])
			}
			catch (err) {
				console.error('-! Google map Phone issue');
				console.error('err: ' + err);
				phone = '';
			}

            // About
            var about = '';
            const aboutX = "//div[ contains( @role, 'presentation' ) ]/following-sibling::div/button/div/following-sibling::div/div/div";
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
			const services  = '';
			const servicesX = "//div[ contains( @role, 'presentation' ) ]/following-sibling::div/button/div/following-sibling::div/div/div/div";
			try{
                await itemPage.waitForXPath(servicesX, {timeout:10000});
                allItems = await itemPage.$x(servicesX);
                licount = await itemPage.evaluate(allItems => allItems.length, allItems);
                var sep = '^^^'; // separator
                for( var i = 0; i < licount; i++ ){
                    if( i == licount - 1 )
                        sep = '';
                    services += await itemPage.evaluate( elt => elt.textContent, allItems[i] ) + sep;
                }
            }
            catch (err) {
                console.error( 'Services ' + err.message );
            }
			
			// Operating hours
            const hours  	= '';
			const hoursX 	= "//div[ contains( @role, 'button' ) ]/following-sibling::div//tbody/tr";
			const hoursBtnX	= "//button[ contains( @data-item-id, 'oh' ) ]";
			try{
				// click
				const elem = await itemPage.$x( hoursBtnX, { timeout:15000 } );
				await itemPage.evaluate( button => button.click(), elem[0] );
				// elem[0].hover();
			    // elem[0].click();
console.error( 'Hours clicked' );

				// scrape
                await itemPage.waitForXPath(hoursX, { timeout:10000 } );
                allItems = await itemPage.$x(hoursX);
                licount = await itemPage.evaluate(allItems => allItems.length, allItems);
                var sep = '^^^'; // separator
                for( var i = 0; i < licount; i++ ){
                    if( i == licount - 1 )
                        sep = '';
                    hours += await itemPage.evaluate( elt => elt.textContent, allItems[i] ) + sep;
                }
            }
            catch (err) {
                console.error( 'Hours ' + err.message );
            }

			// Images 
            var image = '';
            const imageX = "//img[ contains( @decoding, 'async' ) ]";
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
            dataObj['G_Name'] 		= itemName;
            dataObj['G_About'] 		= about;
            dataObj['G_Website'] 	= website;
            dataObj['G_Phone'] 		= phone;
            dataObj['G_Address'] 	= address;
            dataObj['G_Hours'] 		= hours ;
            dataObj['G_Services'] 	= services;
            dataObj['G_Image_url'] 	= image;

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
