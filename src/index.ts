import { CotoScraper } from "./scrapers/CotoScraper.ts";

async function run() {
    console.log("Starting Coto Scraper...");
    const retailer = new CotoScraper();
    
    try {
        console.log("Searching for 'arroz'...");
        const productList = await retailer.searchProducts("arroz");
        
        console.log(`\nFound ${productList.products.length} products!`);
        console.log("--- FIRST 3 PRODUCTS ---");
        
        console.log(productList.products.slice(0, 3)); 

        if (productList.products.length > 0) {
            console.log("\nFetching details for the first product...");
            const firstProductId = productList.products[0]?.id;
            if (!firstProductId) {
                console.error("No product ID found");
                return;
            }
            
            // const productDetail = await retailer.getProductDetails(firstProductId);
            // console.log("--- PRODUCT DETAILS ---");
            // console.log(productDetail);
        }

    } catch (error) {
        console.error("Scraping failed:", error);
    }
}

run();