const scraperObject = {
    url: 'https://www.sortlist.nl/search?query=%5B%7B%22name%22%3A%22performance+marketing%22%7D%5D&prospects=%7B%22address%22%3A%22Nederland%22%2C%22polygon%22%3A%5B%5B%5B7.227140500000001%2C53.6756%5D%2C%5B7.227140500000001%2C50.7503837%5D%2C%5B3.3316%2C50.7503837%5D%2C%5B3.3316%2C53.6756%5D%2C%5B7.227140500000001%2C53.6756%5D%5D%5D%2C%22iso31661%22%3A%22NL%22%7D',
    async scraper( browser ){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        
        // Navigate to the selected page
        await page.goto( this.url );
        
        // get all items
        var item_selector = "a.m-8.flex-none.layout-column.overflow-hidden.border.border-secondary-200.rounded-lg.bg-neutral-100 .shadow-3-secondary-500.text-secondary-900.cursor-pointer.css-xd95oi.epq2prb2";
        var item_title_selector     =  "a.h5.bold.text-secondary-900";
        var item_employee_selector  = "[ data-testid = 'PeopleAltTwoToneIcon' ] a'"; 
        var item_website_selector   = "[ data-testid = 'PublicTwoToneIcon' ] a'";
        var item_address01_selector = ".small .layout-column .py-8 .px-12 .rounded-sm .span.bold";
        var item_address02_selector = ".small .layout-column .py-8 .px-12 .rounded-sm .span.text-break-word";
        var arr = [];
        var obj = {};
        let item_datas = await page.$$eval( item_selector, links => {
            for( var i = 0; i < links.lenght; i++ ){
                obj.item_title      = link.querySelector( item_title_selector ).textContent;
                obj.item_employee   = link.querySelector( item_employee_selector ).textContent;
                
                let item_page       = await page.click( item_selector );
                
                obj.item_website    = item_page.querySelector( item_website_selector ).textContent;
                obj.item_address01  = item_page.querySelector( item_address01_selector ).textContent;
                obj.item_address02  = item_page.querySelector( item_address02_selector ).textContent;
                // Get phone and email
                arr.push( obj )
            }
            return arr;
        });

        // Get 
        async function scrapeCurrentPage(){
            // await page.waitForSelector('.page_inner');
            // crypto currrency pages url
            //var link_selector = "[ data-target = 'currencies.contentBox' ] td.coin-name > div div.tw-flex-auto a";
            //let urls = await page.$$eval( link_selector, links => {
            //    links = links.map( el => el.href )
            //    return links;
            //});
            
            // Loop through each of those links, open a new page instance and get the relevant data from them
            let pagePromise = (link) => new Promise(async(resolve, reject) => {
                let newPage = await browser.newPage();
                await newPage.goto( link );
 console.log( "link: " + link );
                
                // crypto currrency name
                var title_selector = "div.row.mr-0 h2";
                await newPage.waitForSelector( title_selector );
                var title = await newPage.$eval( title_selector, text => text.textContent );
console.log( title );

                // crypto currrency datas
                var datas_selector = "[ data-target = 'gecko-table.paginatedShowMoreTbody' ] tr"; 
                // await newPage.waitForSelector( datas_selector );
                
                item_info.email = "Email";
                item_info.phone = "phone";
            
                // return crypto_currrency_datas;
                resolve( item_info );
                await newPage.close();
            });
            
            var count       = 0;
            
            var scrapedData = [];
            for( data in item_datas ){
                let currentPageData = await pagePromise( data[ 'item_website' ] );

                data.telephone   = currentPageData[ "telephone" ];
                data.website     = currentPageData[ "website" ];
                data.email       = currentPageData[ "email" ];

                scrapedData.push( data );
                count++;
                if( count > 2 )
                    break;
            }
            await page.close();
            return scrapedData;
        }
        
        var data = await scrapeCurrentPage();
console.log( data );

         return data;
     
    }
}

module.exports = scraperObject;
