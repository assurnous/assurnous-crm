

const puppeteer = require("puppeteer");
const fs = require("fs");
const { parse } = require("json2csv");

async function scrapeGoogleMaps() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const searchQuery = "coach sportif Angers";
    await page.goto(`https://www.google.com/maps/search/${searchQuery}`, { waitUntil: "networkidle2" });

    // Wait for initial results to load
    const resultSelector = ".Nv2PK"; // Adjusted class selector
    // await page.waitForSelector(resultSelector, { timeout: 600000 });
    await page.waitForSelector(resultSelector, "loading", { hidden: true, timeout: 10000 });

    let previousHeight = 0;
    let scrollAttempts = 0;
    const targetCoachCount = 200; // Target number of coaches
    const maxScrolls = 10000; // Max scroll attempts (increase this)
    const maxTimeLimit = 60 * 60 * 1000; // Set a time limit for scraping

    const startTime = Date.now();
    let scrapedCoaches = 0;

    // Scroll and scrape until we reach the target number of coaches or time limit
    while (scrapedCoaches < targetCoachCount && scrollAttempts < maxScrolls && Date.now() - startTime < maxTimeLimit) {
        console.log(`Scrolling... Attempt ${scrollAttempts + 1}, Coaches Found: ${scrapedCoaches}`);

        // Scroll down by 1000 pixels
        await page.evaluate(() => {
            document.querySelector(".m6QErb").scrollBy(0, 10000);
        });

        // Wait for new results to load (adjusted for better loading)
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 5 seconds after each scroll

        // Get the current height of the scroll container to determine if new content is loaded
        const newHeight = await page.evaluate(() => {
            return document.querySelector(".m6QErb").scrollHeight;
        });

        // Scrape data after scrolling
        const newResults = await page.evaluate(() => {
            let items = [];
            document.querySelectorAll(".Nv2PK").forEach((el) => {
                let name = el.querySelector(".qBF1Pd")?.textContent.trim();
                let phone = el.querySelector(".UsdlK")?.textContent.trim();
                let address = el.querySelector(".MW4etd")?.textContent.trim();
                if (name && phone && address) {
                    items.push({ name, phone, address });
                }
            });
            return items;
        });

        // Add new results to the scraped count
        scrapedCoaches += newResults.length;

        console.log(`Found ${newResults.length} new coaches. Total coaches scraped: ${scrapedCoaches}`);

        // Stop if no new content is loading
        if (newHeight === previousHeight && newResults.length === 0) {
            console.log("No new content loading and no new coaches found. Stopping scroll.");
            break;
        }

        // If we reach a "Load More" button, click it to load additional coaches
        const loadMoreButton = await page.$('button[jsaction="pane.paginationSection.loadMore"]');
        if (loadMoreButton) {
            console.log("Clicking 'Load More' button...");
            await loadMoreButton.click();
            await page.waitForTimeout(5000); // Wait for the results to reload
        }

        previousHeight = newHeight;
        scrollAttempts++;
    }

    console.log("Finished scrolling. Starting to scrape data...");

    // Scrape final data after scrolling
    const finalResults = await page.evaluate(() => {
        let items = [];
        document.querySelectorAll(".Nv2PK").forEach((el) => {
            let name = el.querySelector(".qBF1Pd")?.textContent.trim();
            let phone = el.querySelector(".UsdlK")?.textContent.trim();
            let address = el.querySelector(".MW4etd")?.textContent.trim();
            if (name && phone && address) {
                items.push({ name, phone, address });
            }
        });
        return items;
    });

    console.log(`Scraped ${finalResults.length} coaches in total.`);

    if (finalResults.length === 0) {
        console.log("⚠️ No data found. Check Google Maps page structure.");
        return;
    }

    // Save data to CSV
    const csv = parse(finalResults);
    fs.writeFileSync("coachesBBB.csv", csv, "utf8");
    console.log("✅ Data saved to coaches.csv");

    await browser.close();
}

scrapeGoogleMaps();



// const puppeteer = require('puppeteer');

// // Function to get all links on a page
// async function getAllLinks(page) {
//     return await page.evaluate(() => {
//         const links = [];
//         document.querySelectorAll('a').forEach((element) => {
//             const href = element.href;
//             if (href && !links.includes(href)) {
//                 links.push(href);
//             }
//         });
//         return links;
//     });
// }

// // Function to scrape data from a page
// async function scrapePageData(page) {
//     return await page.evaluate(() => {
//         const content = [];
//         // Scrape all paragraph texts (customize as needed)
//         document.querySelectorAll('p').forEach((element) => {
//             content.push(element.innerText.trim());
//         });
//         return content.join('\n');
//     });
// }

// // Main function to scrape all routes
// async function scrapeWebsiteData(baseUrl) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     const visited = new Set(); // To avoid revisiting the same page
//     const allData = []; // To store scraped data from all pages

//     // Queue for BFS (Breadth-First Search)
//     const queue = [baseUrl];

//     while (queue.length > 0) {
//         const url = queue.shift();

//         // Skip if already visited
//         if (visited.has(url)) continue;
//         visited.add(url);

//         console.log(`Scraping: ${url}`);

//         // Go to the page
//         try {
//             await page.goto(url, { waitUntil: 'networkidle2' });

//             // Scrape data from the page
//             const pageData = await scrapePageData(page);
//             allData.push({ url, data: pageData });

//             // Get all links on the page
//             const links = await getAllLinks(page);

//             // Add new links to the queue
//             for (const link of links) {
//                 if (
//                     link.startsWith(baseUrl) && // Ensure the link is within the same domain
//                     !visited.has(link) && // Skip if already visited
//                     !queue.includes(link) // Skip if already in the queue
//                 ) {
//                     queue.push(link);
//                 }
//             }
//         } catch (error) {
//             console.error(`Error scraping ${url}:`, error);
//         }
//     }

//     // Close the browser
//     await browser.close();

//     return allData;
// }

// // Scrape data from your website
// scrapeWebsiteData('https://www.koutquekout.com/')
//     .then((data) => {
//         console.log('Scraped Data:', JSON.stringify(data, null, 2));
//     })
//     .catch((error) => {
//         console.error('Error scraping data:', error);
//     });


// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const { parse } = require("json2csv");

// async function scrapeGoogleMaps() {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     const searchQuery = "coach sportif Bordeux";
//     await page.goto(`https://www.google.com/maps/search/${searchQuery}`, { waitUntil: "networkidle2" });

//     // Use an alternative to `waitForTimeout`
//     await new Promise(resolve => setTimeout(resolve, 100000)); // Wait for results to load

//     // Ensure the selector exists before proceeding
//     const resultSelector = ".Nv2PK"; // Adjusted class selector
//     await page.waitForSelector(resultSelector, { timeout: 100000 });

//     const results = await page.evaluate(() => {
//         let items = [];
//         document.querySelectorAll(".Nv2PK").forEach((el) => {
//             let name = el.querySelector(".qBF1Pd")?.textContent.trim();
//             let phone = el.querySelector(".UsdlK")?.textContent.trim();
//             if (name && phone) {
//                 items.push({ name, phone });
//             }
//         });
//         return items;
//     });

//     console.log(results);

//     if (results.length === 0) {
//         console.log("⚠️ No data found. Check Google Maps page structure.");
//         return;
//     }

//     // Save data to CSV
//     const csv = parse(results);
//     fs.writeFileSync("coachesP.csv", csv, "utf8");
//     console.log("✅ Data saved to coaches.csv");

//     await browser.close();
// }

// scrapeGoogleMaps();
























// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const { parse } = require("json2csv");

// async function scrapeGoogleMaps() {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     const searchQuery = "coach sportif Paris";
//     await page.goto(`https://www.google.com/maps/search/${searchQuery}`, { waitUntil: "networkidle2" });

//     // Wait for initial results to load
//     const resultSelector = ".Nv2PK"; // Adjusted class selector
//     await page.waitForSelector(resultSelector, { timeout: 600000 });

//     let previousHeight = 0;
//     let scrollAttempts = 0;
//     const maxScrolls = 20000; // Limit scroll attempts to avoid infinite loops
//     const maxTimeLimit = 60 * 60 * 1000; // Set a 30-minute maximum time for scraping

//     const startTime = Date.now();

//     // Scroll and scrape results until the time limit or max scrolls
//     while (scrollAttempts < maxScrolls && Date.now() - startTime < maxTimeLimit) {
//         console.log(`Scrolling... Attempt ${scrollAttempts + 1}`);

//         // Scroll down
//         await page.evaluate(() => {
//             document.querySelector(".m6QErb").scrollBy(0, 1000);
//         });

//         // Wait for new results to load
//         await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds after each scroll

//         // Get the current height of the scroll container
//         const newHeight = await page.evaluate(() => {
//             return document.querySelector(".m6QErb").scrollHeight;
//         });

//         // Stop if no new content is loading
//         if (newHeight === previousHeight) {
//             console.log("No new content loading. Stopping scroll.");
//             break;
//         }

//         previousHeight = newHeight;
//         scrollAttempts++;
//     }

//     console.log("Finished scrolling. Starting to scrape data...");

//     // Scrape data after scrolling
//     const results = await page.evaluate(() => {
//         let items = [];
//         document.querySelectorAll(".Nv2PK").forEach((el) => {
//             let name = el.querySelector(".qBF1Pd")?.textContent.trim();
//             let phone = el.querySelector(".UsdlK")?.textContent.trim();
//             if (name && phone) {
//                 items.push({ name, phone });
//             }
//         });
//         return items;
//     });

//     console.log(results);

//     if (results.length === 0) {
//         console.log("⚠️ No data found. Check Google Maps page structure.");
//         return;
//     }

//     // Save data to CSV
//     const csv = parse(results);
//     fs.writeFileSync("coachesP.csv", csv, "utf8");
//     console.log("✅ Data saved to coaches.csv");

//     await browser.close();
// }

// scrapeGoogleMaps();





const puppeteer = require("puppeteer");
const fs = require("fs");
const { parse } = require("json2csv");

async function scrapeGoogleMaps() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const searchQuery = "coach sportif Paris";
    await page.goto(`https://www.google.com/maps/search/${searchQuery}`, { waitUntil: "networkidle2" });

    // Wait for initial results to load
    const resultSelector = ".Nv2PK"; // Adjusted class selector
    // await page.waitForSelector(resultSelector, { timeout: 600000 });
    await page.waitForSelector(resultSelector, '.loading', { hidden: true, timeout: 10000 });

    let previousHeight = 0;
    let scrollAttempts = 0;
    const targetCoachCount = 1000; // Target number of coaches
    const maxScrolls = 10000; // Max scroll attempts (increase this)
    const maxTimeLimit = 60 * 60 * 1000; // Set a time limit for scraping

    const startTime = Date.now();
    let scrapedCoaches = 0;

    // Scroll and scrape until we reach the target number of coaches or time limit
    while (scrapedCoaches < targetCoachCount && scrollAttempts < maxScrolls && Date.now() - startTime < maxTimeLimit) {
        console.log(`Scrolling... Attempt ${scrollAttempts + 1}, Coaches Found: ${scrapedCoaches}`);

        // Scroll down by 1000 pixels
        await page.evaluate(() => {
            document.querySelector(".m6QErb").scrollBy(0, 1000);
        });

        // Wait for new results to load (adjusted for better loading)
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 5 seconds after each scroll

        // Get the current height of the scroll container to determine if new content is loaded
        const newHeight = await page.evaluate(() => {
            return document.querySelector(".m6QErb").scrollHeight;
        });

        // Scrape data after scrolling
        const newResults = await page.evaluate(() => {
            let items = [];
            document.querySelectorAll(".Nv2PK").forEach((el) => {
                let name = el.querySelector(".qBF1Pd")?.textContent.trim();
                let phone = el.querySelector(".UsdlK")?.textContent.trim();
                if (name && phone) {
                    items.push({ name, phone });
                }
            });
            return items;
        });

        // Add new results to the scraped count
        scrapedCoaches += newResults.length;

        console.log(`Found ${newResults.length} new coaches. Total coaches scraped: ${scrapedCoaches}`);

        // Stop if no new content is loading
        if (newHeight === previousHeight && newResults.length === 0) {
            console.log("No new content loading and no new coaches found. Stopping scroll.");
            break;
        }

        // If we reach a "Load More" button, click it to load additional coaches
        const loadMoreButton = await page.$('button[jsaction="pane.paginationSection.loadMore"]');
        if (loadMoreButton) {
            console.log("Clicking 'Load More' button...");
            await loadMoreButton.click();
            await page.waitForTimeout(5000); // Wait for the results to reload
        }

        previousHeight = newHeight;
        scrollAttempts++;
    }

    console.log("Finished scrolling. Starting to scrape data...");

    // Scrape final data after scrolling
    const finalResults = await page.evaluate(() => {
        let items = [];
        document.querySelectorAll(".Nv2PK").forEach((el) => {
            let name = el.querySelector(".qBF1Pd")?.textContent.trim();
            let phone = el.querySelector(".UsdlK")?.textContent.trim();
            if (name && phone) {
                items.push({ name, phone });
            }
        });
        return items;
    });

    console.log(`Scraped ${finalResults.length} coaches in total.`);

    if (finalResults.length === 0) {
        console.log("⚠️ No data found. Check Google Maps page structure.");
        return;
    }

    // Save data to CSV
    const csv = parse(finalResults);
    fs.writeFileSync("coachesP.csv", csv, "utf8");
    console.log("✅ Data saved to coaches.csv");

    await browser.close();
}

scrapeGoogleMaps();

