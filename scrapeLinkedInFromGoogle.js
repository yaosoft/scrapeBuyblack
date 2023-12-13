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
                    dataObj['Contact']  = '';
                    dataObj['Title']    = '';
                    dataObj['LinkedIn'] ='';
                    dataObj['Error'] = err.message;
                    dataObj['name_title_company'] = '';
                    await resolve(dataObj);
                }); // open item website contact page
            await new Promise(r => setTimeout(r, 3000));
            
            var linkedIn    = '';
            var email       = '';
            var name        = '';
            var title       = '';
            var name_title_company = '';
// await googlePage.screenshot({ path: 'screenshotFacebook.png', fullPage : false });

            try{
                await googlePage.waitForSelector('body', { timeout: 60000 });

                const linkedInX = "//span[text()='LinkedIn']/ancestor::a";
                const name_title_companyX = "//span[text()='LinkedIn']/ancestor::a/h3";
                
                // name-title-company
                const name_title_companys = await googlePage.$x(name_title_companyX);
                name_title_company  = await googlePage.evaluate(
                                                h3 => h3.textContent, name_title_companys[0]
                                            );
                if( name_title_company != null ){
                    name    = name_title_company.split( ' - ' )[0];
                    title   = name_title_company.split( ' - ' )[1];
                }

                // LinkedIn
                const linkedIns = await googlePage.$x(linkedInX);
                linkedIn = await googlePage.evaluate( linkedIn => linkedIn.href, linkedIns[0] );
            }
            catch(err){
                dataObj['Error'] = err.message;
                name        = '';
                title       = ''; 
                linkedIn    = ''; 
            }
            finally{
                dataObj['Contact']  = name != null ? name : '';
                dataObj['Title']    = title != null ? title : '';
                dataObj['LinkedIn'] = linkedIn != null ? linkedIn : '';
                dataObj['name_title_company'] = name_title_company;
                await resolve(dataObj);
            }
        });

        // Linkedin Square Renovation proprietaire gerant maitre d'oeuvre manager cordinateur président
        const titles = 'President OR Executive President OR Director OR Senior Director OR Manager OR Middle Manager OR Senior Vice President OR Assistant Vice President OR Associate Vice President OR CEO OR Chief Executive Officer OR COO OR Chief Operating Officer OR CTO OR Chief Technology Officer OR CFO OR Chief Financial Officer'
        const query = 'LinkedIn.com ' + company + ' ' + titles;
        const toReturn = await googlePagePromise(query);
        
        return toReturn;
    }
}
const outputData = await websiteInfo.getData();

await googlePage.close();
await browser.close();

console.log(JSON.stringify(outputData))  // print out data to STDOUT