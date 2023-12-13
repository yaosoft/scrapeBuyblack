// WARNING: don't use console.log here for debug, use console.error instead. STDOUT is used to deliver output data

import { myBrowser } from "./browser.js";

// find value of input process argument with --input-data
const inpDataB64 = process.argv.find((a) => a.startsWith('--input-data')).replace('--input-data', '')
const inputData = await JSON.parse(Buffer.from(inpDataB64, 'base64').toString())

// console.log(inputData.url);  // print out data to STDOUT
const proxyIP = '184.169.231.206';
const proxyPort = '3000';
// const proxyServer = 'http://' + proxyIP + ':' + proxyPort;
const proxyServer = '';

const browser = await myBrowser.start(proxyServer);
const googlePage = await browser.newPage();

// const people = inputData.people;
const company = inputData.company;

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

const websiteInfo = {
    async getData() {
        const dataObj = {};
        const agents = ["Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36, Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36, Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36, Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"];
        // visit item website and get email address

        const googlePagePromise = (query) => new Promise(async (resolve, reject) => {
            // website
            // let googlePage = await browser.newPage();
            let randomAgents = agents[Math.floor(Math.random() * agents.length)];
            await googlePage.setUserAgent(randomAgents);

            // Go to google with the LinkedIn query
            await googlePage.setViewport({ width: 1366, height: 1080 });
            const url = "https://www.google.com/search?q=" + query + "";
            await googlePage.goto(url, { timeout: 60000 })
                .catch(async (err) => {
                    dataObj['Email']    = email != null ? email : '';
                    dataObj['Link']     = link != null ? link : '';
                    dataObj['Error']    = err.message;
                    resolve( dataObj );
                }); // open item website contact page
            await new Promise(r => setTimeout(r, 3000));
            
            var link = '';
            var email = '';
            
// await googlePage.screenshot({ path: 'screenshotFacebook.png', fullPage : false });

            try{
                await googlePage.waitForSelector('body', { timeout: 60000 });

                const linkX = "//span[contains(.,'Facebook')]/../../../../../following-sibling::div//span[contains( ., '@' )]//em/../../../../..//a";
                const emailX = "//span[contains(.,'Facebook')]/../../../../../following-sibling::div//span[contains( ., '@' )]";
                var string = "Francesco Renga <francesco_renga-001@gmail.com>"; // Your string containing
                const regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/; // The actual regex

                // email
                const emails = await googlePage.$x(emailX);
                const email_ = await googlePage.evaluate(email => email.textContent, emails[0]);
                const matches = await regex.exec( email_ );
                email = matches[1];
                
                // link
                if ( email != null && email.includes( '@' ) ){
                    const links = await googlePage.$x(linkX);
                    link = await googlePage.evaluate(link => link.href, links[0]);
                }                   
            }
            catch(err){
                dataObj['Error'] = err.message;
                email = '';
                link  = '';
            }
            finally{
                dataObj['Email']    = email != null ? email : '';
                dataObj['Link']     = link != null ? link : '';
                await resolve(dataObj);
            }
        });

        const query = 'Facebook ' + company + ' email @';
        const toReturn = await googlePagePromise(query);
        
        return toReturn;
    }
}
const outputData = await websiteInfo.getData();

await googlePage.close();
await browser.close();

console.log(JSON.stringify(outputData))  // print out data to STDOUT