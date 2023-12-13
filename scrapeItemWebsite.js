// WARNING: don't use console.log here for debug, use console.error instead. STDOUT is used to deliver output data

import { myBrowser } from "./browser.js";

// find value of input process argument with --input-data
const inpDataB64 = process.argv.find((a) => a.startsWith('--input-data')).replace('--input-data', '')
const inputData = await JSON.parse(Buffer.from(inpDataB64, 'base64').toString())

// console.log(inputData.url);  // print out data to STDOUT
const proxyIP = '184.169.231.206';
const proxyPort = '3000';
// const proxyServer = 'http://' + proxyIP + ':' + proxyPort;
const proxyServer ='';
const browser = await myBrowser.start(proxyServer);
const websitePage = await browser.newPage();
await websitePage.setRequestInterception(true);
await websitePage.on('request', (req) => {
    if (
        req.resourceType() === 'image' ||
            req.resourceType() == 'stylesheet' ||
            req.resourceType() == 'font'
    ){
        req.abort();
    }
    else {
        req.continue();
    }
});
// user agent
const agents = ["Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36, Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36, Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36, Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"];
let randomAgents = agents[Math.floor(Math.random() * agents.length)];
await websitePage.setUserAgent(randomAgents);
// view port
// await websitePage.setViewport({ width: 1366, height: 1080 });

// goto wesites contact page abd grab infos
const website_url = inputData.company_link;
const url_contact_pages = [ '', 'boka', 'kontakt' ];
const websiteInfo = {
    async getData(website_url) {
        var dataObj = {};
        
        // visit item website and get email address
        var email = '';
        var telephone = '';
        var contact_page_datas = {};
        let pageContactPromise = (website_url) => new Promise(async (resolve, reject) => {
            // open website
            
            // verify URL prefix
            if (!/^https?:\/\//i.test(website_url)) {
                website_url = 'http://' + website_url;
            }
            // Go to item website
            
            await websitePage.goto(website_url, { timeout: 30000 })
                .catch(async (err) => {
// console.log('Error with on of item\'s contact page URL: ' + err);
                    contact_page_datas['Email'] = email;
                    contact_page_datas['Telephone'] = telephone;
                    contact_page_datas['error'] = err.message;
                    resolve(contact_page_datas);
                    return;
                }); // open item website contact page
            await websitePage.waitForSelector('title', { timeout: 30000 }).then(async () => {
                let divs_contacts = await websitePage.$$eval('div', async (divs, email, telephone) => {
                    // validate phone number and returns the cleanest number possible
                    const validationPhone = (phone) => {
                        phone = phone.replace('tel:', '');
                        // phone   = phone.replace( 'from:', '' );
                        var re = /^(\d|\+)[0-9\.\–\-\s\(\)]+$/;
                        var rep = re.test(phone);
                        if (rep)
                            return phone;
                        else
                            return '';
                    };

                    // validate email and returns the cleanest email possible
                    const validationEmail = (email) => {
                        email = email.replace('mailto:', '');
                        // email   = email.replace( 'from:', '' );
                        var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/;
                        var rep = re.test(email);
                        if (rep)
                            return email;
                        else
                            return '';
                    };

                    for (var i = 0; i < divs.length; i++) {
                        // Search in 'a' href
                        let as = await divs[i].querySelectorAll('a');

                        var returnPhone = '';
                        for (var j = 0; j < as.length; j++) {
                            let text = as[j].href.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                            // returnPhone += text + ' - ';

                            if (text.indexOf('@') > -1) {
                                let result = validationEmail(text);
                                if (result) {
                                    if (email == '')
                                        email = result;
                                }
                            }

                            // text = '+32 11 54 31 47';
                            if (text.length < 30 && text.length > 10) {
                                let result = validationPhone(text);
                                if (result) {
                                    if (telephone == '')
                                        telephone = result;
                                }
                            }
                            else if (text.indexOf('tel:') > -1) {
                                let result = validationPhone(text);
                                if (result) {
                                    if (telephone == '')
                                        telephone = result;
                                }
                            }
                        }
                        if (email != '' && telephone != '') {
                            let to_return = {};

                            to_return['Telephone'] = telephone;
                            to_return['Email'] = email;

                            return to_return;
                        }

                        // search in 'a' textContent
                        for (var j = 0; j < as.length; j++) {

                            let text = as[j].textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                            returnPhone += text + ' - ';

                            if (text.indexOf('@') > -1) {
                                let result = validationEmail(text);
                                if (result) {
                                    if (email == '')
                                        email = result;
                                }
                            }

                            // text = '+32 11 54 31 47';
                            if (text.length < 30 && text.length > 10) {
                                let result = validationPhone(text);
                                if (result) {
                                    if (telephone == '')
                                        telephone = result;
                                }
                            }
                            else if (text.indexOf('tel:') > -1) {
                                let result = validationPhone(text);
                                if (result) {
                                    if (telephone == '')
                                        telephone = result;
                                }
                            }
                        }
                        if (email != '' && telephone != '') {
                            let to_return = {};

                            to_return['Telephone'] = telephone;
                            to_return['Email'] = email;

                            return to_return;
                        }

                        // search in 'span'
                        let spans = await divs[i].querySelectorAll('span');
                        if (spans.length) {
                            for (var j = 0; j < spans.length; j++) {
                                let text = spans[j].innerHTML.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                                if (text.indexOf('@') > -1) {
                                    let result = validationEmail(text);
                                    if (result) {
                                        if (email == '')
                                            email = result;
                                    }
                                }

                                if (text.length < 30 && text.length > 10) {
                                    let result = validationPhone(text);
                                    if (result) {
                                        if (telephone == '')
                                            telephone = result;
                                    }
                                }
                                else if (text.indexOf('tel:') > -1) {
                                    let result = validationPhone(text);
                                    if (result) {
                                        if (telephone == '')
                                            telephone = result;
                                    }
                                }
                            }
                        }
                        if (email != '' && telephone != '') {
                            let to_return = {};

                            to_return['Telephone'] = telephone;
                            to_return['Email'] = email;

                            return to_return;
                        }

                        // search in 'p'
                        let ps = await divs[i].querySelectorAll('p');
                        if (ps.length) {
                            for (var j = 0; j < ps.length; j++) {
                                let text = ps[j].innerHTML.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                                if (text.indexOf('@') > -1) {
                                    let result = validationEmail(text);
                                    if (result) {
                                        if (email == '')
                                            email = result;
                                    }
                                }

                                if (text.length < 30 && text.length > 10) {
                                    let result = validationPhone(text);
                                    if (result) {
                                        if (telephone == '')
                                            telephone = result;
                                    }
                                }
                                else if (text.indexOf('tel:') > -1) {
                                    let result = validationPhone(text);
                                    if (result) {
                                        if (telephone == '')
                                            telephone = result;
                                    }
                                }
                            }
                        }
                        if (email != '' && telephone != '') {
                            let to_return = {};

                            to_return['Telephone'] = telephone;
                            to_return['Email'] = email;

                            return to_return;
                        }

                        // search in 'small'
                        let smalls = await divs[i].querySelectorAll('small');
                        if (smalls.length) {
                            for (var j = 0; j < smalls.length; j++) {
                                let text = smalls[j].innerHTML.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                                if (text.indexOf('@') > -1) {
                                    let result = validationEmail(text);
                                    if (result) {
                                        if (email == '')
                                            email = result;
                                    }
                                }

                                if (text.length < 30 && text.length > 10) {
                                    let result = validationPhone(text);
                                    if (result) {
                                        if (telephone == '')
                                            telephone = result;
                                    }
                                }
                                else if (text.indexOf('tel:') > -1) {
                                    let result = validationPhone(text);
                                    if (result) {
                                        if (telephone == '')
                                            telephone = result;
                                    }
                                }
                            }
                        }
                    }
                    let to_return = {};
                    to_return['Telephone'] = (telephone) ? telephone.trim() : '';
                    to_return['Email'] = (email) ? email.trim() : '';

                    return to_return;

                }, email, telephone)
                    .catch(async (err) => {
// console.log('Error Div: ' + err);
                        let to_return = {};
                        to_return['Telephone'] = telephone;
                        to_return['Email'] = email;
                        to_return['err'] = err.message;
                        return to_return;
                    });

                // console.log( '*** divs_contacts: ' );                                                            
                // console.log( divs_contacts); 

                // store scraped email and phone before continue to the next contact's page
                email = divs_contacts.Email;
                telephone = divs_contacts.Telephone;
                // close
                await resolve(divs_contacts);
                // await websitePage.close();
            })
            .catch(async (err) => {
// console.log('Error Opening a contact page: ' + err);
                let to_return = {};
                to_return['Telephone'] = (telephone) ? telephone.trim() : '';
                to_return['Email'] = (email) ? email.trim() : '';
                to_return['error'] = err.message;
                // await reject(to_return);
				await resolve(to_return);
                // return;
            });
        });

        async function crawlContactPageURLs() {
            
            // let url_contact_pages = [ 'contact' ];

            for (var i = 0; i < url_contact_pages.length; i++) {
                // creating the contact page url
                let ln = website_url.length
                let link = (website_url.split('').lastIndexOf('/') == (ln - 1))
                    ? website_url + url_contact_pages[i] : website_url + '/' + url_contact_pages[i];
// console.log(link);
                contact_page_datas = await pageContactPromise(link);
                // return phone number only
                // break if phone number found
                // if (contact_page_datas.email && contact_page_datas.telephone) {
                if (contact_page_datas.Email) {
// console.log('Email and phone found :' + contact_page_datas.email + ' - ' + contact_page_datas.telephone);
                    // dataObj['Phone'] = contact_page_datas.telephone;
                    dataObj['Email'] = contact_page_datas.Email;
                    break;
                }
                else{
                    dataObj['Email'] = '';
                }
            }
        }
        await crawlContactPageURLs();
        
        return dataObj;
    }
};
const outputData = await websiteInfo.getData(website_url);

await websitePage.close();
await browser.close();

console.log( JSON.stringify( outputData ) )  // print out data to STDOUT