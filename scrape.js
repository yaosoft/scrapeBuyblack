import { spawn } from 'child_process';
import path from 'path';
import fs from "fs";
import request from 'request';

// import { scrapePeopleFromItemWebsite_dev } from './scrapePeopleFromItemWebsite_dev.js'; 
// import util from 'util';
// import { myBrowser } from "./browser.js";
// import { Objects } from './objects_array.js';
// import { USAStatesCode } from './USAStatesCode.js';
// console.log(inputData.url);  // print out data to STDOUT

const scrapeData = {

    async scraping( page, country ) {
        

        var allScrapedData = [];
        // const allItemsX = "//div[@data-test-id = 'cat-header']/following-sibling::div/following-sibling::div//div[@role='listitem']";
        // const allItemsX = "/html/body/div[5]/div/div[10]/div[1]/div/div/div/div/div/div/div/div/div/div/div/div[1]/div[3]/div/div/div/div/a";
        //const allItemsX = "//div[contains(@class, 'rl_full-list')]//a/ancestor::div[contains(@class, 'cXedhc')]/a[2]";
        var allItemsX = "//h3[ contains( ., 'Search Results' ) ]/following-sibling::div[2]/button";

        try{
            await page.waitForXPath( allItemsX, {timeout:30000} );
        }
        catch( err ){
            return allScrapedData; // 
        }

// console.log( 'allItemsX ' + allItemsX );
     
        const allItems = await page.$x( allItemsX );
        var items_loaded = await page.evaluate(allItems => allItems.length, allItems );
        // var items_loaded = await page.$$eval(all_items_selector, (items) => items.length);   // the number or items loaded after a click
        // items_loaded = items_loaded - 3;
        var total_items_loaded = items_loaded;   // await page.$$eval(all_items_selector, (items) => items.length);   // the number or items loaded variable of the total number of items currenly present
console.log(total_items_loaded);
        const page_total = 20;        // the last pages if next button exixts
        const page_first =  0;         // first page to start crawling with
        const page_last = page_total; // page_total -1;   // the last page to scrap
        // var page_counter = 0;

        const item_first = 0;           // first item to start crawling with
        const item_last  = items_loaded - 1;  // last item to stop crawling for a page

        var page_current  = 0;
        var retry01       = 0;
        const max_retry01 = 10;
        const max_retry02 = 5;
        const max_retry03 = 3;
        const max_retry04 = 10;     // Next button
        
        var indices = {};
        var itemIndices = {};
        itemIndices['firstItemIndice'] = item_first;
        itemIndices['lastItemIndice'] = item_last;
        var comparator = 0;
        var startSkiping = 0;

        const proxyIP = '184.169.231.206';
        const proxyPort = '3000';
        // const proxyServer = 'http://' + proxyIP + ':' + proxyPort;
        const proxyServer = '';

        const __dirname = path.resolve();

        async function runPupeteer(data) {
            const jsonData = JSON.stringify(data)
            const b64Data = Buffer.from(jsonData).toString('base64');
            let stdoutData = '';
            return await new Promise((resolve) => {
                const proc = spawn('node', [
                    path.resolve(__dirname, data.puWorker),
                    `--input-data${b64Data}`,
                    '--tagprocess'
                ], { shell: false });
                proc.stdout.on('data', (data) => {
                    stdoutData += data;
                });
                proc.stderr.on('data', (data) => {
                    console.error(`NodeERR: ${data}`);
                });
                proc.on('close', async (code) => {
                });
                proc.on('exit', function () {
                    proc.kill();
                    resolve(JSON.parse(stdoutData));
                });
            });
        }

        async function scrapeCurrentPage() {
            
            // Click next
            async function clickNext() {
                // await page.bringToFront();
// await page.screenshot({ path: 'screenshot02.png', fullPage: true });
                
                var nextPageButtonX = "//a/*[local-name()='svg']//ancestor::ul/li[ 3 ]"; 
                
                let nextButtonExist = false;
                try {
                    // const nextButton = await page.$eval(nextPageButtonSelector, button => button);
                    // nextButtonExist = true;
                    const nextButton = await page.waitForXPath( nextPageButtonX );
                    nextButtonExist = true;
                }
                catch (err) {
                    console.log(err.message);
                    nextButtonExist = false;
                }
                if (nextButtonExist) {
                    try{

                        // scrool
                        const elem = await page.$x( nextPageButtonX );
                        await page.evaluate( button => button.click(), elem[ elem.length - 1 ] );

                        // await new Promise(r => setTimeout(r, 20000));
                    }
                    catch(err){
                        console.log('> Next clicked: ' + err)
                    }
                }
                else {
                    console.log('> This is the last page.')
                    return false;
                }
            }
            // click to reach the page to scrape
            if (page_current < page_first) {
                comparator = page_first;
                startSkiping = 0;

            }
            else if (page_current >= page_first) {
                if (page_current == 0) {
                    startSkiping = comparator + 1; // no skiping
                    page_current++; // unique case where page_current++ outside the click loop
                }
                else {
                    comparator = page_current + 1;     // one skiping
                    startSkiping = page_current;
                }
            }

// console.log('comparator: ' + comparator + ', startSkiping: ' + startSkiping + ', page_first: ' + page_first + ', page_current: ' + page_current)
            for (var j = startSkiping; j < comparator; j++) { // click loop
                
                const next = await clickNext(); 
                if( next === false )
                    return true;
                
                await new Promise(r => setTimeout(r, 30000)); // loading left zone items
                
                await page.waitForXPath( allItemsX, {timeout:120000} );
                
                // allItems = await page.$x(allItemsX);
                total_items_loaded = await page.evaluate(allItems => allItems.length, allItems);
                // let prev_total_items_loaded = total_items_loaded; // store the previous total loaded value
                //total_items_loaded = await page.waitForSelector(all_items_selector, { timeout: 120000 })
                //.then(async () => {
                //     var toreturn = await page.$$eval(all_items_selector, (items) => { // count loaded and previous
                //        return items.length;
                //    });
                //    return toreturn;

                //});

console.log('>> Page ' + j + ' skiped.');
console.log('total_items_loaded: ' + total_items_loaded );

                //page_counter++;     // count skiped pages
                page_current++;

                // count loaded datas
                // let toCheck = prev_total_items_loaded + 1; // at least one new ittem
                // console.log('toCheck: ' + toCheck);

                // next first and last item indices
                //itemIndices['firstItemIndice'] = itemIndices.firstItemIndice + items_loaded;   // The new first indice
                //itemIndices['lastItemIndice'] = itemIndices.lastItemIndice + items_loaded;   // The new first indice          // The new last indice
                itemIndices['firstItemIndice'] = 0;   // The new first indice
                itemIndices['lastItemIndice'] = total_items_loaded-1;   // The new first indice  

                if ( itemIndices.lastItemIndice > items_loaded )
                    itemIndices['lastItemIndice'] = total_items_loaded - 1;

                    // The new last indice

            }

            // scrape
            async function scrape_from_list( itemIndice ){
                var dataObj = {};
				await new Promise(r => setTimeout(r, 10000));

                return new Promise(async ( resolve, reject ) => {
                    
                    await page.waitForXPath( allItemsX, {timeout:30000} );
                    var cardElements = await page.$x( allItemsX );
                    
					// Click to open company page
					const elts = await itemPage.$x( allItemsX );
					await itemPage.evaluate( elt => elt.click(), elts[ itemIndice ] ); // open the pop up
					
                    // company name
                    const companyNameX = "//div/div/h5/following-sibling::h1";
					var companyName = '';
					try{
						await page.waitForXPath( companyNameX, { timeout: 10000 } );
						const els = await page.$x( companyNameX );
						companyName = await page.evaluate( el => el.textContent, els[0] )
					}
					catch (err) {
						console.error('-! companyName issue');
						console.error('err: ' + err);
					}
					
					// company category
                    const categoryX = "//div/div/h5";
					var category = '';
					try{
						await page.waitForXPath( categoryX, { timeout: 10000 } );
						const els = await page.$x( categoryX );
						category = await page.evaluate(el => el.textContent, els[0])
					}
					catch (err) {
						console.error('-! category issue');
						console.error('err: ' + err);
					}
					
					// company description
                    const descriptionX = "//div/following-sibling::div/div/p";
					var description = '';
					try{
						await page.waitForXPath( descriptionX, { timeout: 10000 } );
						const els = await page.$x( descriptionX );
						description = await page.evaluate(el => el.textContent, els[0])
					}
					catch (err) {
						console.error('-! Description issue');
						console.error('err: ' + err);
					}
					
					// company services
                    const servicesX = "//h3//following-sibling::div//div";
					const services = '';
					try{
						await itemPage.waitForXPath(servicesX, {timeout:6000});
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
//              			console.log('Services error ' + err.message);
							dataObj['Services'] = '';
					}
console.log('companyName: ' + companyName );
					
					// Collection
					dataObj[ 'CompanyName' ] 	= companyName;
					dataObj[ 'Category' ] 		= category;
					dataObj[ 'Services' ] 		= services;
					// back on the listing page
					await page.goBack();
					
					
                    resolve( dataObj );

                })
            }

            
            // generate a file name for downloaded photos
            async function makeid(length) {
                let result = '';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const charactersLength = characters.length;
                let counter = 0;
                while (counter < length) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                    counter += 1;
                }
                return result;
            }
            
console.log( '' );
console.log(itemIndices);

            // scrape current page
            for (var i = itemIndices.firstItemIndice; i <= itemIndices.lastItemIndice; i++) {
console.log( '' );
console.log( 'Page: ' + page_current + ', item: ' + i );
console.log( '' );

                // Get data from the list page
                const data01 =  await scrape_from_list( i );
                const company_name = data01.CompanyName;

                if( !company_name ){
console.log( '!!!! No Company name! Skiping !!!' );  
                    continue;
                }

                // Place ID 
				// const country = country;
				const puWorkerItem06 = 'scrapeGoogleForPlaceID.js';
                const puDataItem06 = {
                    puWorker: puWorkerItem06,  // puppeteer actions file
                    company_name: company_name,
					company_country: country,
                }
                const data06  =  await runPupeteer( puDataItem06 );			
                if( !data06.G_PlaceID ){
console.log(  '!!! No placeID found !!!' );   
                    continue;
                }
console.log( 'data06 ' );
console.log(  data06 );

                // scrap linkedIn via google to get owner name
                const puWorkerItem03 = 'scrapeLinkedInFromGoogle.js';
console.log( 'Company name: ' );
console.log( company_name );                
                const puDataItem03 = {
                    puWorker: puWorkerItem03,  // puppeteer actions file
                    company: company_name,
                }
                const data03 = await runPupeteer( puDataItem03 );
                
                // Scrape item website and get email and phone from website
                const puWorkerItem04 = 'scrapeItemWebsite.js';
                const company_link = data06.G_Website;
console.log( company_link );                
                const puDataItem04 = {
                    puWorker: puWorkerItem04,  // puppeteer actions file
                    company_link: company_link,
                }
                var data04 = {};
                if( data06.G_Website && !data06.G_Website.includes( 'google.com' ) ) // default google site not need
				    data04 = await runPupeteer( puDataItem04 );

				//  download_photo (photo)
				async function download_photo (uri, filename, callback) {
					try{
						request.head(uri, function (err, res, body) {
							// console.log('content-type:', res.headers['content-type']);
							//console.log('content-length:', res.headers['content-length']);
							request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
						});
						return true;
					}
					catch(err){
console.log('Download Error: ' + err.message );
						return false;              
					}
				};

                // Get item's Facebook's link and email address via google
                const puWorkerItem05 = 'scrapeFacebookFromGoogle.js';
                const puDataItem05 = {
                    puWorker: puWorkerItem05,  // puppeteer actions file
                    // website: data01.Website,
                    // people: data02,
                    company: company_name, // 'Sydney Chiropractic Care',
                    country: country,
                }
                const data05 = await runPupeteer(puDataItem05);
//console.log('data05');
//console.log(data05);

				

                // output
                const scrapedData = {};
                scrapedData['Company']  = company_name;
                // scrapedData['Phone']    = data02.Phone;
                // scrapedData['Address']  = data02.Address;
                // scrapedData['Website']  = data01.Website;
                // scrapedData['About']    = data02.About;
                scrapedData['Services'] = 	data01.Services;
                // scrapedData['Hours']     	= data02.Hours;
                scrapedData['LinkedIn'] 		= data03.LinkedIn;
                scrapedData['Contact'] 		= data03.Contact;
                scrapedData['Title'] 		= data03.Title;

                scrapedData['Email']    		= ( data04.Email ) ? data04.Email : '';
                scrapedData['FacebookEmail']    = data05.Email;
                scrapedData['FacebookLink']     = data05.Link;
				scrapedData['Category']     = data01.Category;
                scrapedData['Country'] 		= 'United States';
				// scrapedData['Image']		= data02.Image;
				scrapedData['G_Name'] 		= ( data06.G_Name ) ? data06.G_Name : '';
				scrapedData['G_PlaceID']	= ( data06.G_PlaceID ) ? data06.G_PlaceID : '';
				scrapedData['G_About'] 		= ( data06.G_About ) ? data06.G_About : '';
				scrapedData['G_Website'] 	= ( data06.G_Website ) ? data06.G_Website : '';
				scrapedData['G_Phone'] 		= ( data06.G_Phone ) ? data06.G_Phone : '';
				scrapedData['G_Address'] 	= ( data06.G_Address ) ? data06.G_Address : '';
				scrapedData['G_Hours'] 		= ( data06.G_Hours ) ? data06.G_Hours : '';
				scrapedData['G_Services'] 	= ( data06.G_Services ) ? data06.G_Services : '';
				scrapedData['G_Events'] 	= ( data06.G_Events ) ? data06.G_Events : '';
				
				// download an item's image
// console.log( 'G Image_url: ' + data06.G_Image_url ); 
                data06['Image'] =  '';
                if ( data06.G_Image_url ){
                    const photo_url = data06.G_Image_url;
                    const filenameid = await makeid( 14 );
                    const photo_filename = 'photos/' + filenameid + '.jpg';
                    const photo_name = filenameid + '.jpg';

                    // photo to download URL
                    const downloaded = await download_photo( photo_url, photo_filename, function () {
                        // console.log('photo ' + photo_url + ' downloaded!');
                    });

                    // save downloaded photos URI
					if( downloaded )
						data06['Image'] = photo_filename;
                }
				scrapedData['G_Image'] 	= data06['Image'];
				scrapedData['PlaceID'] 	= ( data06.G_PlaceID ) ? data06.G_PlaceID : '';
				
                // save data
                await allScrapedData.push( scrapedData );

console.log('scrapedData');
console.log(scrapedData);
console.log( '' );
console.log( '' ); 
                
            }
            // save scraped data into file
            let fileName = "./records/" + country + '_' + category +  "_page" + page_current + ".json";
            async function save_file() {
                fs.writeFile(fileName, JSON.stringify(allScrapedData), 'utf8', function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("Page " + page_current + " ** scraped data successfully saved. View it at " + fileName);
                });
                return true;
            }
            await save_file();
            // Update page counters
            // page_counter = 0;

            // exit if the last page is reached
            if ( page_current == page_last ) {
console.log('----- The link is craped ! -----');
console.log( '' );
console.log( '' );
                // console.log( allScrapedData );
                // return allScrapedData; 
                
                return true;      // The exit
            }

            await scrapeCurrentPage();

        }

// console.log( 'rep++++' );
// console.log( allScrapedData );
        await scrapeCurrentPage();
        return allScrapedData; // 
    }
}
export { scrapeData };
