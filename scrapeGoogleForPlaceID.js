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

const name = inputData.company_name;
const country = inputData.company_country;
// const link = "https://www.google.com/search?q=" + name + "+" + country;
const link = "https://www.google.com/search?q=" + name;
console.error('Google link: ' + link);
// const ID = inputData.ID;

// read the file content from itemHTMLFile
const getData = async () => {
    // 
    var dataObj = {};
    // Get Item page HTML page url

    var itemPromise = () => new Promise(async (resolve, reject) => {
        // Load html page

        // set page's browser client
        const agents = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, likae Gecko) Chrome/112.0.0.0 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"];
        // import randomUseragent from 'random-useragent';
        // set request interception
        var randomAgents = agents[Math.floor(Math.random() * agents.length)];
        // const randomAgents = randomUseragent.getRandom(); // gets a random user agent string
        await itemPage.setUserAgent(randomAgents);
        
        // Open the item's google search page
		try{
			await itemPage.goto( link, { timeout: 10000 });
		}
		catch(err){
			console.log( 'Unable to open ' + link )
		}

        // Click on the item.s link if needed
        const headerX = "//h2[ contains( @data-attrid, 'title' ) ]//span"; 
        try{
            await itemPage.waitForXPath( headerX );
            const headerElts = await itemPage.$x( headerX );
            const h2 = await itemPage.evaluate( h2 => h2.textContent, headerElts[0] );
            console.error( 'H2: ' + h2 );
        }
        catch(err){
            const itemButtonX = "//span[ contains( ., '" + name + "' ) ]//ancestor::a";
console.error( 'itemButtonX: ' + itemButtonX );
            try{
                await itemPage.waitForXPath( itemButtonX );
                const itemButtons = await itemPage.$x( itemButtonX );
                await itemPage.evaluate( btn => btn.click(), itemButtons[0] );
                console.error( 'Company button clicked on Google.com' );
            }
            catch( err ){
                console.error( 'No company button to click, this company should be unique on Google: ' );
                console.error( err.message );
            }
        }
        // Try the company module
        try{
            await itemPage.waitForXPath( headerX );
            const headerElts = await itemPage.$x( headerX );
            const h2 = await itemPage.evaluate( h2 => h2.textContent, headerElts[0] );
            console.error( 'H2: ' + h2 );
        }
        catch(err){
            console.error( '!!!!!!! COMPANY NOT FOUND ON GOOGLE !!' );
            await resolve(dataObj);
			return dataObj;
        }
        
        // get the data
        // await itemPage.waitForXPath( '//title' );
        await new Promise(r => setTimeout(r, 5000));
        
		var allItems 	= '';
		var licount 	= '';
		try {

			// Place ID
			//const placeIdX 	= "//div[contains( @class, 'kp-header' )]/following-sibling::div[2]/div/div/div/div/div/following-sibling::div[7]/div/div/div/div/following-sibling::div/div/div/div/div/div//a"; 
			
			const placeIdX = "//div[ @data-hveid ]//a[ @data-pid ]";
			
			var placeId = ''; 
			try {
				await itemPage.waitForXPath( placeIdX, { timeout: 30000 } );
                const els = await itemPage.$x( placeIdX );
				placeId = await itemPage.evaluate( el => el.getAttribute( 'data-pid' ), els[0] )
			}
			catch (err) {
				console.error('-! Google placeId issue: ' + err.message);
console.error('err: ' + err);
			}
			if( !placeId )
				throw( 'No place ID found' )

			// Item name
			const nameX  = "//h2/span";       
			var itemName = '';
			try {
				const els = await itemPage.$x(nameX);
				await itemPage.waitForXPath( nameX, {timeout:15000} );
				itemName = await itemPage.evaluate(el => el.textContent, els[0] )
			}
			catch (err) {
				console.error('-! Google map Item Name issue: ' + err.message);
console.error('err: ' + err);
				itemName = '';
			}

			// Item address
			const addressX = "//div[ contains( @data-attrid,  'address') ]//div/span/following-sibling::span";       
			var address = '';
			try {
				const els = await itemPage.$x(addressX);
				await itemPage.waitForXPath( addressX, {timeout:15000} );
				address = await itemPage.evaluate(el => el.textContent, els[0] )
			}
			catch (err) {
				console.error('-! Google map Item Address issue: ' + err.message);
console.error('err: ' + err);
				address = '';
			}

			// Website
			const websiteX = "//div[contains( @class, 'kp-header' )]/following-sibling::div[2]/preceding-sibling::div/div/following-sibling::div/div//a";
			var website = '';
			try {
				await itemPage.waitForXPath(websiteX, { timeout: 10000 });
				const els = await itemPage.$x(websiteX);
				website = await itemPage.evaluate(el => el.href, els[0])
			}
			catch (err) {
				console.error('-! Google map Website issue');
console.error('err: ' + err);
				website = '';
			}
console.error('website :----------> ' + website);   
			// Phone
			var phone = '';
			const phoneX = "//div[contains( @data-attrid, 'phone' )] //span/following-sibling::span//a/span";
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
            // const aboutX = "//div[contains( @class, 'kp-header' )]/following-sibling::div[2]/div/div/div/div/div/following-sibling::div[4]//span/following-sibling::span/following-sibling::div/span/following-sibling::span//a";
			const aboutX = "//div[contains( @class, 'kp-header' )]/div/following-sibling::div/div/following-sibling::div[2]//span";
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
            var services = '';
            // const servicesX = "//div[ contains( @role, 'presentation' ) ]/following-sibling::div/button/div/following-sibling::div/div/div/div";
			const servicesX = "//div[ contains( @data-attrid, 'business_availability_modes') ]//div";
            try {
                await itemPage.waitForXPath(servicesX, { timeout: 10000 });
                const els = await itemPage.$x(servicesX);
                services = await itemPage.evaluate(el => el.textContent, els[0])
            }
            catch (err) {
                console.error('-! Service issue');
console.error('err: ' + err);
                services = '';
            }
			
			// Operating hours
            var hours  	= '';
			// const hoursX 	= "//div[contains( @class, 'kp-header' )]/following-sibling::div[2]/div/div/div/div/div/div/div/div/div/div/div/following-sibling::div[7]//span/following-sibling::div/div/following-sibling::div/div/table/tbody/tr";
			const hoursX 	= "//div[ contains( @jscontroller, 'pttite') ]//tr";
			// const hoursBtnX	= "//div[contains( @class, 'kp-header' )]/following-sibling::div[2]/div/div/div/div/div/div/div/div/div/div/div/following-sibling::div[7]//span/following-sibling::div";
			const hoursBtnX	= "//div[ contains( @jscontroller, 'pttite') ]";
			try{
				// click
				const elem = await itemPage.$x( hoursBtnX, { timeout:15000 } );
				await itemPage.evaluate( button => button.click(), elem[0] );
				// elem[0].hover();
			    // elem[0].click();
console.error( 'Hours clicked' );

				// scrape
                await itemPage.waitForXPath(hoursX, { timeout:15000 } );
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
            const imageBtnX = "//div[contains( @class, 'kp-header' )]//img";
			const imageX = "//scrolling-carousel//span[ contains( @aria-live, 'polite' ) ]//img";
			const imageBtnCloseX = "//button[ contains( @data-mdc-dialog-action, 'close' ) ]";
            try {
                await itemPage.waitForXPath( imageBtnX, { timeout: 10000 } );
                const els = await itemPage.$x( imageBtnX );
                // open image
				await itemPage.evaluate( button => button.click(), els[0] );
				// get Images
                await itemPage.waitForXPath( imageX, { timeout: 10000 } );
				const els02 = await itemPage.$x( imageX );
				image = await itemPage.evaluate( el => el.src, els02[0] )
				// close the image modal
				const els03 = await itemPage.$x( imageBtnCloseX );
				await itemPage.evaluate( button => button.click(), els03[0] );
console.error( 'Close btn clicked for image modal ' );
            }
            catch (err) {
                console.error('-! image issue');
console.error('err: ' + err);
                image = '';
            }

			// Events
			const events  	= '';
			const eventX 	= "//div[contains( @class, 'kp-header' )]/following-sibling::div[2]/div/div/div/div/div/following-sibling::div[2]//div[ contains( @role, 'listitem') ]//a/div";
			try{
				// scrape
                await itemPage.waitForXPath(eventX, { timeout:15000 } );
                allItems = await itemPage.$x(eventX);
                licount = await itemPage.evaluate(allItems => allItems.length, allItems);
                var sep = '^^^'; // separator
                for( var i = 0; i < licount; i++ ){
                    if( i == licount - 1 )
                        sep = '';
                    events += await itemPage.evaluate( elt => elt.textContent, allItems[i] ) + sep;
                }
            }
            catch (err) {
                console.error( 'Event ' + err.message );
            }

            // Collect
			dataObj['G_PlaceID'] 	= placeId;
            dataObj['G_Name']		= itemName;
            dataObj['G_About'] 		= about;
            dataObj['G_Website'] 	= website;
            dataObj['G_Phone'] 		= phone;
            dataObj['G_Address'] 	= address;
            dataObj['G_Hours'] 		= hours;
            dataObj['G_Services'] 	= services;
            dataObj['G_Events'] 	= events;
            dataObj['G_Image_url'] 	= image;

// console.error( 'Address: ' + dataObj['Address'] );  

            await resolve(dataObj);
		}
		catch (err){
			console.error( '-! Google data issue: ' + err )
		}
		finally{
			await resolve( dataObj );
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
